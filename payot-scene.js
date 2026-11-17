/* Measures only on layout changes. Natural scroll drives one requested paint. */
(function(){'use strict';
 const scene=document.querySelector('[data-payot-scene]'),F=window.AG_PAYOT_FRAMES;if(!scene||!F)return;
 const stage=scene.querySelector('.py-stage'),pref=window.matchMedia?.('(prefers-reduced-motion: reduce)');let geometry,start=0,travel=0,paintId=0,measureId=0,visible=true;
 const elements=[...stage.querySelectorAll('*')];
 function fallback(){geometry=null;scene.classList.remove('is-directed');scene.style.removeProperty('--py-scene-height');stage.style.removeProperty('--py-height');stage.style.removeProperty('--py-large-size');stage.style.removeProperty('--py-cover-size');stage.style.removeProperty('--py-book-width');for(const e of elements)e.removeAttribute('style');scene.removeAttribute('data-progress');}
 if(!pref||!window.IntersectionObserver||!window.requestAnimationFrame||!window.CSS?.supports('position','sticky'))return;
 function paint(){paintId=0;if(!geometry||document.hidden)return;const f=F.sample((scrollY-start)/travel,geometry);F.apply(stage,f);scene.dataset.progress=f.progress.toFixed(4);}
 function queue(){if(geometry&&visible&&!paintId)paintId=requestAnimationFrame(paint);}
 function measure(){measureId=0;if(pref.matches||innerHeight<460||parseFloat(getComputedStyle(document.documentElement).fontSize)>24){fallback();return;}
  try{const w=stage.clientWidth,h=Math.min(innerHeight-24,860),bw=Math.min(w*.58,w<680?224:292),largeSize=Math.min(w*.19,190),smallSize=bw*.146;
   stage.style.setProperty('--py-height',h+'px');stage.style.setProperty('--py-book-width',bw+'px');stage.style.setProperty('--py-large-size',largeSize+'px');stage.style.setProperty('--py-cover-size',smallSize+'px');
   const offsets=selector=>{const parent=stage.querySelector(selector),r=parent.getBoundingClientRect();return [...parent.children].map(e=>{const a=e.getBoundingClientRect();return a.left+a.width*.5-r.left-r.width*.5;});};
   geometry={width:w,height:h,bookWidth:bw,largeSize,smallSize,large:offsets('.py-measure-large'),small:offsets('.py-measure-cover')};if(geometry.large.some(x=>!Number.isFinite(x))||w<100)throw Error('Invalid text geometry');
   travel=h*2.5;scene.style.setProperty('--py-scene-height',h+travel+'px');scene.classList.add('is-directed');start=scene.getBoundingClientRect().top+scrollY-12;paint();
  }catch(_){fallback();}
 }
 function remeasure(){if(!measureId)measureId=requestAnimationFrame(measure);}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)queue();},{rootMargin:'100px'}).observe(scene);
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',remeasure,{passive:true});addEventListener('pageshow',remeasure);document.addEventListener('visibilitychange',()=>{if(!document.hidden)remeasure();});
 if(pref.addEventListener)pref.addEventListener('change',remeasure);else pref.addListener(remeasure);
 if(window.ResizeObserver)new ResizeObserver(remeasure).observe(stage);document.fonts?.ready.then(remeasure);document.fonts?.addEventListener?.('loadingdone',remeasure);measure();
})();
