/* One passive scroll listener; measure on layout changes, never in the paint path. */
(function(){
 'use strict';
 const scene=document.querySelector('[data-control-scene]'),F=window.AG_CONTROL_FRAMES;
 if(!scene||!F)return;
 const stage=scene.querySelector('.portal-stage'),svg=stage.querySelector('svg'),counter=stage.querySelector('.portal-counter');
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const original=[...stage.querySelectorAll('svg,svg *, .portal-question,.portal-measure')].map(e=>[e,[...e.attributes].map(a=>[a.name,a.value])]);
 let geometry=null,start=0,travel=0,ticket=0,measureTicket=0,visible=true;
 const fallback=()=>{for(const [e,attrs] of original){for(const a of [...e.attributes])e.removeAttribute(a.name);for(const [n,v] of attrs)e.setAttribute(n,v);}geometry=null;scene.classList.remove('is-directed');scene.style.removeProperty('--control-height');stage.style.removeProperty('--stage-height');scene.removeAttribute('data-progress');};
 if(!reduced||!window.IntersectionObserver||!window.requestAnimationFrame||!window.CSS?.supports('position','sticky')||!counter.getPointAtLength||!counter.isPointInFill){fallback();return;}
 function paint(){ticket=0;if(!geometry||document.hidden)return;const f=F.sample((window.scrollY-start)/travel,geometry);F.apply(stage,f);scene.dataset.progress=f.progress.toFixed(4);}
 function queue(){if(!ticket&&visible&&geometry)ticket=requestAnimationFrame(paint);}
 function measure(){
  measureTicket=0;
  if(reduced.matches||window.innerHeight<420||parseFloat(getComputedStyle(document.documentElement).fontSize)>24){fallback();return;}
  try{
   const width=stage.clientWidth,height=Math.min(840,window.innerHeight-32),bounds=svg.dataset.glyphBounds.split(' ').map(Number),center=svg.dataset.counterCenter.split(' ').map(Number);
   // Sample the ACTUAL closed counter; subtract arc spacing to bound the radius conservatively.
   const length=counter.getTotalLength(),step=length/256;let radius=Infinity;
   for(let i=0;i<256;i++){const v=counter.getPointAtLength(i*step);radius=Math.min(radius,Math.hypot(v.x-center[0],v.y-center[1]));}
   radius-=step;
   if(width<100||height<300||!Number.isFinite(radius)||radius<=0)throw Error('Invalid portal geometry');
   geometry={width,height,bounds,center,radius};
   svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.dataset.width=width;svg.dataset.height=height;
   for(const e of svg.querySelectorAll('.portal-depth-field')){e.setAttribute('width',width);e.setAttribute('height',height);}
   travel=height*1.95;stage.style.setProperty('--stage-height',height+'px');scene.style.setProperty('--control-height',(height+travel)+'px');scene.classList.add('is-directed');
   start=scene.getBoundingClientRect().top+window.scrollY-12;paint();
  }catch(_){fallback();}
 }
 function scheduleMeasure(){if(!measureTicket)measureTicket=requestAnimationFrame(measure);}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queue();},{rootMargin:'150px'});observer.observe(scene);
 window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',scheduleMeasure,{passive:true});
 window.addEventListener('pageshow',scheduleMeasure);document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleMeasure();});
 if(reduced.addEventListener)reduced.addEventListener('change',scheduleMeasure);else reduced.addListener(scheduleMeasure);
 if(window.ResizeObserver)new ResizeObserver(scheduleMeasure).observe(stage);
 document.fonts?.ready.then(scheduleMeasure);document.fonts?.addEventListener?.('loadingdone',scheduleMeasure);
 measure();
})();
