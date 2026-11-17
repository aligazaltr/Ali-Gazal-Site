/* One isolated controller. Natural scrolling owns progress; no wheel interception. */
(() => {
  const scene=document.querySelector('[data-homepage-scene]');
  const frames=window.AG_HOMEPAGE_FRAMES;
  if(!scene||!frames||!window.matchMedia||!window.requestAnimationFrame)return;
  const stage=scene.querySelector('.hp-stage'), image=scene.querySelector('.hp-media img');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const short=window.matchMedia('(max-height: 560px)');
  const compact=window.matchMedia('(max-width: 700px)');
  let raf=0,visible=true,active=false,intro=null,start=0,travel=1,geometry={};
  const css={camera:['--hp-camera','px'],titleX:['--hp-title-x','px'],titleY:['--hp-title-y','px'],titleZ:['--hp-title-z','px'],titleRotate:['--hp-title-rotate','deg'],titleOpacity:['--hp-title-opacity',''],wingX:['--hp-wing-x','px'],wingZ:['--hp-wing-z','px'],wingRotate:['--hp-wing-rotate','deg'],wingOpacity:['--hp-wing-opacity',''],decisionZ:['--hp-decision-z','px'],decisionY:['--hp-decision-y','px'],decisionOpacity:['--hp-decision-opacity',''],mediaX:['--hp-media-x','px'],mediaY:['--hp-media-y','px'],mediaZ:['--hp-media-z','px'],mediaRotateY:['--hp-media-ry','deg'],mediaRotateZ:['--hp-media-rz','deg'],mediaScale:['--hp-media-scale',''],destinationOpacity:['--hp-destination-opacity',''],groundRotate:['--hp-ground-rotate','deg'],light:['--hp-light',''],progress:['--hp-progress','']};
  function cancelIntro(){intro?.cancel();intro=null;}
  function paint(){
    raf=0;if(!active||document.hidden)return;
    scene.style.setProperty('--hp-lead-in',Math.max(0,start-window.scrollY)+'px');
    geometry.height=stage.clientHeight;
    const p=frames.clamp((window.scrollY-start)/travel);
    if(p>.003)cancelIntro();
    const state=frames.sample(p,geometry);
    for(const [key,[property,unit]] of Object.entries(css))stage.style.setProperty(property,state[key].toFixed(4)+unit);
    scene.dataset.homepageProgress=p.toFixed(4);
    scene.querySelector('.hp-opening').style.visibility=state.titleOpacity===0?'hidden':'visible';
  }
  function request(){if(active&&visible&&!document.hidden&&!raf)raf=window.requestAnimationFrame(paint);}
  function measure(){
    if(!active)return;
    const box=scene.getBoundingClientRect();
    start=window.scrollY+box.top;
    scene.style.setProperty('--hp-lead-in',Math.max(0,start-window.scrollY)+'px');
    travel=Math.max(1,scene.offsetHeight-window.innerHeight);
    geometry={width:stage.clientWidth,height:stage.clientHeight,mobile:compact.matches};
    paint();
  }
  function configure(){
    cancelIntro();if(raf)window.cancelAnimationFrame(raf);raf=0;
    const goodImage=!!image?.complete&&image.naturalWidth>0;
    const largeText=parseFloat(getComputedStyle(document.documentElement).fontSize)>20;
    active=!reduced.matches&&!short.matches&&!largeText&&goodImage;
    scene.classList.toggle('hp-enabled',active);
    if(!active)scene.style.removeProperty('--hp-lead-in');
    scene.dataset.homepageMode=active?'spatial':'static';
    if(!active){stage.removeAttribute('style');scene.querySelector('.hp-opening').style.removeProperty('visibility');return;}
    measure();
    if(window.scrollY<=start+4&&typeof stage.animate==='function'){
      const light=scene.querySelector('.hp-intro-light');
      intro=light.animate([{opacity:.3},{opacity:1}],{duration:1250,easing:'cubic-bezier(.2,.7,.2,1)'});
      intro.finished.then(()=>{intro=null;}).catch(()=>{});
    }
  }
  if('IntersectionObserver' in window){
    const watcher=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else cancelIntro();});
    watcher.observe(scene);
  }
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',configure,{passive:true});
  window.addEventListener('orientationchange',configure,{passive:true});
  window.addEventListener('pageshow',measure);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelIntro();if(raf)window.cancelAnimationFrame(raf);raf=0;}else measure();});
  reduced.addEventListener?.('change',configure);short.addEventListener?.('change',configure);compact.addEventListener?.('change',measure);
  image?.addEventListener('load',configure,{once:true});image?.addEventListener('error',configure,{once:true});
  scene.addEventListener('focusin',cancelIntro);
  configure();
})();
