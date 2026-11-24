(() => {
  const journey = document.querySelector('[data-journey]');
  if (!journey) return;
  const scenes = [...journey.querySelectorAll('[data-journey-scene]')];
  const links = [...journey.querySelectorAll('.journey-wayfinder a')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const leaves = journey.querySelector('.journey-near-leaves');
  const light = journey.querySelector('.journey-light');
  let frame = 0;
  let selected = -1;
  const clamp = value => Math.min(1, Math.max(0, value));
  const smooth = value => value * value * (3 - 2 * value);

  function paint() {
    frame = 0;
    if (preference.matches || document.hidden) return;
    const height = journey.querySelector('.journey-stage').clientHeight;
    const distance = Math.max(1, journey.offsetHeight - height);
    const progress = clamp(-journey.getBoundingClientRect().top / distance) * (scenes.length - 1);
    const active = Math.min(scenes.length - 1, Math.floor(progress + .55));
    scenes.forEach((scene, index) => {
      const local = progress - index;
      const entering = smooth(clamp((local + .83) / .66));
      const leaving = smooth(clamp((local - .17) / .66));
      const visible = index === 0 ? local < 1 : local > -.84 && local < 1;
      scene.style.visibility = visible ? 'visible' : 'hidden';
      scene.style.zIndex = index;
      // The next room opens through the arch at the vanishing point.
      scene.style.clipPath = index === 0 || entering === 1 ? 'none' : `ellipse(${entering * 155}% ${entering * 150}% at 74% 43%)`;
      scene.style.transform = `translate3d(${-leaving * 6}%,0,${-leaving * 90}px)`;
      const landscape = scene.querySelector('.journey-landscape');
      if (landscape) landscape.style.transform = `scale(${1.14 - entering * .14 + leaving * .28}) translate(${-leaving * 5}%,${leaving * 2}%)`;
      const copy = scene.querySelector('.journey-copy, .world-hero-copy');
      copy.style.opacity = index === 0 ? 1 - leaving : clamp((local + .43) / .23) * (1 - leaving);
      copy.style.transform = `translate3d(0,${(1 - entering) * 55 - leaving * 30}px,0)`;
      scene.inert = index !== active;
    });
    leaves.style.transform = `translate3d(${-Math.sin(progress * 1.2) * 25}%,${Math.cos(progress) * 8}%,${progress * 12}px) rotate(${-6 + Math.sin(progress) * 8}deg) scale(${1 + .12 * Math.sin(progress)})`;
    leaves.style.opacity = progress < .3 ? 0 : .65;
    const phase = progress - Math.floor(progress);
    light.style.opacity = Math.sin(clamp((phase - .15) / .7) * Math.PI) * .28;
    if (active !== selected) {
      selected = active;
      journey.dataset.journeyActive = active;
      links.forEach((link, index) => index === active ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function configure() {
    if (preference.matches) {
      delete journey.dataset.journeyReady;
      scenes.forEach(scene => {
        scene.removeAttribute('style');
        scene.inert = false;
        scene.querySelector('.journey-landscape')?.removeAttribute('style');
        scene.querySelector('.journey-copy, .world-hero-copy').removeAttribute('style');
      });
    } else {
      journey.dataset.journeyReady = '';
      schedule();
    }
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (preference.matches) return;
    event.preventDefault();
    const height = journey.querySelector('.journey-stage').clientHeight;
    const top = scrollY + journey.getBoundingClientRect().top + index / (scenes.length - 1) * (journey.offsetHeight - height);
    window.scrollTo({top, behavior: 'smooth'});
  }));
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule, {passive: true});
  document.addEventListener('visibilitychange', schedule);
  preference.addEventListener('change', configure);
  configure();
})();
