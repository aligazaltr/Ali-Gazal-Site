/* Test branch only: never allowlisted by the release .assetsignore. */
(() => {
  const state = window.__launchQA = {errors:[], violations:[], shares:[], resources:[]};
  window.addEventListener('error', event=>state.errors.push(String(event.message)));
  window.addEventListener('unhandledrejection', event=>state.errors.push(String(event.reason)));
  document.addEventListener('securitypolicyviolation', event=>state.violations.push({directive:event.effectiveDirective,blocked:event.blockedURI,disposition:event.disposition}));
  let options;try { options=parent.__launchOptions; } catch (_) {}
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
