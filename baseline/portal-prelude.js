/* Isolated QA only: public fixtures, no private diary or production behavior changes. */
window.__portalQA={errors:[],violations:[],longTasks:[],shifts:[],lcp:[],rafGaps:[]};
addEventListener('error',e=>window.__portalQA.errors.push(String(e.message||'resource error')));
addEventListener('unhandledrejection',e=>window.__portalQA.errors.push(String(e.reason)));
addEventListener('securitypolicyviolation',e=>window.__portalQA.violations.push({directive:e.violatedDirective,blocked:e.blockedURI}));
for(const [type,key] of [['longtask','longTasks'],['layout-shift','shifts'],['largest-contentful-paint','lcp']])try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__portalQA[key].push({value:e.value||0,duration:e.duration,start:e.startTime,hadRecentInput:e.hadRecentInput||false});}).observe({type,buffered:true});}catch(_){}
try{const o=parent.controlOptions||{};if(o.noObserver)delete window.IntersectionObserver;
 if(o.reduced){const real=window.matchMedia.bind(window);window.matchMedia=q=>q==='(prefers-reduced-motion: reduce)'?{matches:true,media:q,addEventListener(){},addListener(){}}:real(q);}
 if(o.largeText)document.documentElement.style.fontSize='200%';
}catch(_){}
