const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const data = require('../site-data.js');
const { renderHtml, validateResearch } = require('./sync-site.js');
const { publicData } = require('./build-archive.js');
const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'irade-terbiyesi.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function scenario(setup) {
  const source = fs.readFileSync(path.join(root, 'site-data.js'), 'utf8');
  const sandbox = { module: { exports: {} } };
  vm.runInNewContext(source.replace('  // Publication copy', () => `${setup}\n  // Publication copy`), sandbox);
  return sandbox.module.exports;
}
const payot = "data.projects['irade-terbiyesi']";

test('Payot begins with four research stages, no experiment outcome or invented release', () => {
  const project = data.projects['irade-terbiyesi'];
  assert.equal(project.status, 'upcoming');
  assert.equal(Object.values(data.projects).filter(p => p.status === 'active').length, 1);
  assert.deepEqual(project.research.stages.map(stage => stage.status), ['in-progress', 'not-started', 'not-started', 'not-started']);
  assert.equal(project.principles.length, 0);
  assert.equal(project.result.published, false); assert.equal(project.result.summary, '');
  assert.equal(project.video.url, ''); assert.equal(project.video.published, false); assert.equal(project.publishedAt, null);
  assert.equal(renderHtml(page), page);
  assert.equal((page.match(/data-research-stage=/g) || []).length, 4);
  assert.equal((page.match(/aria-current="step"/g) || []).length, 1);
  assert.doesNotMatch(page, /%25|25%|role="progressbar"|href="https:\/\/(?:www\.)?youtube\.com\/watch/);
});

test('one central stage change updates detail and homepage without JavaScript', () => {
  const fixture = scenario(`${payot}.research.stages[0].status = 'completed'; ${payot}.research.stages[1].status = 'in-progress';`);
  const html = renderHtml(page, fixture); const preview = renderHtml(home, fixture);
  assert.match(html, /Kitap okuması tamamlandı/);
  assert.match(html, /data-research-stage="ilkeler" aria-current="step"/);
  assert.match(preview, /İlke seçimi yapılıyor/);
  assert.doesNotMatch(preview, /Kitap okunuyor, araştırma devam ediyor/);
  assert.equal(renderHtml(html, fixture), html);
});

test('invalid stage counts, out-of-order completion and premature production are rejected', () => {
  for (const change of [p => p.research.stages.push({...p.research.stages[0], id:'fifth'}),
    p => {p.research.stages[2].status='completed';}, p => {p.research.stages[1].status='in-progress';},
    p => {p.video.productionStatus='preparing';}, p => {p.video.published=true;}]) {
    const project = JSON.parse(JSON.stringify(data.projects['irade-terbiyesi'])); change(project);
    assert.throws(() => validateResearch(project));
  }
});

test('future video release uses existing gates while research stays at four stages', () => {
  const fixture = scenario(`${payot}.research.stages.forEach(stage => stage.status = 'completed');
    ${payot}.video.published = true; ${payot}.video.url = 'https://youtu.be/TESTFIXTURE';
    ${payot}.video.title = 'SENTETİK TEST VİDEOSU'; ${payot}.video.durationSeconds = 90;
    ${payot}.publishedAt = '2026-10-19';`);
  const html = renderHtml(page, fixture);
  assert.equal((html.match(/data-research-stage=/g) || []).length, 4);
  assert.match(html, /href="https:\/\/youtu.be\/TESTFIXTURE"/);
  assert.match(html, /Video yayımlandı/);
  assert.match(html, /Kişisel uygulama tamamlandı/);
  const missing = JSON.parse(JSON.stringify(fixture)); missing.projects['irade-terbiyesi'].video.url = '';
  assert.throws(() => renderHtml(page, missing), /yayın için/);
});

test('existing Payot entries link both ways without generating extra quotes or video URLs', () => {
  const archive = publicData();
  assert.equal(archive.entries.length, 15);
  const entries = archive.entries.filter(entry => entry.bookId === 'irade-terbiyesi');
  assert.equal(entries.length, 5);
  for (const entry of entries) {
    assert.ok(entry.projectIds.includes('irade-terbiyesi'));
    assert.equal(entry.videos.length, 0);
    assert.ok(page.includes(`#dusunce-${entry.slug}`));
  }
  assert.match(page, /dusunce-arsivi.html\?kitap=irade-terbiyesi#arsiv/);
});
