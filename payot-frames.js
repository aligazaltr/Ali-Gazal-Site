/* Pure, reversible editorial geometry. No timers, random drift or scene playback. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AG_PAYOT_FRAMES=api;})(typeof window!=='undefined'?window:this,function(){
 const clamp=x=>Math.max(0,Math.min(1,x)),span=(p,a,b)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*t;
 function sample(progress,g){
  const p=clamp(progress),gather=span(p,.06,.29),form=span(p,.23,.36),bind=span(p,.40,.67),settle=span(p,.69,.91),mobile=g.width<680;
  const w=g.width,h=g.height,bw=g.bookWidth,bh=bw*1.42;
  const bx=mix(w*.5,mobile?w*.5:w*.26,settle),by=mix(h*.49,mobile?h*.29:h*.47,settle);
  const origins=[[.14,.24],[.72,.20],[.43,.38],[.81,.59],[.20,.68],[.58,.78]];
  const letters=g.large.map((x,i)=>({x:mix(w*.5+x,bx+g.small[i],bind),y:mix(h*.46,by-bh*.5+bh*.39,bind),scale:mix(1,g.smallSize/g.largeSize,bind),opacity:form}));
  const words=origins.map(([x,y],i)=>({x:mix(w*x,w*.5+g.large[i%5],gather),y:mix(h*y,h*.46,gather),scale:mix([.74,1,.88,.8,1.05,.72][i],.45,gather),rotate:mix([-6,4,-2,5,-4,3][i],0,gather),opacity:1-form}));
  const leaves=g.large.map((x,i)=>({x:mix(w*.5+x,bx+(i-2)*bw/5,bind),y:mix(h*.46,by,bind),height:mix(g.largeSize*.08,bh,bind),width:mix(g.largeSize*.16,bw/5+1,bind),rotate:mix((i-2)*7,0,bind),opacity:span(p,.39,.48)*(1-span(p,.64,.72))}));
  return {progress:p,gather,bind,words,letters,leaves,book:{x:bx,y:by,width:bw,height:bh,opacity:span(p,.53,.69),rotate:mix(-7,0,bind)},warm:span(p,.35,.76),axis:1-span(p,.36,.56),question:span(p,.79,.95),questionX:mobile?w*.5:w*.70,questionY:mobile?h*.68:h*.46,planX:bx,planY:by+bh*.5+28,ticks:Array.from({length:7},(_,i)=>span(p,.69+i*.012,.77+i*.012))};
 }
 function apply(stage,f){
  const place=(e,x,y,scale=1,rotate=0)=>e.style.transform=`translate(${x.toFixed(3)}px,${y.toFixed(3)}px) translate(-50%,-50%) scale(${scale.toFixed(5)}) rotate(${rotate.toFixed(3)}deg)`;
  stage.querySelectorAll('.py-orbit>span').forEach((e,i)=>{const a=f.words[i];place(e,a.x,a.y,a.scale,a.rotate);e.style.opacity=a.opacity;});
  stage.querySelectorAll('.py-letters>span').forEach((e,i)=>{const a=f.letters[i];place(e,a.x,a.y,a.scale);e.style.opacity=a.opacity;});
  stage.querySelectorAll('.py-leaves>i').forEach((e,i)=>{const a=f.leaves[i];place(e,a.x,a.y,1,a.rotate);e.style.width=a.width+'px';e.style.height=a.height+'px';e.style.opacity=a.opacity;});
  const b=stage.querySelector('.py-book');place(b,f.book.x,f.book.y,1,f.book.rotate);b.style.opacity=f.book.opacity;
  stage.querySelector('.py-shade').style.opacity=1-f.warm;stage.querySelector('.py-axis').style.opacity=f.axis;
  const q=stage.querySelector('.py-question');place(q,f.questionX,f.questionY+(1-f.question)*16);q.style.opacity=f.question;q.style.visibility=f.question?'visible':'hidden';
  const plan=stage.querySelector('.py-plan');place(plan,f.planX,f.planY);plan.style.opacity=f.ticks[0];stage.querySelectorAll('.py-ticks>i').forEach((e,i)=>{e.style.opacity=f.ticks[i];e.style.transform=`scaleY(${.15+.85*f.ticks[i]})`;});
 }
 return {clamp,sample,apply};
});
