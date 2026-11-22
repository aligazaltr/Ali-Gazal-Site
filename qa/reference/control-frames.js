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
  const question=span(p,.64,.84),final=span(p,.85,1);
  const fw=Math.min(w*.92,1000),fh=fw*9/16,qwidth=mix(w*.90,fw*.84,final);
  const depth=mix(.22,1,span(p,.20,.65));
  // Three open material planes share the zero's vanishing point. The camera
  // advances through their depth; no closed rings, screen rays or centre target.
  const camera=1.22*span(p,.18,.72);
  const folds=[['left',1.80,.48],['right',3.00,.52],['floor',4.30,.58]].map(([side,depth,thickness])=>{
   const z=depth-camera,nw=w*.62/z,nh=h*.50/z,fw=w*.62/(z+thickness),fh=h*.50/(z+thickness);
   let points,edge;
   if(side==='left'){points=[[-nw,-nh],[-nw,nh],[nw,nh],[fw,fh],[-fw,fh],[-fw,-fh]];edge=[[-fw,-fh],[-fw,fh],[fw,fh]];}
   else if(side==='right'){points=[[-nw,-nh],[nw,-nh],[nw,nh],[fw,fh],[fw,-fh],[-fw,-fh]];edge=[[-fw,-fh],[fw,-fh],[fw,fh]];}
   else{points=[[-nw,nh],[-nw,-nh],[nw,-nh],[fw,-fh],[-fw,-fh],[-fw,fh]];edge=[[fw,-fh],[-fw,-fh],[-fw,fh]];}
   const path=pts=>pts.map(([x,y],i)=>`${i?'L':'M'}${(cx+x).toFixed(3)} ${(cy+y).toFixed(3)}`).join('');
   return {side,z,path:path(points)+'Z',edge:path(edge)};
  });
  return {progress:p,matrix,cx,cy,scale,coverScale,foreground:1-span(p,.43,.46),measure:1-span(p,.06,.21),world:span(p,0,.16)*(1-span(p,.62,.84)),depthX:w*.7*depth,depthY:h*.8*depth,folds,
   question,questionWidth:qwidth,questionX:w/2,questionY:h*.47,questionScale:mix(1,.90,final),
   lineShift:mix(54,0,question),frame:{x:(w-fw)/2,y:h*.47-fh/2,width:fw,height:fh,opacity:final},final};
 }
 // Parse the fixed glyph once. Bake its affine coordinates into the viewport;
 // no luminance mask or enlarged group transform is needed by the compositor.
 function parsePath(d){
  const tokens=d.match(/[MLQHVZ]|-?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi),out=[];let i=0,x=0,y=0;
  while(i<tokens.length){const cmd=tokens[i++].toUpperCase();let v;
   if(cmd==='Z'){out.push(['Z']);continue;}
   if(cmd==='H'){x=+tokens[i++];out.push(['L',x,y]);continue;}
   if(cmd==='V'){y=+tokens[i++];out.push(['L',x,y]);continue;}
   const n=cmd==='Q'?4:cmd==='M'||cmd==='L'?2:0;if(!n)throw Error('Unsupported portal contour');
   v=tokens.slice(i,i+n).map(Number);i+=n;x=v[n-2];y=v[n-1];out.push([cmd,...v]);
  }return out;
 }
 const coordinate=v=>Number(v.toFixed(4));
 function transformPath(commands,m){return commands.map(([cmd,...v])=>cmd+v.map((n,i)=>coordinate(n*m[0]+m[i%2?5:4])).join(' ')).join('');}
 const prepared=new WeakMap();
 function prepare(el){
  if(prepared.has(el))return prepared.get(el);
  const counter=el.querySelector('.portal-counter'),number=el.querySelector('.portal-number');
  const a={opening:el.querySelector('.portal-opening'),counter:parsePath(counter.getAttribute('d')),number,
   paths:[...number.querySelectorAll('path')].map(e=>[e,parsePath(e.getAttribute('d'))])};prepared.set(el,a);return a;
 }
 function apply(el,f){
  const a=prepare(el);a.number.removeAttribute('transform');
  a.opening.setAttribute('d',transformPath(a.counter,f.matrix));
  for(const [e,commands] of a.paths)e.setAttribute('d',transformPath(commands,f.matrix));
  el.querySelector('.portal-foreground').style.opacity=f.foreground;
  el.querySelector('.portal-world').style.opacity=f.world;
  el.querySelector('#control-depth').setAttribute('gradientTransform',`translate(${f.cx} ${f.cy}) scale(${f.depthX} ${f.depthY})`);
  el.querySelectorAll('.portal-fold').forEach((e,i)=>{e.querySelector('.portal-fold-face').setAttribute('d',f.folds[i].path);e.querySelector('.portal-fold-edge').setAttribute('d',f.folds[i].edge);});
  const r=el.querySelector('.portal-final-frame');for(const k of ['x','y','width','height'])r.setAttribute(k,f.frame[k]);r.style.opacity=f.frame.opacity;
  const q=el.querySelector('.portal-question');q.style.width=f.questionWidth+'px';q.style.left=f.questionX+'px';q.style.top=f.questionY+'px';q.style.transform=`translate(-50%,-50%) scale(${f.questionScale})`;
  q.style.clipPath=`inset(0 ${50*(1-f.question)}%)`;q.style.visibility='visible';q.style.setProperty('--line-shift',f.lineShift+'px');
  el.querySelector('.portal-measure').style.opacity=f.measure;
 }
 return {clamp,ease,sample,apply,parsePath,transformPath};
});
