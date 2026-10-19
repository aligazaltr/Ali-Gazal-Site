#!/usr/bin/env node
/* Publish an allowlisted, verified subset; never ship the editorial source. */
const fs = require('node:fs');
const path = require('node:path');
const core = require('../archive-core.js');
const siteData = require('../site-data.js');
const { validVideo } = require('./sync-site.js');
const root = path.resolve(__dirname, '..');
const sourceData = require('../content/archive.json');
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const text = value => typeof value === 'string' && Boolean(value.trim());
const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value))
  && new Date(value).toISOString().slice(0, 10) === value;
const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function validate(source, site = siteData) {
  const errors = [];
  function checkRows(rows, name) {
    if (!Array.isArray(rows)) throw new Error(`${name}: dizi gerekli`);
    for (const key of ['id', 'slug']) {
      const values = rows.map(row => row[key]).filter(value => value !== undefined);
      if (values.some(value => !slug.test(value)) || new Set(values).size !== values.length) errors.push(`${name}: ${key} geçersiz veya yinelenmiş`);
    }
    rows.forEach(row => { if (!slug.test(row.id)) errors.push(`${name}: kimlik gerekli`); });
  }
  for (const name of ['authors', 'books', 'categories', 'quotes', 'originalInsights']) checkRows(source[name], name);
  const entries = [...source.quotes, ...source.originalInsights];
  checkRows(entries, 'tüm düşünceler');
  const authors = new Map(source.authors.map(row => [row.id, row]));
  const books = new Map(source.books.map(row => [row.id, row]));
  const categories = new Set(source.categories.map(row => row.id));
  for (const author of source.authors) if (!text(author.name)) errors.push(`${author.id}: yazar adı gerekli`);
  for (const category of source.categories) if (!text(category.name)) errors.push(`${category.id}: kategori adı gerekli`);
  for (const book of source.books) {
    if (!authors.has(book.authorId) || !text(book.title)) errors.push(`${book.id}: kitap/yazar ilişkisi eksik`);
  }
  for (const project of Object.values(site.projects)) {
    if (project.source.bookId && !books.has(project.source.bookId)) errors.push(`${project.id}: bilinmeyen arşiv kitabı`);
  }
  for (const entry of entries) {
    const original = entry.kind === 'original-insight';
    const book = books.get(entry.bookId);
    if (!slug.test(entry.slug) || !core.kinds[entry.kind]) errors.push(`${entry.id}: tür/URL kimliği geçersiz`);
    if (!['draft', 'published', 'archived'].includes(entry.status)) errors.push(`${entry.id}: yayın durumu geçersiz`);
    if ((!original || entry.bookId) && (!book || book.authorId !== entry.authorId)) errors.push(`${entry.id}: kitap/yazar ilişkisi geçersiz`);
    if (!Array.isArray(entry.categoryIds) || entry.categoryIds.some(id => !categories.has(id))) errors.push(`${entry.id}: kategori ilişkisi geçersiz`);
    if (!Array.isArray(entry.tags) || entry.tags.some(tag => typeof tag !== 'string')) errors.push(`${entry.id}: etiketler geçersiz`);
    for (const ref of entry.videoRefs || []) {
      if (!site.projects[ref.projectId]) errors.push(`${entry.id}: bilinmeyen proje ilişkisi`);
      if (ref.seconds !== null && ref.seconds !== undefined && (!Number.isInteger(ref.seconds) || ref.seconds < 0)) errors.push(`${entry.id}: zaman damgası geçersiz`);
    }
    if (entry.status !== 'published') continue;
    if (!text(entry.text) || !text(entry.textLanguage) || !date(entry.publishedAt)) errors.push(`${entry.id}: metin/dil/yayın tarihi gerekli`);
    if (entry.verification?.status !== 'verified' || !text(entry.verification.checkedBy)
      || !date(entry.verification.checkedAt) || !text(entry.verification.evidence)) errors.push(`${entry.id}: kaynak doğrulaması tamamlanmamış`);
    if (entry.rights?.status !== 'approved' || !text(entry.rights.basis)) errors.push(`${entry.id}: kullanım hakkı değerlendirmesi tamamlanmamış`);
    if (original) {
      if (!text(entry.credit) || !text(entry.title)) errors.push(`${entry.id}: özgün düşüncede başlık ve yazar kredisi gerekli`);
    } else {
      const source = entry.source || {};
      if (!text(source.language) || (!text(source.page) && !text(source.locator))) errors.push(`${entry.id}: baskıya özgü sayfa veya bölüm konumu gerekli`);
      if (!text(source.publisher) || !text(source.edition)) errors.push(`${entry.id}: yayınevi/baskı bilgisi gerekli`);
      if (source.url && !core.safeHttps(source.url)) errors.push(`${entry.id}: kaynak URL'si güvenli HTTPS olmalı`);
      if (entry.kind === 'direct-quote' && book?.originalLanguage !== source.language && !text(source.translator)) errors.push(`${entry.id}: çeviri baskısında çevirmen gerekli`);
      if (entry.kind === 'free-translation' && (!text(source.originalText) || !text(source.translator))) errors.push(`${entry.id}: serbest çeviride kaynak metin ve çeviren gerekli`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

function publicData(source = sourceData, site = siteData) {
  validate(source, site);
  const books = source.books.map(book => ({ id: book.id, slug: book.slug, title: book.title,
    originalTitle: book.originalTitle, authorId: book.authorId, focus: book.focus,
    projectIds: Object.values(site.projects).filter(project => project.source.bookId === book.id).map(project => project.id) }));
  const projects = Object.values(site.projects).filter(project => books.some(book => book.projectIds.includes(project.id)))
    .map(project => ({ id: project.id, slug: project.slug, title: project.shortTitle, statusLabel: project.statusLabel,
      bookId: project.source.bookId, thumbnail: project.video.thumbnail }));
  const entries = [...source.quotes, ...source.originalInsights].filter(entry => entry.status === 'published').map(entry => {
    const output = {};
    for (const key of ['id', 'slug', 'kind', 'title', 'text', 'textLanguage', 'authorId', 'bookId', 'credit', 'categoryIds', 'tags', 'meaning', 'commentary', 'application', 'critique', 'publishedAt']) {
      if (entry[key] !== undefined) output[key] = entry[key];
    }
    output.source = {};
    for (const key of ['translator', 'publisher', 'edition', 'year', 'page', 'locator', 'url', 'language', 'originalText']) {
      if (entry.source?.[key]) output.source[key] = entry.source[key];
    }
    output.verifiedAt = entry.verification.checkedAt;
    output.rightsNote = entry.rights.publicNote || '';
    const bookProjects = projects.filter(project => project.bookId === entry.bookId).map(project => project.id);
    output.projectIds = [...new Set([...bookProjects, ...(entry.videoRefs || []).map(ref => ref.projectId)])];
    output.videos = (entry.videoRefs || []).flatMap(ref => {
      const project = site.projects[ref.projectId];
      if (!project?.video.published || !validVideo(project.video) || !date(project.publishedAt)
        || !Number.isInteger(project.video.durationSeconds) || project.video.durationSeconds <= 0) return [];
      const url = new URL(project.video.url);
      url.searchParams.delete('t'); url.searchParams.delete('start'); url.hash = '';
      const seconds = ref.timestampVerified === true && Number.isInteger(ref.seconds) && ref.seconds < project.video.durationSeconds ? ref.seconds : null;
      if (seconds !== null) url.searchParams.set('t', String(seconds));
      return [{ projectId: project.id, title: project.video.title, url: url.href, seconds, thumbnail: project.video.thumbnail }];
    });
    return output;
  });
  return { schemaVersion: 1, canonicalOrigin: site.canonicalOrigin,
    authors: source.authors.map(({ id, slug, name, bio }) => ({ id, slug, name, bio })), books,
    categories: source.categories.map(({ id, name }) => ({ id, name })), projects, entries };
}

function filterLink(key, id, label) {
  return `<a href="dusunce-arsivi.html?${key}=${encodeURIComponent(id)}#arsiv" data-archive-filter-link>${esc(label)}</a>`;
}
function renderCard(entry, data) {
  const original = entry.kind === 'original-insight';
  const author = data.authors.find(author => author.id === entry.authorId);
  const book = data.books.find(book => book.id === entry.bookId);
  const categories = entry.categoryIds.map(id => data.categories.find(category => category.id === id));
  const details = [['Alıntının anlamı', entry.meaning], ['Bizim yorumumuz', entry.commentary],
    ['Günlük hayatta', entry.application], ['Eleştirel değerlendirme', entry.critique]]
    .filter(([, value]) => value).map(([label, value]) => `<section><h3>${label}</h3><p>${esc(value)}</p></section>`).join('');
  const languages = { tr: 'Türkçe', it: 'İtalyanca', fr: 'Fransızca', en: 'İngilizce', grc: 'Eski Yunanca' };
  const fields = [['Özgün eser', book?.originalTitle], ['Çeviri', entry.source.translator], ['Yayınevi / dijital kaynak', entry.source.publisher],
    ['Baskı', entry.source.edition], ['Yıl', entry.source.year], ['Sayfa', entry.source.page], ['Bölüm / konum', entry.source.locator],
    ['Kaynak dili', languages[entry.source.language] || entry.source.language], ['Metnin dili', languages[entry.textLanguage] || entry.textLanguage], ['Kaynak kontrolü', entry.verifiedAt]]
    .filter(([, value]) => value).map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('');
  const related = entry.projectIds.map(id => data.projects.find(project => project.id === id)).filter(Boolean)
    .map(project => `<a class="text-link" href="${esc(project.slug)}.html">${esc(project.title)} →</a>`).join('');
  const videos = entry.videos.map(video => `<a class="archive-video" href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">${video.thumbnail?.src ? `<img src="${esc(video.thumbnail.src)}" alt="" width="1280" height="720" loading="lazy">` : ''}<span>${esc(video.title)}<small>${video.seconds === null ? 'YouTube’da izle ↗' : `${Math.floor(video.seconds / 60)}:${String(video.seconds % 60).padStart(2, '0')} · İlgili bölümü izle ↗`}</small></span></a>`).join('');
  const passage = `<p class="thought-text">${esc(entry.text)}</p>`;
  return `<article class="thought-card" id="dusunce-${esc(entry.slug)}" data-archive-entry="${esc(entry.id)}" tabindex="-1" aria-labelledby="baslik-${esc(entry.slug)}">
  <p class="thought-kind">${esc(core.kinds[entry.kind])}</p>
  ${entry.kind === 'direct-quote' ? `<blockquote>${passage}</blockquote>` : passage}
  <h2 id="baslik-${esc(entry.slug)}" class="thought-attribution">${original ? esc(entry.credit) : author ? filterLink('yazar', author.id, author.name) : esc(entry.credit)}${book ? `<span> ${original ? '· İlgili kitap:' : '/'} ${filterLink('kitap', book.id, book.title)}</span>` : ''}</h2>
  ${entry.title ? `<p class="thought-title">${esc(entry.title)}</p>` : ''}
  <div class="thought-tags">${categories.map(category => filterLink('kategori', category.id, category.name)).join('')}</div>
  ${entry.meaning || entry.commentary ? `<p class="thought-excerpt"><span>${entry.meaning ? 'Anlamı' : 'Bizim yorumumuz'}</span> ${esc((entry.meaning || entry.commentary).slice(0, 180))}${(entry.meaning || entry.commentary).length > 180 ? '…' : ''}</p>` : ''}
  <details><summary>Kaynak ve yorumları incele <span aria-hidden="true">↗</span></summary><div class="thought-details">${details}
    <section><h3>Kaynak bilgisi</h3><dl class="thought-source">${fields}</dl>${entry.source.url ? `<a class="text-link" href="${esc(entry.source.url)}" target="_blank" rel="noopener noreferrer">Kaynağı aç ↗</a>` : ''}
    ${entry.source.originalText ? `<h3 class="source-passage-heading">Kaynak dilindeki pasaj</h3><blockquote class="source-passage" lang="${esc(entry.source.language)}"><p>${esc(entry.source.originalText)}</p></blockquote>` : ''}
    <p class="source-note">Sayfa numarası belirtilen kaynak baskıya aittir; başka baskılarda değişebilir. Açıklama ve yorumlar, yazarın metninden ayrı değerlendirilmelidir.</p>${entry.rightsNote ? `<p class="source-note">${esc(entry.rightsNote)}</p>` : ''}</section>
    ${related || videos ? `<section><h3>Düşünceden deneye</h3>${related}${videos}</section>` : ''}</div></details>
  <div class="thought-actions"><button type="button" data-entry-action="copy-text" hidden>Metni kopyala</button><button type="button" data-entry-action="copy-link" hidden>Bağlantıyı kopyala</button><button type="button" data-entry-action="share" hidden>Paylaş ↗</button></div>
</article>`;
}

function replace(html, name, content) {
  const pattern = new RegExp(`(<!-- archive:${name}:start -->)[\\s\\S]*?(<!-- archive:${name}:end -->)`);
  if (!pattern.test(html)) throw new Error(`Arşiv şablon alanı eksik: ${name}`);
  return html.replace(pattern, (_, start, end) => `${start}${content}${end}`);
}
function renderPage(template, data) {
  let html = template;
  for (const [name, rows, label] of [['authors', data.authors, 'Tüm yazarlar'], ['books', data.books, 'Tüm kitaplar'], ['categories', data.categories, 'Tüm kategoriler']]) {
    html = replace(html, name, `<option value="">${label}</option>` + rows.map(row => `<option value="${esc(row.id)}">${esc(row.name || row.title)}</option>`).join(''));
  }
  html = replace(html, 'shelf', data.books.map(book => {
    const author = data.authors.find(author => author.id === book.authorId);
    const count = data.entries.filter(entry => entry.bookId === book.id).length;
    return `<li><span class="shelf-author">${esc(author.name)}</span><h3>${filterLink('kitap', book.id, book.title)}</h3><p>${esc(book.focus)}</p><span class="shelf-state">${count ? `${count} düşünce` : 'Kaynak seçimi sürüyor'}</span></li>`;
  }).join(''));
  html = replace(html, 'cards', data.entries.map(entry => renderCard(entry, data)).join('\n'));
  html = replace(html, 'count', data.entries.length ? `${data.entries.length} düşünce` : 'Henüz yayımlanmış düşünce yok');
  html = html.replace(/(<div\b[^>]*id="archive-empty")[^>]*>/, `$1${data.entries.length ? ' hidden' : ''}>`);
  html = html.replace(/(<meta name="robots" content=")[^"]+/, `$1${data.entries.length ? 'index,follow' : 'noindex,follow'}`);
  html = replace(html, 'related', data.projects.map(project => `<article class="archive-project"><div><p class="eyebrow">DÜŞÜNCEDEN GERÇEK HAYATA</p><h3>${esc(project.title)}</h3><p>${esc(project.statusLabel)}</p><a class="text-link" href="${esc(project.slug)}.html">Deneyin yöntemini ve kayıtlarını incele →</a></div>${project.thumbnail?.src ? `<a href="${esc(project.slug)}.html" aria-label="${esc(project.title)}"><img src="${esc(project.thumbnail.src)}" alt="${esc(project.thumbnail.alt)}" width="1280" height="720" loading="lazy"></a>` : ''}</article>`).join(''));
  const structured = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Düşünce Arşivi | Ali Gazal',
    url: `${data.canonicalOrigin}/dusunce-arsivi`, inLanguage: 'tr',
    mainEntity: { '@type': 'ItemList', numberOfItems: data.entries.length, itemListElement: data.entries.map((entry, i) => ({ '@type': 'ListItem', position: i + 1, url: core.entryUrl(entry, data.canonicalOrigin), name: entry.title || `${data.authors.find(author => author.id === entry.authorId)?.name || entry.credit} · ${core.kinds[entry.kind]}` })) } };
  return replace(html, 'schema', data.entries.length ? `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, '\\u003c')}</script>` : '');
}

function changes() {
  const data = publicData();
  const outputs = new Map();
  outputs.set('archive-data.js', `/* Generated by scripts/build-archive.js. Published content only. */\nconst AG_ARCHIVE_DATA = ${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')};\nif (typeof window !== 'undefined') window.AG_ARCHIVE_DATA = AG_ARCHIVE_DATA;\nif (typeof module !== 'undefined' && module.exports) module.exports = AG_ARCHIVE_DATA;\n`);
  outputs.set('dusunce-arsivi.html', renderPage(fs.readFileSync(path.join(root, 'dusunce-arsivi.html'), 'utf8'), data));
  const dates = data.entries.map(entry => entry.publishedAt).sort();
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  outputs.set('sitemap.xml', replace(sitemap, 'sitemap', data.entries.length ? `\n  <url><loc>${data.canonicalOrigin}/dusunce-arsivi</loc><lastmod>${dates.at(-1)}</lastmod></url>\n` : ''));
  const related = data.entries.filter(entry => entry.projectIds.includes('machiavelli'));
  const mach = fs.readFileSync(path.join(root, 'machiavelli.html'), 'utf8');
  outputs.set('machiavelli.html', replace(mach, 'project-quotes', related.length
    ? `<ul class="archive-related-list">${related.map(entry => `<li><a href="dusunce-arsivi.html#dusunce-${esc(entry.slug)}">${esc(entry.title || entry.text.slice(0, 95))}${!entry.title && entry.text.length > 95 ? '…' : ''}</a></li>`).join('')}</ul>` : ''));
  return [...outputs].flatMap(([file, next]) => {
    const current = fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : '';
    return current === next ? [] : [{ file, next }];
  });
}
if (require.main === module) {
  try {
    const updates = changes();
    if (process.argv.includes('--check') && updates.length) throw new Error(`Arşiv çıktıları güncel değil: ${updates.map(row => row.file).join(', ')}. node scripts/build-archive.js çalıştır.`);
    if (!process.argv.includes('--check')) updates.forEach(({ file, next }) => fs.writeFileSync(path.join(root, file), next));
    const data = publicData();
    console.log(`✓ Arşiv: ${data.authors.length} yazar, ${data.books.length} kitap, ${data.entries.length} yayımlanmış düşünce. Taslaklar kamuya açık çıktıya alınmadı.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { publicData, validate, renderCard, renderPage, changes, esc };
