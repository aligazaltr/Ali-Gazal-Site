/* Review-only capability simulations and console evidence. No private fixtures. */
window.__controlQA={errors:[],violations:[]};
addEventListener('error',e=>window.__controlQA.errors.push(String(e.message||'resource error')));
addEventListener('unhandledrejection',e=>window.__controlQA.errors.push(String(e.reason)));
addEventListener('securitypolicyviolation',e=>window.__controlQA.violations.push({directive:e.violatedDirective,blocked:e.blockedURI}));
try{const o=parent.controlOptions||{};if(o.noObserver)window.IntersectionObserver=undefined;
 if(o.reduced){const real=window.matchMedia.bind(window);window.matchMedia=q=>q==='(prefers-reduced-motion: reduce)'?{matches:true,media:q,addEventListener(){},addListener(){}}:real(q);}
 if(o.largeText)document.documentElement.style.fontSize='200%';
}catch(_){}
