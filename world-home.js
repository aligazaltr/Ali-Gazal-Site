(() => {
  const video = document.querySelector('#world-film');
  if (!video) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const skip = document.querySelector('.world-intro-skip');
  const play = document.querySelector('.world-intro-play');
  const loading = document.querySelector('.world-loading');
  const concept = document.querySelector('[data-world-concept]');
  const introEnd = 4.9;
  let enabled = false, starting = false, automatic = true, frame = 0;
  let mediaPrepared = false, mediaURL = null;
  let startY = scrollY, handoffTime = introEnd, handoffMap = introEnd;
  let desired = 0, anchors = [], scenes = [];
  const duration = () => Number.isFinite(video.duration) ? video.duration : 30;

  function mappedTime() {
    if (!anchors.length) return introEnd;
    const position = scrollY;
    let index = anchors.findIndex((point, i) => i < anchors.length - 1 && position <= anchors[i + 1].y);
    if (index < 0) return duration() - .1;
    const a = anchors[index], b = anchors[index + 1];
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
    scenes = [...document.querySelectorAll('[data-story-scene]')];
    schedule();
  }
  function takeControl() {
    if (!automatic) return;
    automatic = false;
    handoffTime = video.currentTime;
    handoffMap = mappedTime();
    desired = handoffTime;
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
      handoffMap = mappedTime();
      desired = introEnd;
      skip.hidden = true;
    }
    if (!automatic) {
      const mapped = mappedTime();
      desired = mapped <= handoffMap
        ? handoffTime * Math.max(0, mapped / Math.max(.01, handoffMap))
        : handoffTime + (duration() - handoffTime) * (mapped - handoffMap) / Math.max(.01, duration() - handoffMap);
      desired = Math.max(0, Math.min(duration() - .08, desired));
      // Never enqueue a new seek while a previous decode is in flight.
      // seeked schedules the latest scroll target, including rapid reversal.
      if (!video.seeking && Math.abs(video.currentTime - desired) > 1 / 48) video.currentTime = desired;
    }
    document.body.dataset.worldTime = video.currentTime.toFixed(2);
    if (concept && scenes.length) {
      const current = scenes.reduce((nearest, scene) => Math.abs(scene.getBoundingClientRect().top - innerHeight * .2) < Math.abs(nearest.getBoundingClientRect().top - innerHeight * .2) ? scene : nearest);
      concept.textContent = current.querySelector('.scene-label').textContent;
    }
    if (automatic) schedule();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  function fallback() {
    enabled = false; starting = false; automatic = false;
    video.pause();
    document.body.removeAttribute('data-world-playback');
    skip.hidden = true;
    if (play) play.hidden = true;
    if (loading) loading.hidden = true;
  }
  function animateTitle() {
    document.querySelectorAll('.world-hero [data-world-word]').forEach((word, index) => {
      word.getAnimations?.().forEach(animation => animation.cancel());
      word.animate?.([
        {opacity: 0, transform: 'translateY(.45em)', clipPath: 'inset(0 -5% 100%)'},
        {opacity: 1, transform: 'translateY(0)', clipPath: 'inset(-20% -5% -25%)'}
      ], {duration: 850, delay: 200 + index * 130, fill: 'backwards', easing: 'cubic-bezier(.2,.7,.25,1)'});
    });
  }
  async function begin() {
    // canplay is also fired after seeking. Re-entering here used to reset the
    // handoff continuously and could leave the site stuck on the first frame.
    if (enabled || starting || preference.matches) return;
    starting = true;
    // Some static preview proxies ignore byte ranges. A fully received local
    // media object has a reliable seek table on those connections as well.
    if (!mediaPrepared && video.seekable && (!video.seekable.length || video.seekable.end(video.seekable.length - 1) < duration() - .5)) {
      try {
        if (loading) loading.hidden = false;
        const response = await fetch(video.currentSrc || 'world-film.mp4');
        if (!response.ok) throw new Error('media download failed');
        const blob = await response.blob();
        if (preference.matches) { starting = false; return; }
        mediaURL = URL.createObjectURL(blob);
        mediaPrepared = true;
        starting = false;
        video.src = mediaURL;
        video.load();
        return;
      } catch { fallback(); return; }
    }
    mediaPrepared = true;
    if (loading) loading.hidden = true;
    video.muted = true;
    video.playsInline = true;
    document.body.dataset.worldPlayback = 'film';
    enabled = true;
    // The enhanced sections are taller than the static fallback. Re-anchor an
    // initial fragment after enabling that layout, before mapping the camera.
    const fragment = typeof location === 'object' ? location.hash : '';
    if (fragment && fragment !== '#icerik') {
      let target;
      try { target = document.getElementById(decodeURIComponent(fragment.slice(1))); } catch {}
      if (target?.closest('.world-home')) {
        scrollTo({top: scrollY + target.getBoundingClientRect().top - innerHeight * .13, behavior: 'instant'});
      }
    }
    measure();
    startY = scrollY;
    automatic = document.querySelector('.world-hero').getBoundingClientRect().bottom > innerHeight * .3;
    handoffTime = introEnd; handoffMap = introEnd;
    skip.hidden = !automatic;
    if (play) play.hidden = true;
    if (automatic) {
      animateTitle();
      try { await video.play(); }
      catch {
        takeControl();
        if (play) play.hidden = false;
      }
    } else video.pause();
    starting = false;
    schedule();
  }
  skip.addEventListener('click', () => {
    video.pause(); video.currentTime = introEnd; automatic = false;
    handoffTime = introEnd; handoffMap = mappedTime(); desired = introEnd;
    skip.hidden = true; if (play) play.hidden = true; schedule();
  });
  play?.addEventListener('click', async () => {
    if (preference.matches) return;
    video.currentTime = 0; automatic = true; startY = scrollY;
    play.hidden = true; skip.hidden = false;
    try { await video.play(); schedule(); }
    catch { takeControl(); play.hidden = false; }
  });
  video.addEventListener('loadeddata', begin);
  video.addEventListener('canplay', begin);
  video.addEventListener('seeked', schedule);
  video.addEventListener('timeupdate', schedule);
  video.addEventListener('error', fallback);
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', measure, {passive: true});
  addEventListener('load', measure, {once: true});
  addEventListener('pageshow', () => {
    if (enabled && document.querySelector('.world-hero').getBoundingClientRect().bottom < 0) {
      automatic = false; handoffTime = introEnd; handoffMap = introEnd;
      skip.hidden = true; measure();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (automatic && enabled) video.play().catch(takeControl);
    schedule();
  });
  preference.addEventListener('change', () => {
    if (preference.matches) fallback();
    else if (video.readyState >= 2) begin();
    else { video.preload = 'auto'; video.load(); }
  });
  addEventListener('pagehide', event => { if (!event.persisted && mediaURL) URL.revokeObjectURL(mediaURL); });
  if (preference.matches) video.preload = 'none';
  else if (video.readyState >= 2) begin();
})();
