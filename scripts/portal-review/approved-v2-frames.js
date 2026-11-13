/* Pure, reversible camera geometry. No timers or DOM reads. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AG_CONTROL_FRAMES=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 const span=(p,a,b)=>ease((p-a)/(b-a));
 const mix=(a,b,t)=>a+(b-a)*t;
 function sample(progress,g){
  const p=clamp(progress),w=g.width,h=g.height,b=g.bounds,c=g.center;
  const base=Math.min(w*.92/(b[2]-b[0]),h*.6/(b[3]-b[1]));
  const bx=w/2-base*(b[0]+b[2])/2,by=h*.47-base*(b[1]+b[3])/2;
  const initialX=bx+base*c[0],initialY=by+base*c[1];
  const approach=span(p,.10,.43),aim=span(p,.10,.35);
  // The measured inscribed radius guarantees full viewport coverage BEFORE removal.
  const coverScale=Math.hypot(w/2,h*.53)/g.radius*1.04;
  const scale=base*Math.pow(coverScale/base,approach);
  const cx=mix(initialX,w/2,aim),cy=mix(initialY,h*.47,aim);
  const matrix=[scale,0,0,scale,cx-scale*c[0],cy-scale*c[1]];
  const camera=2.6*span(p,.25,.68),question=span(p,.64,.84),final=span(p,.85,1);
  const fw=Math.min(w*.92,1000),fh=fw*9/16,qwidth=mix(w*.90,fw*.84,final),qheight=mix(h*.40,fh*.64,final);
  const gates=Array.from({length:9},(_,i)=>{
   const z=1.35+i*.64-camera,s=.84/Math.max(.08,z),a=clamp((z-.2)/.5)*clamp((8-z)/4)*(1-span(p,.63,.86));
   return{x:cx-w*.37*s,y:cy-h*.37*s,width:w*.74*s,height:h*.74*s,opacity:a*.55};
  });
  return {progress:p,matrix,cx,cy,scale,coverScale,foreground:1-span(p,.43,.46),measure:1-span(p,.06,.21),world:span(p,0,.16),gates,
   question,questionWidth:qwidth,questionHeight:qheight,questionX:w/2,questionY:h*.47,questionScale:mix(1,.90,final),
   slit:mix(0,qwidth/2,question),lineShift:mix(54,0,question),frame:{x:(w-fw)/2,y:h*.47-fh/2,width:fw,height:fh,opacity:final},final};
 }
 function apply(el,f){
  const matrix=`matrix(${f.matrix.join(' ')})`;
  el.querySelector('.portal-number').setAttribute('transform',matrix);
  el.querySelector('.portal-counter').setAttribute('transform',matrix);
  el.querySelector('.portal-foreground').style.opacity=f.foreground;
  el.querySelector('.portal-world').style.opacity=f.world;
  el.querySelectorAll('.portal-gate').forEach((e,i)=>{const a=f.gates[i];for(const k of ['x','y','width','height'])e.setAttribute(k,a[k]);e.style.opacity=a.opacity;});
  const w=+el.querySelector('svg').getAttribute('data-width'),h=+el.querySelector('svg').getAttribute('data-height');
  el.querySelector('.portal-rays').setAttribute('d',`M0 0L${f.cx} ${f.cy}L${w} 0M0 ${h}L${f.cx} ${f.cy}L${w} ${h}`);
  el.querySelector('.portal-rays').style.opacity=(1-f.question)*.22;
  el.querySelector('.portal-horizon').setAttribute('d',`M${f.cx-12} ${f.cy}h24M${f.cx} ${f.cy-12}v24`);
  el.querySelector('.portal-horizon').style.opacity=(1-f.question)*.7;
  const r=el.querySelector('.portal-final-frame');for(const k of ['x','y','width','height'])r.setAttribute(k,f.frame[k]);r.style.opacity=f.frame.opacity;
  const q=el.querySelector('.portal-question');q.style.width=f.questionWidth+'px';q.style.left=f.questionX+'px';q.style.top=f.questionY+'px';q.style.transform=`translate(-50%,-50%) scale(${f.questionScale})`;
  q.style.clipPath=`inset(0 ${50*(1-f.question)}%)`;q.style.visibility='visible';q.style.setProperty('--line-shift',f.lineShift+'px');
  const railH=(1-f.final)*f.questionHeight/2;el.querySelector('.portal-rails').setAttribute('d',`M${f.questionX-f.slit} ${f.cy-railH}v${railH*2}M${f.questionX+f.slit} ${f.cy-railH}v${railH*2}`);el.querySelector('.portal-rails').style.opacity=f.question*(1-f.final);
  el.querySelector('.portal-measure').style.opacity=f.measure;
 }
 return {clamp,ease,sample,apply};
});
