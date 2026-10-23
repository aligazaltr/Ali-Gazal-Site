#!/usr/bin/env node
/* Keep crawler/no-JavaScript HTML aligned with the one public data registry. */
const fs = require('node:fs');
const path = require('node:path');
const siteData = require('../site-data.js');
const { signature } = require('./render-scenes.js');
const root = path.resolve(__dirname, '..');

function escape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(project, field) {
  const value = field.split('.').reduce((current, key) => current?.[key], project);
  if (!['string', 'number'].includes(typeof value)) throw new Error(`Eksik veri alanı: ${field}`);
  return value;
}

function validVideo(video) {
  try {
    const url = new URL(video.url);
    return video.title?.trim() && url.protocol === 'https:'
      && ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)
      && (url.hostname === 'youtu.be' ? /^\/[A-Za-z0-9_-]{11}$/.test(url.pathname)
        : url.pathname === '/watch' && /^[A-Za-z0-9_-]{11}$/.test(url.searchParams.get('v') || ''));
  } catch (_) {
    return false;
  }
}

function secondsLabel(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}

const researchStates = { completed: 'Tamamlandı', 'in-progress': 'Devam ediyor', 'not-started': 'Henüz başlamadı' };
function validateResearch(project) {
  if (!project.research) return;
  const stages = project.research.stages;
  if (!Array.isArray(stages) || stages.length !== 4 || new Set(stages.map(stage => stage.id)).size !== 4
    || stages.some(stage => !/^[a-z0-9-]+$/.test(stage.id) || !researchStates[stage.status] || !stage.title || !stage.description || !stage.goal)
    || stages.filter(stage => stage.status === 'in-progress').length > 1) {
    throw new Error(`${project.id}: dört geçerli araştırma aşaması gerekli`);
  }
  let unfinished = false;
  for (const stage of stages) {
    if (unfinished && stage.status !== 'not-started') throw new Error(`${project.id}: araştırma aşamaları sırayla ilerlemeli`);
    if (stage.status !== 'completed') unfinished = true;
  }
  if ((project.video.productionStatus === 'preparing' || project.video.published) && !stages.every(stage => stage.status === 'completed')) {
    throw new Error(`${project.id}: video hazırlığı öncesinde dört araştırma aşaması tamamlanmalı`);
  }
}

function renderProjectPreview(project) {
  if (!project) throw new Error('Önizleme için proje bulunamadı');
  validateResearch(project);
  const label = project.video.published ? 'VİDEO YAYINDA' : project.video.productionStatus === 'preparing' ? 'VİDEO HAZIRLIĞI' : 'SIRADAKİ PROJEMİZ';
  return `<div class="research-preview" data-project="${escape(project.id)}"><div><p class="eyebrow">${label}</p><p class="research-source">${escape(project.shortTitle)}</p><h2 id="siradaki-proje">${escape(project.title)}</h2><p class="research-description">${escape(project.summary)}</p><a class="text-link" href="${escape(project.slug)}.html">Araştırma dosyasını incele <span aria-hidden="true">→</span></a></div><aside class="research-preview-state" aria-label="Projenin güncel durumu"><p class="eyebrow">ŞİMDİ NEREDEYİZ?</p><p class="research-current">${escape(project.display.currentStage)}</p><p>${escape(project.statusLabel)}</p><p>${escape(project.research.publicationLabel)}</p><small>${escape(project.duration.label)} · ${escape(project.display.experimentState)}</small></aside></div>`;
}

function renderResearchStages(project) {
  validateResearch(project);
  return project.research.stages.map((stage, i) => `<li class="research-stage is-${stage.status}" data-research-stage="${escape(stage.id)}"${stage.status === 'in-progress' ? ' aria-current="step"' : ''}><span class="research-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${escape(stage.title)}</h3><p>${escape(stage.description)}</p><p class="research-goal"><strong>Hedef:</strong> ${escape(stage.goal)}</p></div><span class="research-state">${researchStates[stage.status]}</span></li>`).join('\n');
}

function renderStory(story) {
  if (!story || story.scenes.length < 3) throw new Error('Hikâye için en az üç gerçek sahne gerekli');
  const first = story.scenes[0];
  return `<div class="section-heading story-arrival" data-scroll-track="arrival"><span class="journey-trace" aria-hidden="true"></span><p class="eyebrow">${escape(story.label)}</p><h2 id="hikaye-baslik">${escape(story.title)}</h2></div>
  <div class="story-layout" data-story data-scene="0">
    <div class="story-visual" aria-hidden="true">
      <p class="story-counter"><span data-story-number>01</span> / ${String(story.scenes.length).padStart(2, '0')} <span>MERAKTAN GERÇEK HAYATA</span></p>
      ${signature()}
      <div class="story-word-window"><span class="story-word-exit"></span><p class="story-word" data-story-label>${escape(first.label)}</p></div>
      <p class="story-caption" data-story-caption>${escape(first.title)}</p>
      <p class="story-description" data-story-description>${escape(first.description)}</p>
      <div class="story-ticks">${story.scenes.map(() => '<span></span>').join('')}</div>
    </div>
    <div class="story-scenes">${story.scenes.map((scene, i) => `<article class="story-scene" data-story-scene id="hikaye-${escape(scene.id)}"><div class="story-scene-heading"><p class="eyebrow"><span class="scene-number">${String(i + 1).padStart(2, '0')}</span> <span class="scene-label">${escape(scene.label)}</span></p>${signature(i, true)}</div><div class="reveal-mask"><h3>${escape(scene.title)}</h3></div><p class="scene-description">${escape(scene.description)}</p><p class="story-note">${escape(scene.note)}</p></article>`).join('')}</div>
  </div>`;
}

