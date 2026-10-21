/* Temporary browser instrumentation, removed before delivery. */
window.__motionLog=[];
const qaOriginalAnimate=Element.prototype.animate;
Element.prototype.animate=function(frames,options){window.__motionLog.push({target:this.className,frames,options});return qaOriginalAnimate.call(this,frames,options)};
const qaMatchMedia=window.matchMedia.bind(window);
try { if (window.parent!==window && window.parent.document.getElementById('reduced')?.checked) window.matchMedia=q=>q.includes('prefers-reduced-motion')?{matches:true,addEventListener(){},removeEventListener(){}}:qaMatchMedia(q); } catch(_) {}
