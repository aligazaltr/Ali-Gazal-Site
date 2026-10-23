/* Scroll directs one composition. No wheel interception, timers or idle loop. */
(() => {
  const scene = document.querySelector('[data-machiavelli-scene]');
  const frames = window.AG_MACHIAVELLI_FRAMES;
  if (!scene || !frames || !window.IntersectionObserver || !window.requestAnimationFrame) return;
  const stage = scene.querySelector('.mc-stage');
  const portrait = scene.querySelector('.mc-portrait');
  const image = portrait.querySelector('img');
  const film = scene.querySelector('.mc-film');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let geometry, start = 0, travel = 1, pending = 0, visible = false, ready = false;
  const cancel = () => { if (pending) cancelAnimationFrame(pending); pending = 0; };
  function fallback() {
    cancel(); ready = false;
    scene.classList.remove('is-directed', 'is-scrolling');
    scene.style.removeProperty('--scene-height');
    stage.removeAttribute('style');
    delete scene.dataset.progress;
  }
  function paint() {
    pending = 0;
    if (!ready || document.hidden || reduced.matches) return;
    const progress = Math.max(0, Math.min(1, (window.scrollY - start) / travel));
    frames.apply(stage, frames.sample(progress, geometry));
    scene.dataset.progress = progress.toFixed(4);
  }
  function schedule() {
    if (ready && visible && !document.hidden && !pending && !reduced.matches) pending = requestAnimationFrame(paint);
  }
  function measure() {
    cancel();
    // Short landscape windows and zoomed layouts keep normal, fully readable flow.
    if (reduced.matches || window.innerHeight < 420 || (image.complete && !image.naturalWidth)) { fallback(); return; }
    scene.classList.add('is-directed');
    const height = stage.clientHeight, width = stage.clientWidth;
    geometry = {height, mobile:window.matchMedia('(max-width:600px)').matches, portraitWidth:portrait.offsetWidth,portraitHeight:portrait.offsetHeight,portraitLeft:portrait.offsetLeft,portraitTop:portrait.offsetTop,filmWidth:film.offsetWidth,filmLeft:width/2-film.offsetWidth/2,filmTop:film.offsetTop};
    if (!geometry.portraitWidth || !geometry.filmWidth) { fallback(); return; }
    stage.style.setProperty('--film-height', `${geometry.filmWidth * 9 / 16}px`);
    // Travel follows the composition size and is bounded on long screens.
    travel = Math.max(360, Math.min(1100, height * .7 + geometry.portraitWidth * .85));
    scene.style.setProperty('--scene-height', `${height + travel}px`);
    scene.classList.add('is-scrolling');
    start = scene.getBoundingClientRect().top + window.scrollY - 12;
    ready = true;
    paint();
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible) schedule(); else cancel();
  });
  observer.observe(scene);
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('pageshow', measure);
  reduced.addEventListener('change', measure);
  document.addEventListener('visibilitychange', () => document.hidden ? cancel() : schedule());
  image.addEventListener('load', measure, {once:true});
  image.addEventListener('error', fallback, {once:true});
  // Links and text remain present before decoding; an unavailable asset cannot trap the page.
  measure();
})();
