/* Progressive enhancement only: natural scrolling, no idle animation loop. */
(()=>{
  const scene=document.querySelector('[data-control-scene]'),frames=window.AG_CONTROL_FRAMES;
  if(!scene||!frames)return;
  const stage=scene.querySelector('.control-stage');
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if(!reduced||!window.IntersectionObserver||!window.requestAnimationFrame||!window.CSS?.supports('position','sticky'))return;
  let start=0,travel=1,visible=false,active=false,pending=0,measurePending=0;
  function cancel(){if(pending)cancelAnimationFrame(pending);pending=0;}
  function fallback(){cancel();active=false;scene.classList.remove('is-directed');scene.style.removeProperty('--control-height');stage.removeAttribute('style');delete scene.dataset.progress;}
  function paint(){pending=0;if(!active||document.hidden)return;const f=frames.sample((window.scrollY-start)/travel);frames.apply(stage,f);scene.dataset.progress=f.progress.toFixed(4);}
  function schedule(){if(active&&visible&&!document.hidden&&!pending)pending=requestAnimationFrame(paint);}
  function measure(){measurePending=0;cancel();if(reduced.matches||innerHeight<420||parseFloat(getComputedStyle(document.documentElement).fontSize)>24){fallback();return;}
    scene.classList.add('is-directed');const h=stage.getBoundingClientRect().height;travel=Math.max(280,Math.min(580,h*.65));
    scene.style.setProperty('--control-height',`${h+travel}px`);start=scene.getBoundingClientRect().top+scrollY-12;active=true;paint();}
  function resize(){if(!measurePending)measurePending=requestAnimationFrame(measure);}
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)schedule();else cancel();});observer.observe(scene);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize,{passive:true});addEventListener('pageshow',resize);
  document.addEventListener('visibilitychange',()=>document.hidden?cancel():schedule());
  if(reduced.addEventListener)reduced.addEventListener('change',resize);else reduced.addListener?.(resize);
  if(window.ResizeObserver)new ResizeObserver(resize).observe(stage);
  measure();
})();
