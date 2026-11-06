/* Synthetic publication data for tests only; never deploy this file. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
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

module.exports = { releaseFixture };
