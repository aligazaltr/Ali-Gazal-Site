/* Small, deterministic perspective scene. Shared by the browser and Node checks. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.AG_HERO_DIRECTION=api;
})(typeof window==='undefined'?this:window,function(){
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const ramp=(x,a,b)=>ease((x-a)/(b-a));
  const mix=(a,b,p)=>a+(b-a)*p;
  const norm=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
  const sub=(a,b)=>a.map((x,i)=>x-b[i]);
  const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function multiply(a,b){
    const out=Array(16).fill(0);
    for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];
    return out;
  }
  function lookAt(eye,target){
    const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);
    return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];
  }
  function perspective(aspect){
    const f=1/Math.tan(40*Math.PI/360),near=.1,far=80;
    return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];
  }
  function transform(m,v){
    const q=[...v,1];
    return [0,1,2,3].map(r=>q.reduce((s,x,c)=>s+m[c*4+r]*x,0));
  }
  const coverCorners=Object.freeze([[-2.9,-1.63125,.13],[2.9,-1.63125,.13],[2.9,1.63125,.13],[-2.9,1.63125,.13]]);
  function rawCamera(distance,yaw,pitch,aspect){
    const a=yaw*Math.PI/180,b=pitch*Math.PI/180;
    const eye=[Math.sin(a)*Math.cos(b)*distance,Math.sin(b)*distance,Math.cos(a)*Math.cos(b)*distance];
    const vp=multiply(perspective(aspect),lookAt(eye,[0,0,0]));
    return {eye,vp};
  }
  function projectedBounds(vp,offset=[0,0]){
    const points=coverCorners.map(c=>{const v=transform(vp,c);return [v[0]/v[3]+offset[0],v[1]/v[3]+offset[1]];});
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    return {left:Math.min(...xs),right:Math.max(...xs),bottom:Math.min(...ys),top:Math.max(...ys)};
  }
  function layout(width,height){
    width=Math.max(280,Number(width)||390);height=Math.max(480,Number(height)||844);
    const mobile=width<=1000,aspect=width/height;
    const safe=mobile?{left:.06,right:.94,top:.39,bottom:.71}:{left:.46,right:.965,top:.245,bottom:.745};
    const maxWidth=(safe.right-safe.left)*2*.94,maxHeight=(safe.bottom-safe.top)*2*.94;
    let fit=72;
    for(let d=6;d<=72;d+=.125){
      const fits=[-12,0,12,30,58].every(yaw=>{
        const b=projectedBounds(rawCamera(d,yaw,10,aspect).vp);
        return b.right-b.left<maxWidth&&b.top-b.bottom<maxHeight;
      });
      if(fits){fit=d;break;}
    }
    return {width,height,mobile,aspect,safe,fit};
  }
  function sample(seconds,progress,geometry){
    const g=geometry||layout(1440,900),t=Math.max(0,Math.min(6,Number(seconds)||0)),p=clamp(Number(progress)||0);
    const approach=ramp(t,.25,4.6),scroll=ease(p);
    const yaw=mix(g.mobile?36:58,g.mobile?10:15,approach)-scroll*(g.mobile?16:26);
    const pitch=mix(g.mobile?7:10,4,approach)-scroll*2;
    const distance=g.fit*mix(g.mobile?1.19:1.32,1.075,approach)-g.fit*.06*scroll;
    const c=rawCamera(distance,yaw,pitch,g.aspect),bounds=projectedBounds(c.vp);
    const center=[(bounds.left+bounds.right)/2,(bounds.bottom+bounds.top)/2];
    const target=[g.safe.left+g.safe.right-1,1-g.safe.top-g.safe.bottom];
    const offset=[target[0]-center[0],target[1]-center[1]];
    return {t,p,eye:c.eye,vp:c.vp,offset,bounds:projectedBounds(c.vp,offset),yaw,pitch,distance,
      titleReveal:ramp(t,.30,1.85),titleLift:mix(18,0,ramp(t,.30,1.85))-scroll*(g.mobile?15:32),
      titleDepth:-scroll*(g.mobile?80:180),titleOpacity:1-ramp(p,.16,.43),
      reveal:ramp(t,1.1,3.95),key:mix(.08,1,ramp(t,.2,4.2)),
      detailReveal:ramp(t,3.3,5.4),continuation:ramp(p,.43,.68)};
  }
  return Object.freeze({clamp,ease,ramp,mix,multiply,lookAt,perspective,transform,projectedBounds,coverCorners,layout,sample});
});
