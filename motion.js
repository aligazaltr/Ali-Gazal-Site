/* Shared progressive motion: content is visible by default, even without this file. */
(() => {
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia?.('(max-width: 56rem)');
  const active = new Map();
  const seen = new WeakSet();
  const updates = new Map();
  let observer;
  let initialized = false;
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  const enabled = () => !preference?.matches && typeof Element.prototype.animate === 'function';
  function cancel(element, complete = false) {
    if (complete) updates.get(element)?.();
    updates.delete(element);
    active.get(element)?.cancel();
    active.delete(element);
  }
  function animate(element, frames, options = {}) {
    if (!element || !enabled() || element.hidden || !element.getClientRects().length) return null;
    cancel(element);
    // Never accumulate animation work while scrolling quickly through long lists.
    if (active.size >= 10) cancel(active.keys().next().value);
    try {
      const animation = element.animate(frames, { duration: 680, easing: ease, fill: 'none', ...options });
      active.set(element, animation);
      animation.finished.catch(() => {}).finally(() => {
        if (active.get(element) === animation) active.delete(element);
      });
      return animation;
    } catch (_) { return null; }
  }
  function enter(element, delay = 0, image = false) {
    return animate(element, [
      { opacity: 0, transform: image ? 'scale(.96)' : `translateY(${compact?.matches ? 18 : 32}px)` },
      { opacity: 1, transform: image ? 'scale(1)' : 'translateY(0)' }
    ], { delay, duration: compact?.matches ? 520 : 720, fill: 'backwards' });
  }
  // Fade old content, commit the latest selection, then reveal it; rapid clicks replace stale work.
  function swap(element, update) {
    cancel(element);
    if (!enabled() || element.hidden) { update(); return; }
    let updated = false;
    const commit = () => { if (!updated) { updated = true; update(); } };
    const outgoing = animate(element, [{ opacity: 1 }, { opacity: .25 }], { duration: 110 });
    if (!outgoing) { commit(); return; }
    updates.set(element, commit);
    // The caller may replace an in-flight swap; cancellation must never overwrite newer content.
    outgoing.finished.then(() => {
      if (active.get(element) !== outgoing) return;
      commit(); updates.delete(element);
      animate(element, [{ opacity: .25, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240 });
    }).catch(() => {});
    return commit;
  }
  function refresh() {
    if (!observer) return;
    document.querySelectorAll('[data-reveal], .section-heading, .process-card, .phase-panel, .principle-list > li, .evidence-card, .result-panel, .prose-section, .research-stage, .research-preview, .thought-card, .archive-reading-note, .article-section > h2, .project-card > .project-cover, .project-copy > *, .project-status')
      .forEach(element => {
        if (!seen.has(element) && !element.hidden) observer.observe(element);
      });
  }
  function setupStories() {
    if (!('IntersectionObserver' in window)) return;
    document.querySelectorAll('[data-story]').forEach(story => {
      const scenes = [...story.querySelectorAll('[data-story-scene]')];
      const intersecting = new Set();
      let selected = -1;
      const watcher = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) intersecting.add(entry.target); else intersecting.delete(entry.target); });
        const current = [...intersecting].sort((a, b) => Math.abs(a.getBoundingClientRect().top - window.innerHeight * .3) - Math.abs(b.getBoundingClientRect().top - window.innerHeight * .3))[0];
        if (!current) return;
        const next = scenes.indexOf(current);
        if (next === selected) return;
        selected = next;
        story.dataset.scene = String(next);
        scenes.forEach(scene => scene.classList.toggle('is-active', scene === current));
        story.querySelector('[data-story-number]').textContent = String(next + 1).padStart(2, '0');
        story.querySelector('[data-story-label]').textContent = current.querySelector('.eyebrow').textContent.split('/').pop().trim();
        story.querySelector('[data-story-caption]').textContent = current.querySelector('h3').textContent;
        story.querySelector('[data-story-description]').textContent = current.querySelector('h3 + p').textContent;
        animate(story.querySelector('.story-word'), [{ opacity: .2, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420 });
        enter(current.querySelector('h3'));
      }, { rootMargin: '-25% 0px -35% 0px', threshold: [0, .2, .6] });
      scenes.forEach(scene => watcher.observe(scene));
    });
  }
  function init() {
    if (initialized) return;
    initialized = true;
    setupStories();
    const words = document.querySelectorAll('.cinema-word');
    words.forEach((element, i) => { seen.add(element); enter(element, i * 130); });
    document.querySelectorAll('.cinema-hero .hero-copy > :not(.cinema-words):not(.eyebrow), .cinema-hero .eyebrow, .hero-dossier, .project-opening > *, .research-opening .project-hero > *, .archive-intro > div > *')
      .forEach((element, i) => { seen.add(element); enter(element, Math.min(i * 75, 360), element.classList.contains('hero-dossier')); });
    if ('IntersectionObserver' in window && enabled()) {
      observer = new IntersectionObserver(entries => {
        entries.filter(entry => entry.isIntersecting).forEach((entry, i) => {
          if (seen.has(entry.target)) return;
          seen.add(entry.target); observer.unobserve(entry.target);
          enter(entry.target, Math.min(i * 85, 255), entry.target.tagName === 'IMG');
        });
      }, { threshold: .1 });
      refresh();
    }
    document.querySelectorAll('.thought-card details').forEach(details => details.addEventListener('toggle', () => {
      if (details.open) enter(details.querySelector('.thought-details'));
    }));
  }
  preference?.addEventListener?.('change', event => {
    if (event.matches) { observer?.disconnect(); updates.forEach(commit => commit()); updates.clear(); active.forEach(animation => animation.cancel()); active.clear(); }
    else if (observer) refresh();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { updates.forEach(commit => commit()); updates.clear(); active.forEach(animation => animation.cancel()); active.clear(); }
  });
  document.addEventListener('focusin', event => {
    active.forEach((animation, element) => { if (element.contains(event.target)) cancel(element); });
  });
  window.AG_MOTION = Object.freeze({ init, enter, animate, cancel, swap, refresh, enabled });
})();
