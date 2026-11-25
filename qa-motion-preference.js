// QA only: deterministic reduced-motion emulation before homepage scripts run.
if(new URLSearchParams(location.search).has('qa-reduced')) {
 const native=window.matchMedia.bind(window);
 window.matchMedia=query=>query.includes('prefers-reduced-motion')?{
  media:query,matches:query.includes(': reduce'),onchange:null,
  addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return true}
 }:native(query);
}
