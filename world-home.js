(() => {
  const video = document.querySelector('#world-film');
  if (!video) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const skip = document.querySelector('.world-intro-skip');
  const concept = document.querySelector('[data-world-concept]');
  const introEnd = 4.9;
  const canvas = document.querySelector('#world-canvas');
  let runtimeWorld = null;
  let gpuFailed = false;
  const worldReady = typeof WebGLRenderingContext !== 'undefined' && !preference.matches
    ? import('./world-renderer.js').then(module => module.createLivingWorld(canvas)).catch(() => null)
    : Promise.resolve(null);
  canvas?.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    runtimeWorld?.dispose();
    runtimeWorld = null;
    gpuFailed = true;
    canvas.hidden = true;
    if (enabled) document.body.dataset.worldPlayback = 'film';
    schedule();
  });
  let automatic = true;
  let enabled = false;
  let frame = 0;
  let startY = scrollY;
  let handoffTime = introEnd;
  let handoffMap = introEnd;
  let desired = 0;
  let anchors = [];
  const duration = () => Number.isFinite(video.duration) ? video.duration : 30;

  function mappedTime() {
    const position = scrollY;
    let index = anchors.findIndex((point, i) => i < anchors.length - 1 && position <= anchors[i + 1].y);
    if (index < 0) return duration() - .1;
    const a = anchors[index];
    const b = anchors[index + 1];
    const fraction = Math.max(0, Math.min(1, (position - a.y) / Math.max(1, b.y - a.y)));
    return a.time + (b.time - a.time) * fraction;
  }

  function measure() {
    const points = [
      ['.world-hero', introEnd], ['.world-river', 9.3],
      ['#gercek-deneyler', 12.7], ['#hikaye-fikir', 16.2],
      ['#hikaye-deney', 19.4], ['#hikaye-sonuc', 23.6],
      ['#yasayan-arsiv', duration() - .12]
    ];
    anchors = points.map(([selector, time]) => ({
      y: scrollY + document.querySelector(selector).getBoundingClientRect().top - innerHeight * .13,
      time
    }));
    schedule();
  }

  function takeControl() {
    if (!automatic) return;
    automatic = false;
    handoffTime = video.currentTime;
    handoffMap = mappedTime();
    video.pause();
    skip.hidden = true;
  }

  function paint() {
    frame = 0;
    if (!enabled || document.hidden) return;
    if (automatic && Math.abs(scrollY - startY) > 3) takeControl();
    if (automatic && video.currentTime >= introEnd) {
      video.pause();
      video.currentTime = introEnd;
      automatic = false;
      handoffTime = introEnd;
      handoffMap = introEnd;
      skip.hidden = true;
    }
    if (!automatic) {
      const mapped = mappedTime();
      desired = mapped <= handoffMap
        ? handoffTime * Math.max(0, mapped / Math.max(.01, handoffMap))
        : handoffTime + (duration() - handoffTime) * (mapped - handoffMap) / Math.max(.01, duration() - handoffMap);
      desired = Math.max(0, Math.min(duration() - .08, desired));
      if (!video.seeking && Math.abs(video.currentTime - desired) > .035) video.currentTime = desired;
    }
    document.body.dataset.worldTime = video.currentTime.toFixed(2);
    const scenes = [...document.querySelectorAll('[data-story-scene]')];
    const current = scenes.reduce((nearest, scene) => Math.abs(scene.getBoundingClientRect().top - innerHeight * .2) < Math.abs(nearest.getBoundingClientRect().top - innerHeight * .2) ? scene : nearest);
    concept.textContent = current.querySelector('.scene-label').textContent;
    if (runtimeWorld) {
      const seconds = automatic ? video.currentTime : desired;
      const progress = seconds < introEnd ? .18 * seconds / introEnd : .18 + .82 * (seconds - introEnd) / (duration() - introEnd);
      try { runtimeWorld.draw(progress, performance.now() / 1000); }
      catch {
        runtimeWorld.dispose();
        runtimeWorld = null;
        gpuFailed = true;
        canvas.hidden = true;
        document.body.dataset.worldPlayback = 'film';
      }
    }
    if (automatic || runtimeWorld) schedule();
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function fallback() {
    enabled = false;
    automatic = false;
    video.pause();
    document.body.removeAttribute('data-world-playback');
    skip.hidden = true;
  }

  async function begin() {
    if (preference.matches) return;
    const candidate = await worldReady;
    runtimeWorld = gpuFailed ? null : candidate;
    if (preference.matches) return;
    enabled = true;
    document.body.dataset.worldPlayback = runtimeWorld ? 'webgl' : 'film';
    if (runtimeWorld) canvas.hidden = false;
    startY = scrollY;
    automatic = scrollY < scrollY + document.querySelector('.world-hero').getBoundingClientRect().bottom - innerHeight * .3;
    handoffTime = introEnd;
    handoffMap = introEnd;
    measure();
    skip.hidden = !automatic;
    if (automatic) {
      document.querySelectorAll('.world-hero [data-world-word]').forEach((word, index) => {
        word.getAnimations?.().forEach(animation => animation.cancel());
        word.animate?.([
          {opacity: 0, transform: 'translateY(.45em)', clipPath: 'inset(0 -5% 100%)'},
          {opacity: 1, transform: 'translateY(0)', clipPath: 'inset(-20% -5% -25%)'}
        ], {duration: 850, delay: 200 + index * 130, fill: 'backwards', easing: 'cubic-bezier(.2,.7,.25,1)'});
      });
      try { await video.play(); }
      catch { takeControl(); }
    } else video.pause();
    schedule();
  }
  skip.addEventListener('click', () => {
    video.pause();
    video.currentTime = introEnd;
    automatic = false;
    handoffTime = introEnd;
    handoffMap = mappedTime();
    skip.hidden = true;
    schedule();
  });
  video.addEventListener('canplay', () => { if (!enabled && !preference.matches) begin(); });
  video.addEventListener('seeked', schedule);
  video.addEventListener('error', fallback);
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', measure, {passive: true});
  addEventListener('load', measure, {once: true});
  addEventListener('pageshow', () => {
    if (enabled && scrollY > scrollY + document.querySelector('.world-hero').getBoundingClientRect().bottom) {
      automatic = false;
      handoffTime = introEnd;
      handoffMap = introEnd;
      skip.hidden = true;
      measure();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (automatic && enabled) video.play().catch(takeControl);
    schedule();
  });
  preference.addEventListener('change', () => {
    if (preference.matches) fallback();
    else if (video.readyState >= 3) begin();
    else { video.preload = 'auto'; video.load(); }
  });
  if (preference.matches) video.preload = 'none';
})();