function renderHtml(html, data = siteData) {
  const id = html.match(/<html\b[^>]*data-project="([^"]+)"/)?.[1];
  if (!id) return html;
  html = html.replace(/(<!-- experience:intro:start -->)[\s\S]*?(<!-- experience:intro:end -->)/,
    (_, start, end) => `${start}<p class="cinema-words" aria-label="${escape(data.experience.intro.join(' '))}">${data.experience.intro.map(word => `<span class="word-window" aria-hidden="true"><span class="cinema-word">${escape(word)}</span></span>`).join('')}</p><p class="cinema-tagline">${escape(data.experience.tagline)}</p>${end}`);
  html = html.replace(/(<!-- experience:story:([a-z0-9-]+):start -->)[\s\S]*?(<!-- experience:story:\2:end -->)/,
    (_, start, key, end) => `${start}${renderStory(data.experience.stories[key])}${end}`);
  const project = data.projects[id];
  if (!project) throw new Error(`Bilinmeyen proje: ${id}`);
  validateResearch(project);
  if (project.video.published && (!validVideo(project.video)
    || !/^\d{4}-\d{2}-\d{2}$/.test(project.publishedAt || '')
    || !Number.isInteger(project.video.durationSeconds) || project.video.durationSeconds <= 0)) {
    throw new Error(`${id}: yayın için gerçek YouTube URL'si, başlık, tarih ve süre zorunlu`);
  }

  html = html.replace(/<([a-z][\w:-]*)([^>]*\sdata-project-field="([^"]+)"[^>]*)>([^<]*)<\/\1>/gi,
    (_, tag, attributes, field) => `<${tag}${attributes}>${escape(read(project, field))}</${tag}>`);

  html = html.replace(/<meta\b[^>]*\sdata-project-content(-absolute)?="([^"]+)"[^>]*>/gi,
    (tag, absolute, field) => {
      const value = read(project, field);
      const content = absolute ? new URL(value, `${data.canonicalOrigin}/`).href : value;
      return tag.replace(/\scontent="[^"]*"/, () => ` content="${escape(content)}"`);
    });

  html = html.replace(/<time([^>]*\sdata-project-date="([^"]+)"[^>]*)>[^<]*<\/time>/gi,
    (_, attributes, field) => {
      const date = read(project, field);
      const label = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
      return `<time${attributes.replace(/datetime="[^"]*"/, `datetime="${escape(date)}"`)}>${label}</time>`;
    });

  // Cover markers belong to a page's current project. Width/height reserve its
  // space before scripts or the image load, and make the cover usable without JS.
  const thumbnail = project.video.thumbnail;
  html = html.replace(/(<!-- project-cover:start -->)[\s\S]*?(<!-- project-cover:end -->)/g,
    (match, start, end, offset) => {
      const openingTag = html.slice(0, offset).match(/<[^>]+data-project-cover[^>]*>\s*$/)?.[0] || '';
      const high = openingTag.includes('data-cover-priority="high"');
      const image = thumbnail.src && thumbnail.alt
        ? `<img class="project-cover" src="${escape(thumbnail.src)}" alt="${escape(thumbnail.alt)}" width="${thumbnail.width}" height="${thumbnail.height}" loading="${high ? 'eager' : 'lazy'}"${high ? ' fetchpriority="high"' : ''} decoding="async">`
        : '';
      return `${start}${image}${end}`;
    });

  const currentIndex = data.phases.findIndex(phase => phase.id === project.phase);
  html = html.replace(/<li([^>]*\sdata-phase="([^"]+)"[^>]*)>([\s\S]*?)<\/li>/g,
    (_, attributes, phaseId, contents) => {
      const index = data.phases.findIndex(phase => phase.id === phaseId);
      const state = index < currentIndex ? 'is-complete' : index === currentIndex ? 'is-current' : 'is-next';
      const label = index < currentIndex ? 'Geçildi' : index === currentIndex ? 'Şu an' : 'Sırada';
      attributes = attributes.replace(/\sclass="[^"]*"/, '').replace(/\saria-current="[^"]*"/, '');
      contents = contents.replace(/(<span\b[^>]*data-phase-state[^>]*>)[\s\S]*?(<\/span>)/, `$1${label}$2`);
      return `<li class="${state}"${attributes}${index === currentIndex ? ' aria-current="step"' : ''}>${contents}</li>`;
    });

  // Public evidence remains readable without JavaScript, from the same registry.
  const entries = project.features.evidenceLedger && project.evidence.published
    ? project.evidence.entries.filter(entry => entry.public !== false) : [];
  const cards = entries.map(entry => {
    const details = [
      ['İlgili ilke', entry.principle], ['Kayıt zamanı', entry.recordedAt],
      ['Desteklediği', entry.supports], ['Kanıtlamadığı', entry.doesNotProve]
    ].filter(([, value]) => value).map(([label, value]) =>
      `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('');
    return `<article class="evidence-card"><div class="evidence-meta"><span>${escape(entry.dayLabel || entry.dateLabel || 'Kayıt')}</span><span class="evidence-type">${escape(entry.evidenceType)}</span></div><h3>${escape(entry.title)}</h3><p>${escape(entry.summary)}</p><dl class="evidence-details">${details}</dl></article>`;
  }).join('\n            ');
  html = html.replace(/<section\b[^>]*\bdata-evidence-ledger[^>]*>[\s\S]*?<\/section>/,
    () => entries.length
      ? `<section id="kanit-defteri" data-evidence-ledger class="feature-panel evidence-ledger" aria-labelledby="kanit-defteri-baslik">\n            <p class="eyebrow">KANIT DEFTERİ</p>\n            <h2 id="kanit-defteri-baslik">Kayıt neyi gösteriyor, neyi göstermiyor?</h2>\n            <p class="feature-intro">B ve C etiketleri kayıt zamanını gösterir; olayların bağımsız olarak kanıtlandığı anlamına gelmez.</p>\n            <div class="evidence-list">${cards}</div>\n          </section>`
      : '<section id="kanit-defteri" data-evidence-ledger aria-label="Kanıt Defteri"></section>');

  const video = project.video;
  const videoLink = video.published
    ? `<a class="button primary" href="${escape(video.url)}" target="_blank" rel="noopener noreferrer">YouTube’da videoyu izle ↗</a>`
    : '<a class="text-link" href="https://www.youtube.com/@aligazaltr" target="_blank" rel="noopener noreferrer">YouTube kanalını aç <span aria-hidden="true">↗</span></a>';
  html = html.replace(/(<!-- video-panel:start -->)[\s\S]*?(<!-- video-panel:end -->)/,
    (_, start, end) => `${start}\n            <p class="eyebrow">${video.published ? 'VİDEO YAYINDA' : 'VİDEO DURUMU'}</p>\n            <h2>${escape(project.display.videoPanelTitle)}</h2>\n            <p>${escape(project.display.videoPanelDescription)}</p>\n            ${videoLink}\n            ${end}`);

  let timeline = '';
  if (video.published && project.features.videoTimeline && video.chapters.length) {
    const links = video.chapters.map(chapter => {
      const url = new URL(video.url);
      url.searchParams.set('t', String(chapter.seconds));
      return `<li><a class="timeline-link" href="${escape(url.href)}" target="_blank" rel="noopener noreferrer"><span class="timeline-time">${secondsLabel(chapter.seconds)}</span><span class="timeline-copy"><strong>${escape(chapter.label)}</strong>${chapter.description ? `<small>${escape(chapter.description)}</small>` : ''}</span><span class="timeline-arrow" aria-hidden="true">↗</span></a></li>`;
    }).join('');
    timeline = `<section class="feature-panel video-timeline" id="video-zaman-cizelgesi" aria-labelledby="video-zaman-cizelgesi-baslik"><p class="eyebrow">VİDEO ZAMAN ÇİZELGESİ</p><h2 id="video-zaman-cizelgesi-baslik">Doğrudan ilgili bölüme git.</h2><ol class="timeline-list">${links}</ol></section>`;
  }
  html = html.replace(/(<!-- video-timeline:start -->)[\s\S]*?(<!-- video-timeline:end -->)/,
    (_, start, end) => `${start}${timeline}${end}`);
  html = html.replace(/(<!-- project-preview:([a-z0-9-]+):start -->)[\s\S]*?(<!-- project-preview:\2:end -->)/g,
    (_, start, id, end) => `${start}${renderProjectPreview(data.projects[id])}${end}`);
  return html.replace(/(<!-- research-stages:start -->)[\s\S]*?(<!-- research-stages:end -->)/,
    (_, start, end) => `${start}${renderResearchStages(project)}${end}`);
}

function changedFiles() {
  return fs.readdirSync(root).filter(file => file.endsWith('.html')).flatMap(file => {
    const current = fs.readFileSync(path.join(root, file), 'utf8');
    const next = renderHtml(current);
    return current === next ? [] : [{ file, next }];
  });
}

if (require.main === module) {
  try {
    const changes = changedFiles();
    if (process.argv.includes('--check')) {
      if (changes.length) throw new Error(`Veri/HTML eşleşmiyor: ${changes.map(item => item.file).join(', ')}. node scripts/sync-site.js çalıştır.`);
      console.log('✓ Merkezî veri ve statik HTML eşleşiyor.');
    } else {
      changes.forEach(({ file, next }) => fs.writeFileSync(path.join(root, file), next));
      console.log(`✓ ${changes.length} HTML dosyası merkezî veriden güncellendi.`);
    }
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { changedFiles, renderHtml, validVideo, validateResearch };
