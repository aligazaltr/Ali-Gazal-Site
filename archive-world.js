(() => {
  if (!('IntersectionObserver' in window) || typeof Element.prototype.animate !== 'function') return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const portraits = window.matchMedia('(max-width: 43rem)');
  const savesData = navigator.connection?.saveData;
  const motion = {
    room: {
      wide: ['scale(1.025) translate(-.3%, .1%)', 'scale(1.115) translate(-1.9%, .8%)'],
      narrow: ['scale(1.025)', 'scale(1.105) translate(-1.2%, 1.25%)']
    },
    desk: {
      wide: ['scale(1.025) translate(-.3%, .1%)', 'scale(1.155) translate(-2.1%, 1.35%)'],
      narrow: ['scale(1.025)', 'scale(1.135) translate(-1.55%, 1.45%)']
    },
    branch: {
      wide: ['translate(-19%, 9%) rotate(-7deg) scale(.84)', 'translate(-2%, -1%) rotate(1deg) scale(1.07)'],
      narrow: ['translate(-22%, 6%) rotate(-8deg) scale(.86)', 'translate(-2%, -2%) rotate(0deg) scale(1.07)']
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
      const duration = button ? 5350 : 3400;
      return planes.filter(plane => !plane.closest('.world-parallax') || layered).map(plane => {
        const [start, end] = motion[plane.dataset.worldPlane][direction];
        const frames = [{transform:start}, {transform:end}];
        if (plane.dataset.worldPlane === 'sun') {
          frames[0].opacity = .15;
          frames[1].opacity = .45;
        }
        const animation = plane.animate(frames, {duration, easing:'cubic-bezier(.18,.58,.24,1)',fill:'both'});
        animation.addEventListener('finish', updateButton);
        return animation;
      });
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
            animations = makeAnimations();
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
})();
