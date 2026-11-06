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
      const priority = container.dataset.coverPriority;
      image.loading = ['high', 'low'].includes(priority) ? 'eager' : 'lazy';
      image.fetchPriority = ['high', 'low'].includes(priority) ? priority : 'auto';
      image.decoding = 'async';
      if (!image.isConnected) container.prepend(image);
    });
  }

  function applyVideoCoverLinks() {
    if (!window.AG_VIDEO_LINKS) return;
    document.querySelectorAll('a[data-project-video-link]').forEach(link => {
      const project = projectFor(link);
      if (!project) return;
      const url = window.AG_VIDEO_LINKS.publishedUrl(project.video);
      link.href = url || project.slug + '.html';
      if (url) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', 'YouTube’da izle: ' + project.video.title + ' (yeni sekmede)');
      } else {
        for (const name of ['target', 'rel', 'aria-label']) link.removeAttribute(name);
      }
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

  function setupPreviewNotice() {
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    if (!canonical || !window.AG_SHARE?.context(canonical, location.href).isPreview) return;
    const note = document.createElement('aside');
    note.className = 'preview-notice site-shell';
    note.setAttribute('aria-label', 'Önizleme ortamı');
    const label = document.createElement('strong'); label.textContent = 'ÖNİZLEME';
    const text = document.createElement('span'); text.textContent = 'Bu tasarım henüz canlıya alınmadı.';
    const field = document.createElement('label'); field.textContent = 'Paylaşılacak sürüm';
    const select = document.createElement('select'); select.id = 'share-environment';
    for (const [value, text] of [['preview', 'Bu önizleme'], ['production', 'Canlı site']]) {
      const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option);
    }
    field.append(select);
    const link = document.createElement('a'); link.href = canonical; link.textContent = 'Canlı siteyi aç ↗';
    note.append(label, text, field, link);
    document.querySelector('.site-header')?.after(note);
    select.addEventListener('change', () => {
      document.dispatchEvent(new Event('sharecontextchange'));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyProjectFields();
    insertProjectCovers();
    applyVideoCoverLinks();
    setupReadingProgress();
    setupPreviewNotice();
    window.AG_MOTION?.init();
  });
})();
