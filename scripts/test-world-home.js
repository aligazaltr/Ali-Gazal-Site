const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').resolve(__dirname, '../world-home.js'), 'utf8');
function fixture(reduced = false) {
  const events = {}, videoEvents = {}, queue = [];
  const preference = {matches: reduced, addEventListener(name, callback) {events.preference = callback;}};
  const video = {currentTime: 0, duration: 30, readyState: 1, seeking: false, paused: true,
    play() {this.paused = false; return Promise.resolve();}, pause() {this.paused = true;},
    addEventListener(name, callback) {videoEvents[name] = callback;}, load() {this.loaded = true;}};
  const skip = {hidden: true, addEventListener(name, callback) {events.skip = callback;}};
  const play = {hidden:true,addEventListener(name, callback) {events.play = callback;}};
  const body = {dataset: {}, removeAttribute(name) {delete this.dataset.worldPlayback;}};
  const positions = {'.world-hero': 140,'.world-river': 1140,'#gercek-deneyler': 2300,'#hikaye-fikir': 4300,'#hikaye-deney': 5600,'#hikaye-sonuc': 6900,'#yasayan-arsiv': 8200};
  const context = {scrollY: 0, innerHeight: 1000, matchMedia: () => preference,
    addEventListener(name, callback) {events[name] = callback;},
    requestAnimationFrame(callback) {queue.push(callback); return queue.length;}};
  const geometry = selector => ({getBoundingClientRect: () => ({top: positions[selector] - context.scrollY, bottom: positions[selector] + 1000 - context.scrollY})});
  const scene = selector => ({...geometry(selector), querySelector: () => ({textContent: selector})});
  const concept = {textContent: ''};
  context.document = {body, hidden: false,
    querySelector(selector) {return selector === '.world-intro-play' ? play : selector === '#world-film' ? video : selector === '.world-intro-skip' ? skip : selector === '[data-world-concept]' ? concept : geometry(selector);},
    querySelectorAll() {return ['#hikaye-fikir','#hikaye-deney','#hikaye-sonuc'].map(scene);},
    addEventListener(name, callback) {events[name] = callback;}};
  vm.runInNewContext(source, context);
  const tick = () => {const callback = queue.shift(); if (callback) callback();};
  return {context,events,video,videoEvents,preference,body,skip,play,tick};
}

test('the intro ends at the continuous camera handoff and reverse seeking remains available', async () => {
  const f = fixture(); await f.videoEvents.canplay(); f.video.currentTime = 4.94; f.tick();
  assert.equal(f.video.currentTime, 4.9); assert.equal(f.video.paused, true);
  f.context.scrollY = 6000; f.events.scroll(); f.tick(); const forward = f.video.currentTime;
  f.context.scrollY = 3000; f.events.scroll(); f.tick();
  assert.ok(forward > f.video.currentTime); assert.ok(f.video.currentTime > 4.9);
});
test('early user scrolling takes over at the actual current camera position', async () => {
  const f = fixture(); await f.videoEvents.canplay(); f.video.currentTime = 1.75;
  f.context.scrollY = 500; f.events.scroll(); f.tick();
  assert.equal(f.video.currentTime, 1.75); assert.equal(f.video.paused, true);
  f.context.scrollY = 8200; f.events.scroll(); f.tick(); assert.ok(f.video.currentTime > 29);
});
test('reduced motion and media errors restore the readable authored page', async () => {
  const f = fixture(true); await f.videoEvents.canplay(); assert.equal(f.body.dataset.worldPlayback, undefined);
  f.video.readyState = 4; f.preference.matches = false; f.events.preference(); await Promise.resolve(); f.tick();
  assert.equal(f.body.dataset.worldPlayback, 'film');
  f.videoEvents.error(); assert.equal(f.body.dataset.worldPlayback, undefined); assert.equal(f.video.paused, true);
});
test('restored deep navigation selects the corresponding camera region without replaying the intro', async () => {
  const f = fixture(); f.context.scrollY = 7000; await f.videoEvents.canplay(); f.tick();
  assert.equal(f.video.paused, true); assert.ok(f.video.currentTime > 23);
});

// canplay is emitted after every seek by real browsers, not only initial load.
test('repeated canplay events after scrubbing cannot reset the camera handoff', async () => {
 const f=fixture(); await f.videoEvents.canplay(); f.video.currentTime=4.94; f.tick();
 f.context.scrollY=6000;f.events.scroll();f.tick(); const forward=f.video.currentTime;
 await f.videoEvents.canplay();f.tick();assert.equal(f.video.currentTime,forward);assert.equal(f.video.paused,true);
 f.context.scrollY=7000;f.events.scroll();f.tick();assert.ok(f.video.currentTime>forward);
});
test('an autoplay rejection provides an explicit gesture recovery', async () => {
 const f=fixture();f.video.play=()=>Promise.reject(new Error('autoplay'));
 await f.videoEvents.canplay();assert.equal(f.play.hidden,false);assert.equal(f.video.paused,true);
 f.video.play=function(){this.paused=false;return Promise.resolve()};await f.events.play();
 assert.equal(f.play.hidden,true);assert.equal(f.video.paused,false);
});

test('a preview without range seeking buffers the same authored film once', async () => {
 const f=fixture();let fetched=0;
 f.video.seekable={length:1,end:()=>0};f.video.currentSrc='https://preview.test/world-film.mp4';
 f.context.fetch=async url=>{assert.equal(url,f.video.currentSrc);fetched++;return {ok:true,blob:async()=>({})}};
 f.context.URL={createObjectURL:()=> 'blob:local-camera',revokeObjectURL(){}};
 await f.videoEvents.canplay();assert.equal(f.video.src,'blob:local-camera');assert.equal(fetched,1);
 assert.equal(f.body.dataset.worldPlayback,undefined);
 await f.videoEvents.loadeddata();assert.equal(f.body.dataset.worldPlayback,'film');
 await f.videoEvents.canplay();assert.equal(fetched,1);
});
