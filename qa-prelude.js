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
window.__vitals={lcp:null,cls:0,maxEventDuration:null,mode:'lab iframe, no throttling'};
try {new PerformanceObserver(list=>{for(const e of list.getEntries())window.__vitals.lcp={ms:Math.round(e.startTime),element:e.element?.className,size:e.size};}).observe({type:'largest-contentful-paint',buffered:true});}catch(_){}
let qaSessionValue=0,qaSessionStart=0,qaLastShift=0;
try {new PerformanceObserver(list=>{for(const e of list.getEntries()){if(e.hadRecentInput)continue;if(e.startTime-qaLastShift>1000||e.startTime-qaSessionStart>5000){qaSessionValue=0;qaSessionStart=e.startTime;}qaSessionValue+=e.value;qaLastShift=e.startTime;window.__vitals.cls=Math.max(window.__vitals.cls,qaSessionValue);}}).observe({type:'layout-shift',buffered:true});}catch(_){}
try {new PerformanceObserver(list=>{for(const e of list.getEntries())if(e.interactionId)window.__vitals.maxEventDuration=Math.max(window.__vitals.maxEventDuration||0,e.duration);}).observe({type:'event',durationThreshold:16,buffered:true});}catch(_){}
