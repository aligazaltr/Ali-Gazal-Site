const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const data = require('../site-data.js');
const { renderHtml } = require('./sync-site.js');
const root = path.resolve(__dirname, '..');
const payot = data.projects['irade-terbiyesi'];

test('Payot dates, selected methods and research completion do not assert a successful experiment', () => {
  assert.deepEqual(payot.research.stages.map(s => s.status), ['completed', 'completed', 'completed', 'in-progress']);
  assert.deepEqual(payot.principles.map(p => p.sourceNumber), [1, 2, 12]);
  assert.equal((Date.parse(payot.dates.plannedEnd) - Date.parse(payot.dates.plannedStart)) / 864e5 + 1, 7);
  assert.equal(payot.completedAt, null);
  assert.equal(payot.result.published, false);
  assert.equal(payot.evidence.published, false);
  assert.equal(payot.video.published, false);
  assert.equal(payot.video.productionStatus, 'not-started');
  assert.equal(payot.video.url, '');
  assert.equal(payot.video.thumbnail.src, '');
});

test('current Payot copy is synchronized across home, projects and the research dossier', () => {
  for (const file of ['index.html', 'rehberler.html', 'irade-terbiyesi.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.equal(renderHtml(html), html);
    assert.ok(html.includes(payot.summary));
    assert.ok(html.includes(payot.statusLabel));
    assert.doesNotMatch(html, /Kitap okunuyor|kitabını okuyorum|Deney henüz başlamadı|Uygulama henüz başlamadı|araştırma hazırlığını gösteriyor/);
  }
  const page = fs.readFileSync(path.join(root, 'irade-terbiyesi.html'), 'utf8');
  assert.ok(page.includes(payot.dates.label));
  assert.equal((page.match(/data-research-method=/g) || []).length, 3);
  for (const p of payot.principles) {
    assert.ok(page.includes(p.title));
    assert.ok(page.includes(p.rule));
  }
  assert.match(page, /henüz araştırmanın bütün kaynaklarını ve bulgularını içermiyor/);
  assert.doesNotMatch(page, /payot-scene|payot-frames/);
});

test('current Machiavelli views advertise the actual released video and retain the dossier route', () => {
  const project = data.projects.machiavelli;
  assert.equal(project.video.url, 'https://youtu.be/6MxLFTRudaQ');
  assert.equal(project.publishedAt, '2026-11-15');
  for (const file of ['index.html', 'rehberler.html', 'machiavelli.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(html.includes(project.statusLabel));
    assert.doesNotMatch(html, /video hazırlanıyor|Video henüz yayımlanmadı/);
    if (file !== 'rehberler.html') assert.ok(html.includes('href="' + project.video.url + '"'));
    assert.match(html, /href="(?:machiavelli.html|#deney-asamasi)"/);
  }
});

test('a future calendar date cannot publish or complete either ongoing experiment', () => {
  const NativeDate = Date;
  class FutureDate extends NativeDate {
    constructor(...args) { super(...(args.length ? args : ['2050-01-01T00:00:00Z'])); }
    static now() { return NativeDate.parse('2050-01-01T00:00:00Z'); }
  }
  const sandbox = { module: { exports: {} }, Date: FutureDate };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'site-data.js'), 'utf8'), sandbox);
  for (const id of ['kontrol-bende-mi', 'irade-terbiyesi']) {
    const project = sandbox.module.exports.projects[id];
    assert.equal(project.phase, 'testing');
    assert.equal(project.completedAt, null);
    assert.equal(project.result.published, false);
    assert.equal(project.video.published, false);
  }
});

test('selected method text is escaped in static HTML', () => {
  const fixture = JSON.parse(JSON.stringify(data));
  fixture.projects['irade-terbiyesi'].principles[0].title = '<img src=x onerror=alert(1)>';
  const html = renderHtml(fs.readFileSync(path.join(root, 'irade-terbiyesi.html'), 'utf8'), fixture);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x onerror/);
});
