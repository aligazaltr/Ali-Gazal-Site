(() => {
  const scene = document.querySelector('[data-library-depth]');
  if (!scene || !('IntersectionObserver' in window)) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const planes = [...scene.querySelectorAll('.library-plane')];
  let visible = false;
  let decoded = false;
  let loading;
  let frame = 0;

  function paint() {
    frame = 0;
    const { top, height } = scene.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, (window.innerHeight * .5 - top - height * .5) / (window.innerHeight * .5)));
    scene.style.setProperty('--book-rise', `${(progress * -4).toFixed(2)}px`);
    scene.style.setProperty('--leaf-sway', `${(progress * 6).toFixed(2)}px`);
    scene.style.setProperty('--leaf-rise', `${(progress * 2).toFixed(2)}px`);
  }

  function synchronize() {
    if (!visible || preference.matches || document.hidden) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      scene.removeAttribute('data-library-depth-ready');
      return;
    }
    if (!decoded) {
      loading ||= Promise.all(planes.map(plane => plane.decode())).then(() => {
        decoded = true;
        synchronize();
      }).catch(() => {
        // The intact poster is displayed when a plane fails to decode.
      });
      return;
    }
    if (!frame) {
      scene.dataset.libraryDepthReady = '';
      frame = window.requestAnimationFrame(paint);
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    synchronize();
  }).observe(scene);
  window.addEventListener('scroll', synchronize, { passive: true });
  window.addEventListener('resize', synchronize, { passive: true });
  preference.addEventListener('change', synchronize);
  document.addEventListener('visibilitychange', synchronize);
})();
