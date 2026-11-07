/* Test branch only: never allowlisted by the release .assetsignore. */
(() => {
  const state = window.__launchQA = {errors:[], violations:[], shares:[], resources:[],imageLifecycle:[]};
  window.addEventListener('error', event=>state.errors.push(String(event.message)));
  window.addEventListener('unhandledrejection', event=>state.errors.push(String(event.reason)));
  document.addEventListener('securitypolicyviolation', event=>state.violations.push({directive:event.effectiveDirective,blocked:event.blockedURI,disposition:event.disposition}));
  let options;try { options=parent.__launchOptions; } catch (_) {}
  const params=new URLSearchParams(location.search);
  if(params.has('v5measure'))localStorage.setItem('ag-theme',params.get('theme')==='light'?'light':'dark');
  if(options?.text200)document.documentElement.style.fontSize='200%';
  const metric={lcpMs:null,cls:0,shifts:[],longTasks:0,longestTaskMs:0,observedInteractionMs:[]};
  for(const type of ['largest-contentful-paint','layout-shift','longtask','event']) {
    if(!window.PerformanceObserver?.supportedEntryTypes.includes(type))continue;
    try {new PerformanceObserver(list=>{
      for(const e of list.getEntries()){
        if(type==='largest-contentful-paint')metric.lcpMs=e.startTime;
        if(type==='layout-shift'&&!e.hadRecentInput){metric.cls+=e.value;metric.shifts.push({at:e.startTime,value:e.value,sources:e.sources.map(s=>({node:s.node?.tagName+'#'+(s.node?.id||'')+'.'+(s.node?.className||''),previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))});}
        if(type==='longtask'){metric.longTasks++;metric.longestTaskMs=Math.max(metric.longestTaskMs,e.duration);}
        if(type==='event'&&e.interactionId)metric.observedInteractionMs.push(e.duration);
      }
    }).observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})});}catch(_){}
  }
  if(params.has('v5measure'))document.addEventListener('DOMContentLoaded',()=>{
    const button=document.createElement('button');button.id='v5-measure-dump';button.textContent='QA · Ölçümü göster';
    button.style.cssText='position:fixed;right:8px;top:8px;z-index:999999;min-height:32px;background:#fff;color:#111;font:12px system-ui;border:1px solid #111;padding:8px';
    const result=document.createElement('pre');result.id='v5-metrics';result.hidden=true;
    result.style.cssText='position:fixed;inset:48px 8px auto auto;max-width:650px;max-height:70vh;overflow:auto;z-index:999999;background:#fff;color:#111;font:12px monospace;padding:16px;white-space:pre-wrap';
    button.onclick=()=>{
      const n=performance.getEntriesByType('navigation')[0];
      result.hidden=false;
      result.textContent=JSON.stringify({test:'top-level lab observation',path:location.pathname,theme:document.documentElement.dataset.theme,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},...metric,inp:null,inpNote:'No field INP claimed; recorded event durations are individual lab interactions only.',navigation:n?{ttfbMs:n.responseStart,domContentLoadedMs:n.domContentLoadedEventEnd,loadMs:n.loadEventEnd}:null,resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize,durationMs:r.duration})),errors:state.errors,violations:state.violations},null,2);
    };
    document.body.append(button,result);
  });
  for(const eventName of ['load','error'])document.addEventListener(eventName,event=>{const i=event.target;if(i?.tagName==='IMG')state.imageLifecycle.push({event:eventName,at:performance.now(),src:i.currentSrc||i.src,complete:i.complete,width:i.naturalWidth});},true);
  state.videoActivations=[];
  document.addEventListener('click',event=>{
    const a=event.target.closest?.('a[data-published-cover],a[data-project-video-link]');
    if(!a||!location.pathname.includes('_v5-published'))return;
    event.preventDefault();
    state.videoActivations.push({href:a.href,target:a.target,rel:a.rel,trusted:event.isTrusted,detail:event.detail});
    let result=document.getElementById('v5-activation');
    if(!result){result=document.createElement('pre');result.id='v5-activation';result.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:999999;background:#fff;color:#111;font:12px monospace;padding:8px';document.body.append(result);}
    result.textContent=JSON.stringify(state.videoActivations);
  },true);
  if (options?.reduced) {
    const original=window.matchMedia.bind(window);
    window.matchMedia=query=>query.includes('prefers-reduced-motion') ? {matches:true,media:query,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}} : original(query);
  }
  if (options?.mock) {
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>state.shares.push({method:'clipboard',text})}});
    Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>state.shares.push({method:'share',...payload})});
    Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});
  }
})();

// Explicit capability simulations; not physical old-browser measurements.
try{const o=parent.__launchOptions;if(o?.noObserver)window.IntersectionObserver=undefined;if(o?.noSticky){const supports=CSS.supports.bind(CSS);CSS.supports=(p,v)=>p==='position'&&v==='sticky'?false:supports(p,v);}if(o?.largeText)document.documentElement.style.fontSize='200%';}catch(_){}
