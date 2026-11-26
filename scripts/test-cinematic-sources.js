const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function boot(mode) {
  const calls = [];
  class Element extends EventTarget {
    constructor() { super(); this.hidden = false; this.textContent = ''; this.currentTime = 0; this.duration = 10.041667; this.offsetHeight = 2250; }
    pause() {}
    play() { return Promise.resolve(); }
    setAttribute() {}
    load() { queueMicrotask(() => this.dispatchEvent(new Event(mode === 'decode' && calls.length === 1 ? 'error' : 'loadeddata'))); }
  }
  const elements = new Map();
  const film = new Element();
  elements.set('#cinematic-film', film);
  const body = {dataset: {}, style: {setProperty() {}}, classList: {add() {}}};
  const doc = {body, hidden: false, querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, new Element());
    return elements.get(selector);
  }, addEventListener() {}};
  const context = {document: doc, matchMedia: () => ({matches: false, addEventListener() {}}),
    scrollY: 0, innerHeight: 900, addEventListener() {}, requestAnimationFrame: () => 1,
    setTimeout: () => 1, clearTimeout() {}, AbortController,
    URL: {createObjectURL: () => 'blob:test', revokeObjectURL() {}},
    fetch: async url => {
      calls.push(url);
      if (mode === 'network' && calls.length === 1 || mode === 'failed') throw new Error('unavailable');
      return {ok: true, blob: async () => ({})};
    }};
  vm.runInNewContext(fs.readFileSync('cinematic-opening.js', 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  return {calls, body, elements};
}
test('available 4K source loads without requesting the old film', async () => {
  const s = await boot('ok');
  assert.equal(s.calls.length, 1);
  assert.equal(s.body.dataset.mediaQuality, '2160p');
});
test('unavailable 4K source recovers with the preserved local film', async () => {
  const s = await boot('network');
  assert.equal(s.calls.length, 2);
  assert.equal(s.calls[1], 'cinematic-film.mp4');
  assert.equal(s.body.dataset.mediaQuality, '480p');
});
test('unsupported 4K decoding recovers with the preserved local film', async () => {
  const s = await boot('decode');
  assert.equal(s.calls.length, 2);
  assert.equal(s.body.dataset.mediaQuality, '480p');
});
test('failure of both sources leaves an explicit recovery and reading path', async () => {
  const s = await boot('failed');
  assert.equal(s.calls.length, 2);
  assert.equal(s.elements.get('#play-film').hidden, false);
  assert.match(s.elements.get('.loading').textContent, /yüklenemedi/);
});
