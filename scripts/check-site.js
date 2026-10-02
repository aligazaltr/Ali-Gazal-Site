#!/usr/bin/env node
/* Dependency-free integrity checks for the static site. */
const fs = require('node:fs');
const path = require('node:path');
const siteData = require('../site-data.js');
const { changedFiles, validVideo } = require('./sync-site.js');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html')).sort();
const errors = [];
const notices = [];

function fail(message) {
  errors.push(message);
}

try {
  changedFiles().forEach(({ file }) => fail(`${file}: merkezî veriyle eşleşmiyor; node scripts/sync-site.js çalıştır`));
} catch (error) {
  fail(error.message);
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

function textContent(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (!html.includes('<html lang="tr"')) fail(`${file}: Türkçe sayfa dili eksik`);
  if ((html.match(/<h1\b/g) || []).length !== 1) fail(`${file}: tek bir h1 gerekli`);
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
  'machiavelli.html': `${siteData.canonicalOrigin}/machiavelli`,
  'hakkimda.html': `${siteData.canonicalOrigin}/hakkimda`
};

for (const [file, expected] of Object.entries(canonicalExpectations)) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1];
  if (canonical !== expected) fail(`${file}: canonical beklenen adresle eşleşmiyor (${canonical || 'eksik'})`);

  const ogUrl = metaContent(html, 'property', 'og:url');
  if (ogUrl !== expected) fail(`${file}: og:url beklenen adresle eşleşmiyor (${ogUrl || 'eksik'})`);
  ['og:title', 'og:description', 'og:site_name', 'og:locale'].forEach(property => {
    if (!metaContent(html, 'property', property)) fail(`${file}: ${property} eksik`);
  });
  ['description', 'twitter:card', 'twitter:title', 'twitter:description'].forEach(name => {
    if (!metaContent(html, 'name', name)) fail(`${file}: ${name} eksik`);
  });
}

const machiavelliHtml = fs.readFileSync(path.join(root, 'machiavelli.html'), 'utf8');
const machiavelliText = textContent(machiavelliHtml);
if (!machiavelliHtml.includes('data-project-phase')) fail('machiavelli.html: deney aşaması bileşeni eksik');
if (!machiavelliHtml.includes('data-reading-progress')) fail('machiavelli.html: okuma ilerleme göstergesi eksik');
if (!machiavelliHtml.includes('site-data.js') || !machiavelliHtml.includes('project.js')) {
  fail('machiavelli.html: merkezî veri veya proje davranış betiği eksik');
}
if (/seven-day-guide|takip-promptu|gunluk-sablon/.test(machiavelliHtml)) {
  fail('machiavelli.html: henüz yayımlanmaması gereken eski rehber içeriği canlı HTML içinde bulundu');
}

const machiavelli = siteData.projects.machiavelli;
if (!machiavelli.video.published && machiavelli.phase !== 'reviewing') fail('machiavelli: video öncesi aşama reviewing / İnceleniyor olmalı');
if (!machiavelli.video.published && machiavelli.statusLabel !== 'Deney tamamlandı · video hazırlanıyor') {
  fail('machiavelli: görünür durum metni güncel değil');
}
if (machiavelli.completedAt !== '2026-09-27' || !/^\d{4}-\d{2}-\d{2}$/.test(machiavelli.lastUpdated) || machiavelli.lastUpdated < machiavelli.completedAt) {
  fail('machiavelli: tamamlanma ve son güncelleme tarihleri eksik veya yanlış');
}
if (!Array.isArray(machiavelli.principles) || machiavelli.principles.length !== 3) {
  fail('machiavelli: tam üç kamuya açık ilke gerekli');
} else {
  machiavelli.principles.forEach(principle => {
    if (!principle.title || !principle.rule) fail('machiavelli: ilke başlığı veya davranış kuralı eksik');
    if (!machiavelliText.includes(principle.title) || !machiavelliText.includes(principle.rule)) {
      fail(`machiavelli.html: merkezî ilke statik içerikle eşleşmiyor (${principle.title || 'başlıksız'})`);
    }
  });
}
if (!machiavelli.result.published || !machiavelliText.includes(machiavelli.result.summary)) {
  fail('machiavelli.html: yayımlanmış kısa sonuç merkezî veriyle eşleşmiyor');
}
if (!machiavelli.features.evidenceLedger || !machiavelli.evidence.published || machiavelli.evidence.entries.length !== 4) {
  fail('machiavelli: Kanıt Defteri yalnız dört onaylı kayıtla açık olmalı');
}
if (!machiavelli.video.published && (machiavelli.video.url || machiavelli.video.title || machiavelli.video.chapters.length || machiavelli.publishedAt || machiavelli.video.durationSeconds)) {
  fail('machiavelli: video yayımlanmadan video alanları kapalı ve boş kalmalı');
}
if (!machiavelli.video.published && (machiavelli.features.videoTimeline || machiavelli.features.tryIt || machiavelli.tryIt.enabled)) {
  fail('machiavelli: video öncesi zaman çizelgesi ve Kendin Dene kapalı kalmalı');
}

