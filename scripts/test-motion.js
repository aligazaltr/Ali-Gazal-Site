const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../motion.js'), 'utf8');
function fixture(reduced = false, animationSupport = true) {
  const listeners = {};
  const calls = [];
  const preference = { matches: reduced, addEventListener: (_, callback) => { listeners.preference = callback; } };
  function Element() {}
  if (animationSupport) Element.prototype.animate = function(frames, options) {
    let finish, reject;
    const finished = new Promise((a, b) => { finish = a; reject = b; });
    const animation = { finished, finish, cancel: () => { animation.cancelled = true; reject(new Error('cancelled')); } };
    calls.push({ frames, options, animation }); return animation;
  };
  const document = { hidden: false, querySelectorAll: () => [], addEventListener: (name, callback) => { listeners[name] = callback; } };
  const window = { matchMedia: q => q.includes('reduced') ? preference : { matches: false } };
  vm.runInNewContext(source, { window, document, Element, Map, WeakSet, Set });
  const element = Object.assign(new Element(), { hidden: false, getClientRects: () => [{}], contains: () => false });
  return { api: window.AG_MOTION, calls, element, preference, listeners, document };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
test('reduced motion and missing animation APIs preserve immediate content updates', () => {
  for (const setup of [[true, true], [false, false]]) {
    const f = fixture(...setup); let content = 'old';
    f.api.enter(f.element); f.api.swap(f.element, () => { content = 'new'; });
    assert.equal(content, 'new'); assert.equal(f.calls.length, 0);
  }
});
test('random-style swap fades out before replacing text, then fades in within 350ms', async () => {
  const f = fixture(); let content = 'old';
  f.api.swap(f.element, () => { content = 'new'; });
  assert.equal(content, 'old'); assert.equal(f.calls[0].options.duration, 110);
  f.calls[0].animation.finish(); await flush();
  assert.equal(content, 'new'); assert.equal(f.calls[1].options.duration, 240);
});
test('rapid discovery selections cannot restore an obsolete selection', async () => {
  const f = fixture(); let content = 'old';
  f.api.swap(f.element, () => { content = 'obsolete'; });
  f.api.swap(f.element, () => { content = 'latest'; });
  assert.equal(f.calls[0].animation.cancelled, true);
  f.calls[1].animation.finish(); await flush();
  assert.equal(content, 'latest');
});
test('changing motion preference during a swap commits latest content and cancels motion', async () => {
  const f = fixture(); let content = 'old';
  f.api.swap(f.element, () => { content = 'new'; });
  f.preference.matches = true; f.listeners.preference({ matches: true }); await flush();
  assert.equal(content, 'new'); assert.equal(f.calls[0].animation.cancelled, true);
});
test('page backgrounding does not leave pending discovery content or animation behind', async () => {
  const f = fixture(); let content = 'old';
  f.api.swap(f.element, () => { content = 'new'; });
  f.document.hidden = true; f.listeners.visibilitychange(); await flush();
  assert.equal(content, 'new'); assert.equal(f.calls[0].animation.cancelled, true);
});
test('static cinematic slogan and three full scenes survive without JavaScript', () => {
  const data = require('../site-data.js');
  const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
  const { renderHtml } = require('./sync-site.js');
  assert.equal(renderHtml(html), html);
  for (const word of data.experience.intro) assert.ok(html.includes(word));
  for (const scene of data.experience.stories.method.scenes) {
    assert.ok(html.includes(`id="hikaye-${scene.id}"`));
    assert.ok(html.includes(scene.title)); assert.ok(html.includes(scene.description));
  }
  assert.equal((html.match(/data-story-scene/g) || []).length, 3);
  assert.ok(!html.includes('three.js'));
});
