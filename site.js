/* Shared, dependency-free enhancements for the static site. */
(() => {
  const data = window.AG_SITE_DATA;

  function projectFor(element) {
    const id = element.dataset.project || element.closest('[data-project]')?.dataset.project;
    return id && data?.projects?.[id] ? data.projects[id] : null;
  }

  function readPath(value, path) {
    return path.split('.').reduce((current, key) => current?.[key], value);
  }

  function applyProjectFields() {
    document.querySelectorAll('[data-project-field]').forEach(element => {
      const project = projectFor(element);
      const value = project && readPath(project, element.dataset.projectField);
      if ((typeof value === 'string' && value.trim()) || typeof value === 'number') {
        element.textContent = String(value);
      }
    });
  }

  function insertProjectCovers() {
    document.querySelectorAll('[data-project-cover]').forEach(container => {
      const project = projectFor(container);
      const thumbnail = project?.video?.thumbnail;
      if (!thumbnail?.src || !thumbnail.alt) return;

      const image = container.querySelector('.project-cover') || document.createElement('img');
      image.className = 'project-cover';
      image.src = thumbnail.src;
      image.alt = thumbnail.alt;
      image.width = Number(thumbnail.width) || 1280;
      image.height = Number(thumbnail.height) || 720;
      image.loading = container.dataset.coverPriority === 'high' ? 'eager' : 'lazy';
      if (container.dataset.coverPriority === 'high') image.fetchPriority = 'high';
      image.decoding = 'async';
      if (!image.isConnected) container.prepend(image);
    });
  }

  function setupReadingProgress() {
    const indicator = document.querySelector('[data-reading-progress]');
    if (!indicator) return;

    let scheduled = false;

    function update() {
      scheduled = false;
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
      indicator.style.setProperty('--reading-progress', String(progress));
    }

    function requestUpdate() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }

    indicator.hidden = false;
    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
  }

  function setupMotion() {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (preference?.matches || !Element.prototype.animate) return;

    const active = new Map();
    function enter(element, delay = 0) {
      if (preference?.matches) return;
      // The underlying document is always visible, including when JS fails.
      const animation = element.animate([
        { opacity: 0.55, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 520, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'none' });
      active.set(element, animation);
      animation.finished.catch(() => {}).finally(() => active.delete(element));
    }

    document.querySelectorAll('.hero-copy > *, .hero-dossier, .project-opening > *')
      .forEach((element, index) => enter(element, Math.min(index * 65, 260)));

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
          enter(entry.target, Math.min(index * 45, 135));
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('.section-heading, .process-card, .project-card, .phase-panel, .article-section > h2, .principle-list > li, .evidence-card, .result-panel, .prose-section')
        .forEach(element => observer.observe(element));
    }

    preference?.addEventListener?.('change', event => {
      if (!event.matches) return;
      observer?.disconnect();
      active.forEach(animation => animation.cancel());
      active.clear();
    });
    document.addEventListener('focusin', event => {
      active.forEach((animation, element) => {
        if (element.contains(event.target)) animation.cancel();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyProjectFields();
    insertProjectCovers();
    setupReadingProgress();
    window.requestAnimationFrame(setupMotion);
  });
})();