const expectedImage = `${siteData.canonicalOrigin}/${machiavelli.video.thumbnail.src}`;
const expectedMeta = {
  'og:title': machiavelli.sharing.title,
  'og:description': machiavelli.sharing.description,
  'og:image': expectedImage,
  'og:image:secure_url': expectedImage,
  'og:image:type': 'image/jpeg',
  'og:image:width': String(machiavelli.video.thumbnail.width),
  'og:image:height': String(machiavelli.video.thumbnail.height),
  'og:image:alt': machiavelli.video.thumbnail.alt
};
for (const [property, expected] of Object.entries(expectedMeta)) {
  const actual = metaContent(machiavelliHtml, 'property', property);
  if (actual !== expected) fail(`machiavelli.html: ${property} merkezî veriyle eşleşmiyor`);
}
if (metaContent(machiavelliHtml, 'name', 'twitter:card') !== 'summary_large_image') {
  fail('machiavelli.html: twitter:card summary_large_image olmalı');
}
if (metaContent(machiavelliHtml, 'name', 'twitter:image') !== expectedImage) {
  fail('machiavelli.html: twitter:image final kapakla eşleşmiyor');
}
if (metaContent(machiavelliHtml, 'name', 'twitter:image:alt') !== machiavelli.video.thumbnail.alt) {
  fail('machiavelli.html: twitter:image:alt merkezî veriyle eşleşmiyor');
}

const thumbnailPath = path.join(root, machiavelli.video.thumbnail.src);
if (fs.existsSync(thumbnailPath)) {
  const thumbnail = fs.readFileSync(thumbnailPath);
  if (thumbnail[0] !== 0xff || thumbnail[1] !== 0xd8 || thumbnail.at(-2) !== 0xff || thumbnail.at(-1) !== 0xd9) {
    fail('machiavelli: final kapak geçerli JPEG imzası taşımıyor');
  }
  if (thumbnail.byteLength > 500 * 1024) fail('machiavelli: final kapak 500 KB sınırını aşıyor');
}

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${siteData.canonicalOrigin}/sitemap.xml`)) {
  fail('robots.txt: gerçek sitemap adresi eksik');
}
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
[
  `${siteData.canonicalOrigin}/`,
  `${siteData.canonicalOrigin}/rehberler`,
  `${siteData.canonicalOrigin}/hakkimda`,
  `${siteData.canonicalOrigin}/machiavelli`
].forEach(url => {
  if (!sitemap.includes(`<loc>${url}</loc>`)) fail(`sitemap.xml: URL eksik (${url})`);
});
if (/404|marcus-aurelius/.test(sitemap)) fail('sitemap.xml: 404 veya Marcus yönlendirmesi eklenmemeli');
const assetsIgnore = fs.readFileSync(path.join(root, '.assetsignore'), 'utf8');
if (!assetsIgnore.includes('!/robots.txt') || !assetsIgnore.includes('!/sitemap.xml')) {
  fail('.assetsignore: robots.txt ve sitemap.xml dağıtım izinleri eksik');
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
    if (!validVideo(project.video)) {
      fail(`${project.id}: yayımlanmış video için geçerli YouTube URL'si gerekli`);
    }
    if (!project.video.title) fail(`${project.id}: yayımlanmış video başlığı eksik`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(project.publishedAt || '')) fail(`${project.id}: yayın tarihi eksik`);
    if (!Number.isInteger(project.video.durationSeconds) || project.video.durationSeconds <= 0) fail(`${project.id}: geçerli video süresi eksik`);
    if (project.phase !== 'published') fail(`${project.id}: yayımlanmış video aşaması tutarsız`);
    project.video.chapters.forEach((chapter, index, chapters) => {
      if (!chapter.label || !Number.isInteger(chapter.seconds) || chapter.seconds < 0
        || chapter.seconds >= project.video.durationSeconds || (index && chapter.seconds <= chapters[index - 1].seconds)) {
        fail(`${project.id}: bölüm zamanları artmalı ve video süresi içinde kalmalı`);
      }
    });
  } else if (project.video.url || project.video.title || project.video.chapters.length || project.publishedAt || project.video.durationSeconds) {
    fail(`${project.id}: video yayımlanmadan URL, başlık, tarih, süre veya zaman kodu istemci verisine konmamalı`);
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
