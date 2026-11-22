const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const data = require('../site-data.js');
const { renderHtml } = require('./sync-site.js');

const read = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');

test('each public layout has its own semantic composition and shared publication stylesheet', () => {
  const layouts = {
    'index.html': ['home', 'experiment-grid'],
    'rehberler.html': ['projects', 'collection-map'],
    'machiavelli.html': ['prens', 'prens-dossier'],
    'kontrol-bende-mi.html': ['control', 'control-protocol'],
    'irade-terbiyesi.html': ['payot', 'payot-opening'],
    'dusunce-arsivi.html': ['archive', 'archive-reading-room'],
    'hakkimda.html': ['about', 'about-opening'],
    'marcus-aurelius.html': ['archived', 'fallback-spread'],
    '404.html': ['missing', 'fallback-spread']
  };
  for (const [file, [edition, layout]] of Object.entries(layouts)) {
    const html = read(file);
    assert.ok(html.includes(`<body data-edition="${edition}"`), file);
    assert.ok(html.includes(`href="edition.css"`), file);
    assert.ok(html.includes(layout), file);
  }
  assert.match(read('marcus-aurelius.html'), /noindex, follow/);
  assert.match(read('marcus-aurelius.html'), /url=rehberler\.html/);
});

test('the catalogue includes future registry projects while preserving the video publication gate', () => {
  const template = read('rehberler.html');
  const future = structuredClone(data);
  future.projects['deneme'] = {
    ...future.projects['kontrol-bende-mi'],
    id: 'deneme',
    slug: 'deneme',
    shortTitle: 'Yeni deney',
    summary: 'Yeni proje özeti.',
    video: { ...future.projects['kontrol-bende-mi'].video, published: false, url: 'https://youtu.be/TESTFIXTURE' }
  };
  const catalogue = renderHtml(template, future);
  assert.match(catalogue, /href="#deney-deneme">/);
  assert.match(catalogue, /id="deney-deneme"/);
  assert.match(catalogue, /href="deneme\.html"/);
  assert.doesNotMatch(catalogue, /TESTFIXTURE/);
  assert.equal(renderHtml(catalogue, future), catalogue);
});
