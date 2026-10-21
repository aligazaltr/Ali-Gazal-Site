const test = require('node:test');
const assert = require('node:assert/strict');
const share = require('../share-context.js');
const archive = require('../archive-core.js');
const production = 'https://ali-gazal-site.aliicerikmedya.workers.dev';
const preview = 'https://feature-cinematic-experience-v2-ali-gazal-site.aliicerikmedya.workers.dev';
test('preview thought links preserve the thought and environment without leaking filter/tracking queries', () => {
  const canonical = archive.entryUrl({slug: 'prens-01'}, production);
  const link = share.linkFor(canonical, preview + '/dusunce-arsivi?q=irade&utm_source=test');
  assert.equal(link.url, preview + '/dusunce-arsivi#dusunce-prens-01');
  assert.equal(link.isPreview, true);
  assert.equal(new URL('/index.html', link.url).origin, preview);
});
test('production shares always use the canonical origin; preview can explicitly choose production', () => {
  for (const current of [production + '/machiavelli', preview + '/machiavelli']) {
    const link = share.linkFor(production + '/machiavelli', current, 'production');
    assert.equal(link.url, production + '/machiavelli'); assert.equal(link.isPreview, false);
  }
  assert.equal(share.linkFor(production + '/machiavelli', production).isPreview, false);
});
test('project preview sharing and same-origin home navigation remain on the reviewed build', () => {
  const link = share.linkFor(production + '/machiavelli', preview + '/machiavelli.html');
  assert.equal(link.url, preview + '/machiavelli');
  assert.equal(new URL('index.html', link.url).href, preview + '/index.html');
});
