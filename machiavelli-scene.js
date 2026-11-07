/* Scroll directs one composition. No wheel interception, timers or idle loop. */
(() => {
  const scene = document.querySelector('[data-machiavelli-scene]');
  const frames = window.AG_MACHIAVELLI_FRAMES;
  const supported = window.IntersectionObserver && window.requestAnimationFrame && window.matchMedia
    && window.CSS?.supports('position', 'sticky') && window.CSS.supports('transform', 'translate3d(0,0,0)');
  if (!scene || !frames || !supported) { document.documentElement?.removeAttribute('data-scene-ready'); return; }
  const stage = scene.querySelector('.mc-stage');
  const portrait = scene.querySelector('.mc-portrait');
  const image = portrait.querySelector('img');
  const film = scene.querySelector('.mc-film');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let geometry, start = 0, travel = 1, pending = 0, visible = false, ready = false, imageFailed = false;
  const cancel = () => { if (pending) cancelAnimationFrame(pending); pending = 0; };
  function fallback() { scene.dataset.qaFallback=JSON.stringify({height:innerHeight,reduced:reduced.matches,complete:image.complete,naturalWidth:image.naturalWidth,portraitWidth:portrait.offsetWidth,filmWidth:film.offsetWidth});
    document.documentElement?.removeAttribute('data-scene-ready');
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
    // A responsive image may briefly be complete with no selected intrinsic
    // width. Only an actual error is terminal; a subsequent load can recover.
    const largeText = parseFloat(window.getComputedStyle?.(document.documentElement).fontSize) > 24;
    if (reduced.matches || window.innerHeight < 420 || largeText || imageFailed) { fallback(); return; }
    scene.classList.add('is-directed');
    // Computed layout sizes are fractional and untransformed. offset* rounds
    // them, while getBoundingClientRect includes our current scroll transform.
    const ps=window.getComputedStyle(portrait),fs=window.getComputedStyle(film),ss=window.getComputedStyle(stage);
    const number=(value,fallback)=>Number.isFinite(parseFloat(value))?parseFloat(value):fallback;
    const height=number(ss.height,stage.clientHeight),width=number(ss.width,stage.clientWidth);
    const pw=number(ps.width,portrait.offsetWidth),ph=number(ps.height,portrait.offsetHeight),fw=number(fs.width,film.offsetWidth);
    const origin=(ps.transformOrigin||'').split(' ');
    geometry = {height, mobile:window.matchMedia('(max-width:600px)').matches, portraitWidth:pw,portraitHeight:ph,
      portraitLeft:number(ps.left,portrait.offsetLeft),portraitTop:number(ps.top,portrait.offsetTop),
      portraitOriginX:number(origin[0],pw*.5),portraitOriginY:number(origin[1],ph*.3),
      filmWidth:fw,filmLeft:width/2-fw/2,filmTop:number(fs.top,film.offsetTop)};
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
  if (reduced.addEventListener) reduced.addEventListener('change', measure);
  else reduced.addListener?.(measure);
  document.addEventListener('visibilitychange', () => document.hidden ? cancel() : schedule());
  image.addEventListener('load', () => { imageFailed = false; measure(); });
  image.addEventListener('error', () => { imageFailed = true; fallback(); });
  // Links and text remain present before decoding; an unavailable asset cannot trap the page.
  measure();
  document.documentElement?.removeAttribute('data-scene-ready');
})();
