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
      if (typeof value === 'string' && value.trim()) element.textContent = value;
    });
  }

  function insertProjectCovers() {
    document.querySelectorAll('[data-project-cover]').forEach(container => {
      const project = projectFor(container);
      const thumbnail = project?.video?.thumbnail;
      if (!thumbnail?.src || !thumbnail.alt) return;

      const image = document.createElement('img');
      image.className = 'project-cover';
      image.src = thumbnail.src;
      image.alt = thumbnail.alt;
      image.width = Number(thumbnail.width) || 1280;
      image.height = Number(thumbnail.height) || 720;
      image.loading = container.dataset.coverPriority === 'high' ? 'eager' : 'lazy';
      image.decoding = 'async';
      container.prepend(image);
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

  function markReady() {
    document.body.classList.add('page-ready');
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyProjectFields();
    insertProjectCovers();
    setupReadingProgress();
    markReady();
  });
})();
