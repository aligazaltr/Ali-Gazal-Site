(() => {
  const scene = document.querySelector('[data-neighborhood]');
  const film = scene.querySelector('[data-neighborhood-film]');
  const control = scene.querySelector('[data-neighborhood-motion]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = window.matchMedia('(max-width: 45rem)');
  const connection = navigator.connection;
  let visible = true;
  let paused = false;

  function disableMotion() {
    film.pause();
    scene.classList.remove('is-film-visible', 'is-directed-neighborhood');
    control.hidden = true;
    if (film.hasAttribute('src')) {
      film.removeAttribute('src');
      film.load();
    }
  }

  function loadMotion() {
    if (reduced.matches || connection?.saveData) return;
    film.src = portrait.matches ? 'neighborhood-mobile.mp4' : 'neighborhood-desktop.mp4';
    film.muted = true;
    control.hidden = false;
    control.textContent = 'Hareketi durdur';
    if (visible && !document.hidden) film.play().catch(offerPlayback);
  }

  function offerPlayback() {
    if (film.error || !film.hasAttribute('src')) return;
    control.textContent = 'Sahneyi oynat';
    control.hidden = false;
  }

  film.addEventListener('playing', () => {
    if (reduced.matches) return disableMotion();
    scene.classList.add('is-film-visible');
    if (film.currentTime < 0.8) scene.classList.add('is-directed-neighborhood');
    control.textContent = 'Hareketi durdur';
  });
  film.addEventListener('ended', () => { control.textContent = 'Sahneyi tekrar oynat'; });
  film.addEventListener('error', disableMotion);

  control.addEventListener('click', () => {
    paused = !film.paused;
    if (paused) {
      film.pause();
      scene.classList.remove('is-directed-neighborhood');
      control.textContent = 'Hareketi sürdür';
      return;
    }
    if (film.ended) {
      scene.classList.remove('is-directed-neighborhood');
      film.currentTime = 0;
    }
    film.play().catch(offerPlayback);
  });

  function syncPlayback() {
    if (!visible || document.hidden) {
      if (!film.paused) film.pause();
    } else if (!paused && !film.ended && film.hasAttribute('src')) {
      film.play().catch(offerPlayback);
    }
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.05 });
    observer.observe(scene);
  }
  document.addEventListener('visibilitychange', syncPlayback);
  reduced.addEventListener('change', () => {
    if (reduced.matches) disableMotion();
    else loadMotion();
  });
  portrait.addEventListener('change', () => {
    disableMotion();
    paused = false;
    loadMotion();
  });
  loadMotion();
})();
