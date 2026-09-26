#!/usr/bin/env node
/* Dependency-free integrity checks for the static site. */
const fs = require('node:fs');
const path = require('node:path');
const siteData = require('../site-data.js');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html')).sort();
const errors = [];
const notices = [];

function fail(message) {
  errors.push(message);
}

function fileExists(reference) {
  const clean = reference.split('#')[0].split('?')[0];
  if (!clean) return true;
  const decoded = decodeURIComponent(clean);
  const relative = decoded.startsWith('/') ? decoded.slice(1) : decoded;
  return fs.existsSync(path.resolve(root, relative));
}

function metaContent(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const reversed = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped}["'][^>]*>`, 'i');
  return html.match(pattern)?.[1] || html.match(reversed)?.[1] || '';
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  [...new Set(duplicates)].forEach(id => fail(`${file}: yinelenen id="${id}"`));

  for (const match of html.matchAll(/\s(?:href|src)=["']([^"']*)["']/g)) {
    const reference = match[1].trim();
    if (!reference) {
      fail(`${file}: boş href/src bulundu`);
      continue;
    }
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) continue;
    if (!fileExists(reference)) fail(`${file}: eksik yerel varlık veya bağlantı: ${reference}`);
  }

  for (const match of html.matchAll(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/gi)) {
    const image = match[1];
    if (image.startsWith(siteData.canonicalOrigin)) {
      const pathname = new URL(image).pathname.slice(1);
      if (!fileExists(pathname)) fail(`${file}: og:image canlıda karşılığı olmayan dosya: ${image}`);
    } else if (!/^https:\/\//i.test(image) && !fileExists(image)) {
      fail(`${file}: og:image dosyası bulunamadı: ${image}`);
    }
  }

  const localTargets = [...html.matchAll(/href=["']#([^"']+)["']/g)].map(match => match[1]);
  localTargets.forEach(id => {
    if (!ids.includes(id)) fail(`${file}: bölüm bağlantısı hedefi bulunamadı: #${id}`);
  });
}

const canonicalExpectations = {
  'index.html': `${siteData.canonicalOrigin}/`,
  'rehberler.html': `${siteData.canonicalOrigin}/rehberler`,
  'machiavelli.html': `${siteData.canonicalOrigin}/machiavelli`
};

for (const [file, expected] of Object.entries(canonicalExpectations)) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1];
  if (canonical !== expected) fail(`${file}: canonical beklenen adresle eşleşmiyor (${canonical || 'eksik'})`);

  const ogUrl = metaContent(html, 'property', 'og:url');
  if (ogUrl !== expected) fail(`${file}: og:url beklenen adresle eşleşmiyor (${ogUrl || 'eksik'})`);
}

const machiavelliHtml = fs.readFileSync(path.join(root, 'machiavelli.html'), 'utf8');
if (!machiavelliHtml.includes('data-project-phase')) fail('machiavelli.html: deney aşaması bileşeni eksik');
if (!machiavelliHtml.includes('data-reading-progress')) fail('machiavelli.html: okuma ilerleme göstergesi eksik');
if (!machiavelliHtml.includes('site-data.js') || !machiavelliHtml.includes('project.js')) {
  fail('machiavelli.html: merkezî veri veya proje davranış betiği eksik');
}
if (/seven-day-guide|takip-promptu|gunluk-sablon/.test(machiavelliHtml)) {
  fail('machiavelli.html: henüz yayımlanmaması gereken eski rehber içeriği canlı HTML içinde bulundu');
}

for (const project of Object.values(siteData.projects)) {
  if (!project.id || !project.slug || !project.title || !project.summary) {
    fail('site-data.js: proje kimliği, slug, başlık veya özet eksik');
  }
  if (!siteData.phases.some(phase => phase.id === project.phase)) {
    fail(`${project.id}: bilinmeyen deney aşaması: ${project.phase}`);
  }
  if (!Array.isArray(project.topics) || !project.topics.length || typeof project.searchable !== 'boolean') {
    fail(`${project.id}: gelecekteki arama için topics/searchable alanları eksik`);
  }
  if (project.video.published) {
    if (!/^https:\/\/(?:www\.|m\.)?youtube\.com\//.test(project.video.url) && !/^https:\/\/youtu\.be\//.test(project.video.url)) {
      fail(`${project.id}: yayımlanmış video için geçerli YouTube URL'si gerekli`);
    }
    if (!project.video.title) fail(`${project.id}: yayımlanmış video başlığı eksik`);
  } else if (project.video.url || project.video.title || project.video.chapters.length) {
    fail(`${project.id}: video yayımlanmadan URL, başlık veya zaman kodu istemci verisine konmamalı`);
  }
  if (project.video.thumbnail.src) {
    if (!project.video.thumbnail.alt) fail(`${project.id}: kapak alternatif metni eksik`);
    if (!fileExists(project.video.thumbnail.src)) fail(`${project.id}: kapak dosyası bulunamadı`);
  }
  if (!project.result.published && (project.result.summary || project.result.limitations.length)) {
    fail(`${project.id}: sonuç yayımlanmadan sonuç verisi istemciye konmamalı`);
  }
  if (!project.features.evidenceLedger && (project.evidence.published || project.evidence.entries.length)) {
    fail(`${project.id}: kapalı Kanıt Defteri istemci verisi içermemeli`);
  }
  if (!project.features.videoTimeline && project.video.chapters.length) {
    fail(`${project.id}: kapalı video zaman çizelgesi bölüm verisi içermemeli`);
  }
  if (!project.features.tryIt && (project.tryIt.enabled || project.tryIt.rules.length || project.tryIt.guide)) {
    fail(`${project.id}: kapalı Kendin Dene modu yayımlanmamış kural veya rehber içermemeli`);
  }
  if (project.features.tryIt && (!project.tryIt.enabled || !project.tryIt.rules.length || !project.tryIt.guide)) {
    fail(`${project.id}: Kendin Dene etkinse kurallar ve rehber zorunlu`);
  }
}

notices.push(`${htmlFiles.length} HTML sayfası, yerel bağlantılar, kimlikler, canonical alanları ve yayın kapıları denetlendi.`);
notices.forEach(message => console.log(`✓ ${message}`));

if (errors.length) {
  errors.forEach(message => console.error(`✗ ${message}`));
  process.exitCode = 1;
} else {
  console.log('✓ Site veri modeli ve statik bütünlük kontrolleri temiz.');
}
