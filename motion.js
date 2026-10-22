/* Progressive motion. The document is complete and visible before JavaScript runs. */
(() => {
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia?.('(max-width: 56rem)');
  const active = new Map();
  const seen = new WeakSet();
  const updates = new Map();
  const storyCleanups = [];
  let observer;
  let initialized = false;
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  const enabled = () => !document.hidden && !preference?.matches && typeof Element.prototype.animate === 'function';
  const onScreen = element => {
    if (!element || element.hidden || !element.getClientRects().length) return false;
    if (!element.getBoundingClientRect) return true;
    const box = element.getBoundingClientRect();
    return box.bottom > 0 && box.top < window.innerHeight && box.right > 0 && box.left < window.innerWidth;
  };
  function cancel(element, complete = false) {
    if (complete) updates.get(element)?.();
    updates.delete(element);
    active.get(element)?.cancel();
    active.delete(element);
  }
  function cancelTree(element) {
    cancel(element);
    active.forEach((_, child) => { if (element.contains(child)) cancel(child); });
  }
  function animate(element, frames, options = {}) {
    if (!enabled() || !onScreen(element)) return null;
    cancel(element);
    if (active.size >= 12) cancel(active.keys().next().value);
    try {
      const animation = element.animate(frames, { duration: 600, easing: ease, fill: 'none', ...options });
      active.set(element, animation);
      animation.finished.catch(() => {}).finally(() => {
        if (active.get(element) === animation) active.delete(element);
      });
      return animation;
    } catch (_) { return null; }
  }
  function enter(element, delay = 0, image = false) {
    const title = element?.dataset?.reveal === 'title';
    const line = element?.parentElement?.classList.contains('reveal-mask') || element?.parentElement?.classList.contains('word-window');
    const frames = image ? [
      { opacity: .3, transform: 'scale(1.035)', clipPath: 'inset(0 0 16% 0)' },
      { opacity: 1, transform: 'scale(1)', clipPath: 'inset(0 0 0 0)' }
    ] : [
      { opacity: 0, transform: `translateY(${line ? '105%' : compact?.matches ? '14px' : '24px'})`, ...(title ? { clipPath: 'inset(0 0 60% 0)' } : {}) },
      { opacity: 1, transform: 'translateY(0)', ...(title ? { clipPath: 'inset(0 0 0 0)' } : {}) }
    ];
    return animate(element, frames, { delay, duration: compact?.matches ? 560 : 720, fill: 'backwards' });
  }
  // Commit only the latest selection. Child reveals can be composed independently of the exit.
  function swap(element, update, reveal) {
    cancelTree(element);
    if (!enabled() || !onScreen(element)) { update(); return; }
    let updated = false;
    const commit = () => { if (!updated) { updated = true; update(); } };
    const outgoing = animate(element, [
      { opacity: 1, transform: 'scale(1)' }, { opacity: .12, transform: 'scale(.985)' }
    ], { duration: 150 });
    if (!outgoing) { commit(); return; }
    updates.set(element, commit);
    outgoing.finished.then(() => {
      if (active.get(element) !== outgoing) return;
      commit(); updates.delete(element);
      if (reveal) reveal();
      else animate(element, [{ opacity: .15, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360 });
    }).catch(() => {});
  }
  // Read transforms before/after a semantic state change. The same layers travel;
  // no scroll loop, layout interpolation, or animation on an invisible stage.
  function morph(container, update, fromRest = false) {
    const parts = [...(container?.querySelectorAll?.('[data-morph]') || [])];
    const canMove = enabled() && onScreen(container) && typeof window.getComputedStyle === 'function';
    const before = canMove ? parts.map(part => {
      const style = window.getComputedStyle(part);
      return { transform: fromRest ? 'translateY(24px) scale(.9)' : style.transform, opacity: fromRest ? 0 : style.opacity };
    }) : [];
    update();
    if (!canMove) return;
    parts.forEach((part, i) => {
      const style = window.getComputedStyle(part);
      animate(part, [before[i], { transform: style.transform, opacity: style.opacity }],
        { duration: compact?.matches ? 520 : 660, delay: fromRest ? i * 25 : 0, fill: 'backwards' });
    });
  }
  function revealFolio(scene) {
    const folio = scene.querySelector('.local-folio');
    if (!folio) return;
    const state = folio.dataset.folioState;
    if (state !== '0') folio.dataset.folioState = String(Number(state) - 1);
    morph(folio, () => { folio.dataset.folioState = state; }, state === '0');
  }
  function refresh() {
    if (!observer) return;
    document.querySelectorAll('[data-reveal], .section-heading, .process-card, .principle-list > li, .evidence-card, .result-panel, .prose-section, .research-stage, .thought-card, .archive-reading-note, .article-section > h2, .project-card > .project-cover, .project-copy > *, .project-status, .phase-heading, .phase-track > li, .research-preview h2, .research-preview-state, .research-boundary')
      .forEach(element => { if (!seen.has(element) && !element.hidden) observer.observe(element); });
  }
  function setupStories() {
    storyCleanups.splice(0).forEach(cleanup => cleanup());
    if (!('IntersectionObserver' in window)) return;
    document.querySelectorAll('[data-story]').forEach(story => {
      const scenes = [...story.querySelectorAll('[data-story-scene]')];
      const stage = story.querySelector('.story-visual');
      const local = compact?.matches;
      story.dataset.storyMode = local ? 'local' : 'sticky';
      cancelTree(story);
      // Phones have three self-contained scenes. No hidden shared panel receives updates.
      if (local) {
        const watcher = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            const scene = entry.target;
            if (!entry.isIntersecting) { cancelTree(scene); return; }
            if (seen.has(scene)) return;
            seen.add(scene);
            scene.classList.add('is-active');
            enter(scene.querySelector('.scene-number'));
            enter(scene.querySelector('.scene-label'), 80);
            enter(scene.querySelector('h3'), 130);
            enter(scene.querySelector('.scene-description'), 190);
            revealFolio(scene);
          });
        }, { threshold: .15 });
        scenes.forEach(scene => watcher.observe(scene));
        storyCleanups.push(() => watcher.disconnect());
        return;
      }
      const intersecting = new Set();
      let selected = -1;
      const watcher = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) intersecting.add(entry.target); else intersecting.delete(entry.target); });
        const current = [...intersecting].sort((a, b) => Math.abs(a.getBoundingClientRect().top - window.innerHeight * .3) - Math.abs(b.getBoundingClientRect().top - window.innerHeight * .3))[0];
        if (!current) return;
        const next = scenes.indexOf(current);
        if (next === selected) return;
        selected = next;
        morph(stage, () => {
          story.dataset.scene = String(next);
          const folio = stage?.querySelector?.('.idea-folio');
          if (folio) folio.dataset.folioState = String(next);
        });
        scenes.forEach(scene => scene.classList.toggle('is-active', scene === current));
        story.querySelector('[data-story-number]').textContent = String(next + 1).padStart(2, '0');
        story.querySelector('[data-story-label]').textContent = current.querySelector('.scene-label').textContent;
        story.querySelector('[data-story-caption]').textContent = current.querySelector('h3').textContent;
        story.querySelector('[data-story-description]').textContent = current.querySelector('.scene-description').textContent;
        if (onScreen(stage)) animate(story.querySelector('.story-word'), [{ opacity: .2, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420 });
        if (!seen.has(current)) { seen.add(current); enter(current.querySelector('h3')); }
      }, { rootMargin: '-25% 0px -35% 0px', threshold: [0, .2, .6] });
      scenes.forEach(scene => watcher.observe(scene));
      const visibility = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (!entry.isIntersecting) cancelTree(stage); });
      }, { threshold: 0 });
      if (stage) visibility.observe(stage);
      storyCleanups.push(() => { watcher.disconnect(); visibility.disconnect(); });
    });
  }
  function startObserver() {
    if (!('IntersectionObserver' in window) || !enabled()) return;
    observer ||= new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry, i) => {
        if (seen.has(entry.target)) return;
        seen.add(entry.target); observer.unobserve(entry.target);
        enter(entry.target, Math.min(i * 65, 195), entry.target.tagName === 'IMG');
      });
    }, { threshold: .1 });
    refresh();
  }
  function init() {
    if (initialized) return;
    initialized = true;
    setupStories();
    startObserver();
    const opening = (element, delay, image = false) => {
      if (onScreen(element)) { seen.add(element); observer?.unobserve(element); enter(element, delay, image); }
      else observer?.observe(element);
    };
    document.querySelectorAll('.cinema-word').forEach((element, i) => {
      if (!onScreen(element)) { observer?.observe(element); return; }
      seen.add(element);
      animate(element, [
        { transform: 'translateY(108%) skewY(4deg) scale(.97)', opacity: .55 },
        { transform: 'translateY(0) skewY(0deg) scale(1)', opacity: 1 }
      ], { duration: 520, delay: i * 105, fill: 'backwards' });
    });
    document.querySelectorAll('.cinema-hero .hero-copy > :not(.cinema-words):not(.eyebrow), .cinema-hero .eyebrow, .hero-dossier, .project-hero-copy > *, .project-feature-cover img, .research-opening .project-hero > *, .archive-intro > div > *, .about-opening [data-reveal], .projects-page .page-intro > *')
      .forEach((element, i) => opening(element, Math.min(i * 75, 300), element.tagName === 'IMG'));
    // Native details controls semantics and focus. CSS enhances expansion where supported.
    document.querySelectorAll('.thought-card details').forEach(details => details.addEventListener('toggle', () => {
      if (details.open) animate(details.querySelector('.thought-details'), [{ opacity: .3 }, { opacity: 1 }], { duration: 300 });
    }));
  }
  compact?.addEventListener?.('change', () => { if (initialized) setupStories(); });
  preference?.addEventListener?.('change', event => {
    if (event.matches) { observer?.disconnect(); updates.forEach(commit => commit()); updates.clear(); active.forEach(animation => animation.cancel()); active.clear(); }
    else if (initialized) startObserver();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { updates.forEach(commit => commit()); updates.clear(); active.forEach(animation => animation.cancel()); active.clear(); }
  });
  document.addEventListener('focusin', event => {
    active.forEach((_, element) => { if (element.contains(event.target)) cancel(element); });
  });
  window.AG_MOTION = Object.freeze({ init, enter, animate, cancel, cancelTree, swap, refresh, enabled, morph });
})();
