#!/usr/bin/env node
/* Keep crawler/no-JavaScript HTML aligned with the one public data registry. */
const fs = require('node:fs');
const path = require('node:path');
const siteData = require('../site-data.js');
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

function renderHtml(html, data = siteData) {
  const id = html.match(/<html\b[^>]*data-project="([^"]+)"/)?.[1];
  if (!id) return html;
  const project = data.projects[id];
  if (!project) throw new Error(`Bilinmeyen proje: ${id}`);
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
  return html.replace(/(<!-- video-timeline:start -->)[\s\S]*?(<!-- video-timeline:end -->)/,
    (_, start, end) => `${start}${timeline}${end}`);
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

module.exports = { changedFiles, renderHtml, validVideo };
