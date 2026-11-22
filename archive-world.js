(() => {
  if (!('IntersectionObserver' in window) || typeof Element.prototype.animate !== 'function') return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const portraits = window.matchMedia('(max-width: 43rem)');
  const savesData = navigator.connection?.saveData;
  const cameraEase = 'cubic-bezier(.25,.2,.3,.88)';
  const textEase = 'cubic-bezier(.19,.7,.26,1)';
  const textFrames = [
    {transform:'translateY(.4em)', clipPath:'inset(0 -5% 92% -5%)', opacity:.12},
    {transform:'translateY(.14em)', clipPath:'inset(-18% -5% 38% -5%)', opacity:.72, offset:.44},
    {transform:'translateY(0)', clipPath:'inset(-20% -5% -24% -5%)', opacity:1}
  ];
  const revealText = (element, delay = 0) => element.animate(textFrames, {
    duration: 760, delay, easing:textEase, fill:'backwards'
  });

  const motion = {
    room: {
      wide: ['scale(1.025) translate(-.3%, .1%)', 'scale(1.125) translate(-2.8%, 1.45%)'],
      narrow: ['scale(1.025)', 'scale(1.105) translate(-1.9%, 1.45%)']
    },
    desk: {
      wide: ['scale(1.025) translate(-.3%, .1%)', 'scale(1.155) translate(-2.1%, 1.35%)'],
      narrow: ['scale(1.025)', 'scale(1.135) translate(-1.55%, 1.45%)']
    },
    branch: {
      wide: ['translate(-6%, -5%) rotate(-9deg) scale(.84)', 'translate(-17%, 6%) rotate(-1deg) scale(1.075)', 'translate(-13%, 3%) rotate(-2.5deg) scale(1.09)'],
      narrow: ['translate(-8%, -4%) rotate(-8deg) scale(.85)', 'translate(-16%, 5%) rotate(-1deg) scale(1.065)', 'translate(-13%, 2%) rotate(-2deg) scale(1.08)']
    },
    sun: {
      wide: ['translateX(-11%) scale(.92)', 'translateX(4%) scale(1.1)'],
      narrow: ['translateX(-9%) scale(.92)', 'translateX(3%) scale(1.08)']
    }
  };

  for (const scene of document.querySelectorAll('[data-world-scene]')) {
    const planes = [...scene.querySelectorAll('[data-world-plane]')];
    const button = scene.querySelector('[data-world-toggle]');
    const layers = [...scene.querySelectorAll('.world-parallax img')];
    const words = [...scene.querySelectorAll('[data-world-word]')];
    let layered = false;
    let decoding;
    let animations = [];
    let visible = false;
    let paused = false;
    let frame = 0;

    function active() {
      return visible && !document.hidden && !preference.matches && !savesData;
    }

    function paint() {
      frame = 0;
      if (!active() || paused) return;
      const bounds = scene.getBoundingClientRect();
      const travel = Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height)));
      scene.style.setProperty('--world-drift', `${(travel * Math.min(105, bounds.height * .22)).toFixed(2)}px`);
    }

    function schedule() {
      if (active() && !paused && !frame) frame = window.requestAnimationFrame(paint);
    }

    function updateButton() {
      if (!button) return;
      button.hidden = preference.matches || !!savesData;
      button.textContent = animations.length && animations.every(item => item.playState === 'finished')
        ? 'Sahneyi tekrar oynat'
        : paused ? 'Hareketi sürdür' : 'Hareketi durdur';
    }

    function makeAnimations() {
      const direction = portraits.matches ? 'narrow' : 'wide';
      const duration = button ? 4900 : 3400;
      const camera = planes.filter(plane => !plane.closest('.world-parallax') || layered).map(plane => {
        const kind = plane.dataset.worldPlane;
        const transforms = motion[kind][direction];
        const frames = transforms.map(transform => ({transform}));
        if (kind === 'branch') frames[1].offset = .68;
        if (kind === 'sun') {
          frames[0].opacity = .15;
          frames[1].opacity = .45;
        }
        return plane.animate(frames, {duration, easing:cameraEase, fill:'both'});
      });
      const sequence = [...camera, ...words.map((word, i) => revealText(word, (button ? 270 : 95) + 105 * i))];
      sequence.forEach(animation => animation.addEventListener('finish', updateButton));
      return sequence;
    }

    function synchronize() {
      if (preference.matches) {
        animations.forEach(item => item.cancel());
        animations = [];
        scene.style.removeProperty('--world-drift');
        scene.removeAttribute('data-world-layered');
      } else if (active() && !paused) {
        if (layers.length && !layered && !decoding) {
          const pending = Promise.all(layers.map(layer => layer.decode()));
          decoding = pending;
          pending.then(() => {
            if (decoding !== pending) return;
            layered = true;
            const currentTime = animations[0]?.currentTime ?? 0;
            animations.forEach(item => item.cancel());
            animations = active() ? makeAnimations() : [];
            animations.forEach(item => { item.currentTime = currentTime; });
            synchronize();
          }).catch(() => {});
        }
        if (layered) scene.dataset.worldLayered = '';
        if (!animations.length) animations = makeAnimations();
        else animations.filter(item => item.playState === 'paused').forEach(item => item.play());
        schedule();
      } else {
        animations.filter(item => item.playState === 'running').forEach(item => item.pause());
      }
      updateButton();
    }

    scene.addEventListener('focusin', event => {
      animations.forEach(item => {
        const target = item.effect?.target;
        if (target?.hasAttribute('data-world-word') && target.contains(event.target)) item.finish();
      });
    });

    button?.addEventListener('click', () => {
      const ended = animations.every(item => item.playState === 'finished');
      paused = ended ? false : !paused;
      if (ended) for (const item of animations) item.currentTime = 0;
      synchronize();
    });

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    }, {threshold:.04}).observe(scene);
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule, {passive:true});
    document.addEventListener('visibilitychange', synchronize);
    preference.addEventListener('change', synchronize);
    portraits.addEventListener('change', () => {
      animations.forEach(item => item.cancel());
      animations = [];
      layered = false;
      decoding = undefined;
      scene.removeAttribute('data-world-layered');
      synchronize();
    });
    updateButton();
  }

  const pageReveals = new Set();
  const reader = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reader.unobserve(entry.target);
      if (preference.matches || savesData || document.hidden) continue;
      const animation = revealText(entry.target);
      pageReveals.add(animation);
      animation.finished.catch(() => {}).finally(() => pageReveals.delete(animation));
    }
  }, {threshold:.24});
  document.querySelectorAll('[data-world-reveal]').forEach(heading => reader.observe(heading));
  preference.addEventListener('change', () => {
    if (preference.matches) pageReveals.forEach(animation => animation.cancel());
  });
})();
