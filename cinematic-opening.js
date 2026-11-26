(() => {
  'use strict';
  const film = document.querySelector('#cinematic-film');
  if (!film) return;
  const journey = document.querySelector('.journey');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const introEnd = 4.8;
  const play = document.querySelector('#play-film');
  const pause = document.querySelector('#pause-film');
  const skip = document.querySelector('#skip-intro');
  const loading = document.querySelector('.loading');
  const chapter = document.querySelector('.chapter');
  const riverCopy = document.querySelector('.river-copy');
  let automatic = true, suspended = false, started = false, pending = 0;
  let handoffTime = introEnd, handoffY = 0, target = 0, objectURL;
  let previousY = scrollY, direction = 1, introTimer;
  const end = () => Math.max(introEnd, (film.duration || 10) - .08);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const span = () => Math.max(1, journey.offsetHeight - innerHeight);
  function paint() {
    pending = 0;
    if (!started || preference.matches) return;
    if (automatic && scrollY > 4) handoff();
    if (automatic && film.currentTime >= introEnd) {
      film.pause(); film.currentTime = introEnd; handoff();
    }
    if (!automatic && !suspended) {
      const nextDirection = scrollY > previousY ? 1 : scrollY < previousY ? -1 : direction;
      if (nextDirection !== direction) {
        handoffTime = film.currentTime; handoffY = previousY; direction = nextDirection;
      }
      const distance = scrollY - handoffY;
      target = distance >= 0
        ? handoffTime + (end() - handoffTime) * clamp(distance / Math.max(1, span() - handoffY))
        : handoffTime * clamp(scrollY / Math.max(1, handoffY));
      if (!film.seeking && Math.abs(film.currentTime - target) > .025) film.currentTime = target;
      previousY = scrollY;
    }
    const progress = clamp(scrollY / span());
    document.body.style.setProperty('--opening-opacity', String(1 - clamp(progress * 4)));
    document.body.style.setProperty('--opening-y', `${-progress * 100}px`);
    const river = clamp((progress - .34) * 4);
    document.body.style.setProperty('--river-opacity', String(river));
    document.body.style.setProperty('--river-y', `${18 * (1 - river)}px`);
    document.body.style.setProperty('--film-progress', String(clamp(film.currentTime / end())));
    document.body.dataset.cameraTime = film.currentTime.toFixed(3);
    document.body.dataset.cameraMode = automatic ? 'automatic' : suspended ? 'paused' : 'scroll';
    chapter.textContent = progress > .55 ? '03 / HAYATIN İÇİNE' : film.currentTime >= introEnd ? '02 / DIŞARI AÇILIR' : '01 / DÜŞÜNCENİN DOĞUŞU';
    riverCopy.setAttribute('aria-hidden', String(river < .1));
    if (automatic && !suspended) schedule();
  }
  function schedule() { if (!pending) pending = requestAnimationFrame(paint); }
  function watchIntro() {
    clearTimeout(introTimer);
    if (!automatic || suspended || !started) return;
    const remaining = introEnd - film.currentTime;
    if (remaining <= .02) {
      film.pause(); film.currentTime = introEnd; handoff(); schedule();
    } else introTimer = setTimeout(watchIntro, Math.min(200, remaining * 1000));
  }
  function handoff() {
    if (!automatic) return;
    clearTimeout(introTimer);
    automatic = false; handoffTime = film.currentTime; handoffY = scrollY;
    film.pause(); skip.hidden = true;
  }
  function failure() {
    film.pause(); suspended = true; automatic = false;
    loading.textContent = 'Yolculuk yüklenemedi. Görseli inceleyebilir veya deneylere geçebilirsin.';
    loading.hidden = false; play.hidden = false; pause.hidden = true; skip.hidden = true;
  }
  // Keep the approved timeline; the local V1 film remains a recovery source.
  const filmSources = [
    {url: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Jn7h2Ol7BOSeAjF9ToYAnGUJnF/a198dd73-2faf-4c6c-8b55-4d131761d5e4.mp4', quality: '2160p'},
    {url: 'cinematic-film.mp4', quality: '480p'}
  ];
  async function loadFilm() {
    for (const source of filmSources) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(source.url, {signal: controller.signal});
        if (!response.ok) throw new Error('Film unavailable');
        const blob = await response.blob();
        clearTimeout(timeout);
        if (objectURL) URL.revokeObjectURL(objectURL);
        objectURL = URL.createObjectURL(blob);
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => finish(new Error('Film decoding timed out')), 15000);
          const ready = () => finish();
          const error = () => finish(new Error('Film decoding failed'));
          function finish(problem) {
            clearTimeout(timer);
            film.removeEventListener('loadeddata', ready);
            film.removeEventListener('error', error);
            problem ? reject(problem) : resolve();
          }
          film.addEventListener('loadeddata', ready, {once:true});
          film.addEventListener('error', error, {once:true});
          film.src = objectURL; film.load();
        });
        document.body.dataset.mediaQuality = source.quality;
        return;
      } catch (_) {
        clearTimeout(timeout);
        controller.abort();
        if (objectURL) { URL.revokeObjectURL(objectURL); objectURL = undefined; }
      }
    }
    throw new Error('No playable film source');
  }
  async function start() {
    if (started || preference.matches) return;
    try {
      // Buffer once so the same forward/reverse timeline also works on preview
      // hosts without byte-range support.
      await loadFilm();
      started = true; document.body.classList.add('ready'); loading.hidden = true;
      suspended = false; pause.hidden = false;
      if (scrollY > 4) { automatic = false; handoffTime = introEnd; handoffY = 0; }
      else {
        skip.hidden = false;
        try { await film.play(); watchIntro(); } catch (_) { automatic = false; suspended = true; play.hidden = false; skip.hidden = true; }
      }
      schedule();
    } catch (_) { started = false; failure(); }
  }
  play.addEventListener('click', async () => {
    if (!started) { suspended = false; await start(); return; }
    film.currentTime = 0; automatic = true; suspended = false; handoffY = scrollY;
    play.hidden = true; skip.hidden = false; pause.hidden = false;
    try { await film.play(); watchIntro(); schedule(); } catch (_) { failure(); }
  });
  skip.addEventListener('click', () => { film.currentTime = introEnd; handoff(); schedule(); });
  pause.addEventListener('click', () => {
    handoff(); suspended = !suspended; film.pause();
    pause.textContent = suspended ? 'Hareketi sürdür' : 'Hareketi durdur'; schedule();
  });
  film.addEventListener('seeked', schedule);
  film.addEventListener('timeupdate', watchIntro);
  film.addEventListener('error', () => { if (started) failure(); });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', () => { if (document.hidden) film.pause(); else if (automatic && !suspended) film.play().then(schedule).catch(failure); });
  preference.addEventListener('change', event => {
    if (event.matches) { film.pause(); suspended = true; play.hidden = true; pause.hidden = true; skip.hidden = true; }
    else if (!started) start();
  });
  if (preference.matches) { loading.hidden = true; play.hidden = true; }
  else start();
  addEventListener('pagehide', () => { if (objectURL) URL.revokeObjectURL(objectURL); }, {once:true});
})();
