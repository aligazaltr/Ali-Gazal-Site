const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../motion.js'), 'utf8');
function fixture(reduced = false, animationSupport = true, mobile = false) {
  const listeners = {};
  const calls = [];
  const preference = { matches: reduced, addEventListener: (_, callback) => { listeners.preference = callback; } };
  function Element() {}
  if (animationSupport) Element.prototype.animate = function(frames, options) {
    let finish, reject;
    const finished = new Promise((a, b) => { finish = a; reject = b; });
    const animation = { finished, finish, cancel: () => { animation.cancelled = true; reject(new Error('cancelled')); } };
    calls.push({ element: this, frames, options, animation }); return animation;
  };
  const document = { hidden: false, querySelectorAll: () => [], addEventListener: (name, callback) => { listeners[name] = callback; } };
  const compact = { matches: mobile, addEventListener: (_, callback) => { listeners.compact = callback; } };
  const observers = [];
  class IntersectionObserver {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    unobserve(target) { this.targets = this.targets.filter(item => item !== target); }
    disconnect() { this.disconnected = true; this.targets = []; }
  }
  const window = { matchMedia: q => q.includes('reduced') ? preference : compact, IntersectionObserver, innerWidth: mobile ? 390 : 1440, innerHeight: 800 };
  vm.runInNewContext(source, { window, document, Element, IntersectionObserver, Map, WeakSet, Set });
  const element = Object.assign(new Element(), { hidden: false, getClientRects: () => [{}], contains: () => false });
  return { api: window.AG_MOTION, calls, element, preference, listeners, document, window, compact, observers, Element };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
test('reduced motion and missing animation APIs preserve immediate content updates', () => {
  for (const setup of [[true, true], [false, false]]) {
    const f = fixture(...setup); let content = 'old';
    f.api.enter(f.element); f.api.swap(f.element, () => { content = 'new'; });
    assert.equal(content, 'new'); assert.equal(f.calls.length, 0);
  }
});
test('random-style swap fades out before replacing text, then settles with a separate entry', async () => {
  const f = fixture(); let content = 'old';
  f.api.swap(f.element, () => { content = 'new'; });
  assert.equal(content, 'old'); assert.equal(f.calls[0].options.duration, 150);
  f.calls[0].animation.finish(); await flush();
  assert.equal(content, 'new'); assert.equal(f.calls[1].options.duration, 360);
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
test('keyboard focus cancels a pending swap without replacing the focused content', async () => {
  const f = fixture(); let content = 'focused content';
  f.element.contains = () => true;
  f.api.swap(f.element, () => { content = 'replacement'; });
  f.listeners.focusin({ target: {} }); await flush();
  assert.equal(content, 'focused content'); assert.equal(f.calls[0].animation.cancelled, true);
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

function storyFixture(mobile) {
  const f = fixture(false, true, mobile);
  const node = text => Object.assign(new f.Element(), {
    textContent: text, hidden: false, dataset: {}, classList: { add() {}, toggle() {}, contains() { return false; } },
    getClientRects: () => [{}], getBoundingClientRect: () => ({ top: 160, bottom: 500, left: 20, right: 300 }), contains: () => false
  });
  const scenes = ['FİKİR', 'DENEY', 'SONUÇ'].map((label, i) => {
    const scene = node(''); const children = { '.scene-number': node(String(i + 1)), '.scene-label': node(label), h3: node(label + ' başlık'), '.scene-description': node(label + ' açıklama'), '.scene-glyph': node('') };
    scene.querySelector = selector => children[selector]; scene.children = children; return scene;
  });
  const stage = node('');
  const parts = { '.story-visual': stage, '.story-word': node('FİKİR'), '[data-story-number]': node('01'), '[data-story-label]': node('FİKİR'), '[data-story-caption]': node(''), '[data-story-description]': node('') };
  const story = node(''); story.querySelectorAll = () => scenes; story.querySelector = selector => parts[selector];
  f.document.querySelectorAll = selector => selector === '[data-story]' ? [story] : [];
  f.api.init(); return { ...f, story, scenes, parts };
}
test('mobile scenes reveal their own content without updating or animating the hidden panel', () => {
  const f = storyFixture(true);
  f.observers[0].callback([{ target: f.scenes[1], isIntersecting: true }]);
  assert.equal(f.story.dataset.storyMode, 'local');
  assert.equal(f.parts['[data-story-number]'].textContent, '01');
  assert.ok(f.calls.some(call => call.element === f.scenes[1].children['.scene-number']));
  assert.ok(f.calls.some(call => call.element === f.scenes[1].children.h3));
  assert.ok(!f.calls.some(call => Object.values(f.parts).includes(call.element)));
  const count = f.calls.length;
  f.observers[0].callback([{ target: f.scenes[1], isIntersecting: false }, { target: f.scenes[1], isIntersecting: true }]);
  assert.equal(f.calls.length, count, 'scene plays once');
});
test('desktop sticky story still changes number, label, title and description', () => {
  const f = storyFixture(false);
  f.observers[0].callback([{ target: f.scenes[2], isIntersecting: true }]);
  assert.equal(f.story.dataset.storyMode, 'sticky');
  assert.equal(f.story.dataset.scene, '2');
  assert.equal(f.parts['[data-story-number]'].textContent, '03');
  assert.equal(f.parts['[data-story-label]'].textContent, 'SONUÇ');
  assert.equal(f.parts['[data-story-caption]'].textContent, 'SONUÇ başlık');
  assert.equal(f.parts['[data-story-description]'].textContent, 'SONUÇ açıklama');
});
test('breakpoint changes disconnect the old story controller', () => {
  const f = storyFixture(false); f.compact.matches = true; f.listeners.compact();
  assert.equal(f.observers[0].disconnected, true);
  assert.equal(f.story.dataset.storyMode, 'local');
});
test('off-screen elements never start an animation', () => {
  const f = fixture(); f.element.getBoundingClientRect = () => ({ top: 1100, bottom: 1500, left: 0, right: 300 });
  f.api.enter(f.element); assert.equal(f.calls.length, 0);
});

test('layer morph uses the current visual position, cancels older travel and reaches the new CSS state', () => {
  const f = fixture();
  let state = 'old';
  const part = Object.assign(new f.Element(), { hidden: false, getClientRects: () => [{}], contains: () => false });
  const layer = { contains: node => node === part, getClientRects: () => [{}], querySelectorAll: () => [part] };
  f.window.getComputedStyle = () => ({ transform: state === 'old' ? 'matrix(1,0,0,1,30,0)' : 'matrix(1,0,0,1,90,0)', opacity: '1' });
  f.api.animate(part, [{ transform: 'none' }, { transform: 'scale(2)' }]);
  f.api.morph(layer, () => { state = 'new'; });
  assert.equal(f.calls[0].animation.cancelled, true);
  assert.equal(f.calls[1].frames[0].transform, 'matrix(1,0,0,1,30,0)');
  assert.equal(f.calls[1].frames[1].transform, 'matrix(1,0,0,1,90,0)');
});
test('off-screen and reduced-motion morphs commit meaning without scheduling visual work', () => {
  for (const reduced of [true, false]) {
    const f = fixture(reduced); let state = 0;
    const layer = { getClientRects: () => [], contains: () => false, querySelectorAll: () => [f.element] };
    f.api.morph(layer, () => { state = 2; });
    assert.equal(state, 2); assert.equal(f.calls.length, 0);
  }
});
test('signature replaces paper compositions while research facts remain in the document', () => {
  const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
  const research = fs.readFileSync(require.resolve('../machiavelli.html'), 'utf8');
  assert.ok(html.includes('ag-signature')); assert.ok(!html.includes('folio-leaf'));
  assert.ok(!research.includes('case-study')); assert.ok(!research.includes('case-record-rail'));
  for (const id of ['kurallar', 'kanit-defteri', 'sonuc']) assert.ok(research.includes(`id="${id}"`));
  assert.ok(research.replace(/\s+/g, ' ').includes(require('../site-data.js').projects.machiavelli.result.summary));
});
test('text fade commits only the latest selection and clears when interrupted', async () => {
  const f = fixture(); let content = 'old';
  f.api.swap(f.element, () => { content = 'stale'; }, null, { text: true });
  assert.equal(f.calls[0].options.duration, 180);
  f.api.swap(f.element, () => { content = 'latest'; }, null, { text: true });
  assert.equal(f.calls[0].animation.cancelled, true);
  f.calls[1].animation.finish(); await flush();
  assert.equal(content, 'latest');
  const reduced = fixture(true); let immediate = false;
  reduced.api.swap(reduced.element, () => { immediate = true; }, null, { text: true });
  assert.equal(immediate, true); assert.equal(reduced.calls.length, 0);
});
