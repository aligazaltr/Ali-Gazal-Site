/* Temporary, preview-only instrumentation. Removed before delivery. */
window.__motionLog=[];window.__shareLog=[];window.__pageErrors=[];
window.addEventListener('error',event=>window.__pageErrors.push(event.message));
const qaOriginalAnimate=Element.prototype.animate;
Element.prototype.animate=function(frames,options){const rect=this.getBoundingClientRect();window.__motionLog.push({target:this.className,owner:this.closest('[data-story-scene]')?.id,frames,options,top:Math.round(rect.top),bottom:Math.round(rect.bottom),height:innerHeight});return qaOriginalAnimate.call(this,frames,options)};
const qaMatchMedia=window.matchMedia.bind(window);
try{
if(window.parent!==window&&window.parent.document.getElementById('reduced')?.checked)window.matchMedia=q=>q.includes('prefers-reduced-motion')?{matches:true,addEventListener(){},removeEventListener(){}}:qaMatchMedia(q);
if(window.parent!==window&&window.parent.document.getElementById('mockshare')?.checked){Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>window.__shareLog.push({kind:'share',...payload})});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.__shareLog.push({kind:'copy',text})}});}
}catch(_){}
