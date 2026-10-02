const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { renderHtml, validVideo } = require('./sync-site.js');
const data = require('../site-data.js');
const root = path.resolve(__dirname, '..');

function releaseFixture() {
  const source = fs.readFileSync(path.join(root, 'site-data.js'), 'utf8');
  const fixture = {
    published: true, url: 'https://www.youtube.com/watch?v=TESTFIXTURE',
    title: 'Yerel test & <başlık> $&', durationSeconds: 4000,
    chapters: [{ label: 'Başlangıç', seconds: 0 }, { label: 'Son bölüm', seconds: 3665 }]
  };
  const sandbox = { module: { exports: {} } };
  const setup = `Object.assign(data.projects.machiavelli.video, ${JSON.stringify(fixture)});
    data.projects.machiavelli.publishedAt = '2026-10-02';
    data.projects.machiavelli.lastUpdated = '2026-10-02';
    data.projects.machiavelli.features.videoTimeline = true;`;
  vm.runInNewContext(source.replace('  // Publication copy', () => `${setup}\n  // Publication copy`), sandbox);
  return sandbox.module.exports;
}

test('current HTML is stable and preserves the unpublished video gate', () => {
  for (const file of ['index.html', 'rehberler.html', 'machiavelli.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.equal(renderHtml(html), html);
    assert.match(html, /Deney tamamlandı · video hazırlanıyor/);
    assert.equal((html.match(/<img class="project-cover"/g) || []).length, 1);
    assert.doesNotMatch(html, /href="https:\/\/(?:www\.)?youtube\.com\/watch/);
  }
});

test('one release record updates static copy, metadata, phase and chapters', () => {
  const released = releaseFixture();
  for (const file of ['index.html', 'rehberler.html', 'machiavelli.html']) {
    const html = renderHtml(fs.readFileSync(path.join(root, file), 'utf8'), released);
    assert.match(html, /Deney tamamlandı · video yayında/);
    assert.doesNotMatch(html, /video hazırlanıyor|video henüz hazırlanıyor|Video henüz yayımlanmadı/);
    assert.equal(renderHtml(html, released), html);
    if (file === 'machiavelli.html') {
      assert.match(html, /Yerel test &amp; &lt;başlık&gt; \$&/);
      assert.match(html, /data-phase="published" aria-current="step"/);
      assert.match(html, /1:01:05/);
      assert.match(html, /TESTFIXTURE&amp;t=3665/);
      assert.match(html, /datetime="2026-10-02">2 Ekim 2026/);
    }
  }
});

test('a release with a missing URL cannot generate public HTML', () => {
  const released = JSON.parse(JSON.stringify(releaseFixture()));
  released.projects.machiavelli.video.url = '';
  assert.throws(() => renderHtml(fs.readFileSync(path.join(root, 'machiavelli.html'), 'utf8'), released), /yayın için/);
});

test('channel, foreign host and insecure URLs cannot pass as video links', () => {
  for (const url of ['https://www.youtube.com/@aligazaltr', 'https://youtube.com.evil.example/watch?v=TESTFIXTURE', 'http://youtu.be/TESTFIXTURE']) {
    assert.equal(Boolean(validVideo({ title: 'Test', url })), false);
  }
  assert.equal(Boolean(validVideo({ title: 'Test', url: 'https://youtu.be/TESTFIXTURE' })), true);
});
