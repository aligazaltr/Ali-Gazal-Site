/* Pure physical camera sampling; no time, DOM state or accumulated scroll. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AG_HOMEPAGE_FRAMES=api;})(typeof window==='undefined'?this:window,function(){
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const ramp=(p,a,b)=>ease((p-a)/(b-a));
  const mix=(a,b,t)=>a+(b-a)*t;
  function sample(progress,geometry={}) {
    const p=clamp(Number(progress)||0), mobile=!!geometry.mobile;
    const w=geometry.width||1440,h=geometry.height||800;
    const open=ramp(p,.08,.64), approach=ramp(p,.40,1), retreat=ramp(p,0,.40);
    const camera=approach*(mobile?580:780);
    return {
      progress:p,camera,
      titleX:-ramp(p,.06,.36)*(mobile?35:145),titleY:-ramp(p,.06,.36)*55,
      titleZ:-ramp(p,.06,.36)*340,titleRotate:ramp(p,.06,.36)*-18,
      titleOpacity:1-ramp(p,.12,.34),
      wingX:mix(mobile?8:18,mobile?w*.50:w*.54,open),
      wingZ:mix(-470,mobile?280:410,open),wingRotate:mix(4,54,open),
      wingOpacity:mix(.09,.72,ramp(p,.05,.26))*(1-ramp(p,.63,.9)),
      decisionZ:-920,decisionY:mix(20,-h*.25,approach),
      decisionOpacity:ramp(p,.18,.37)*(1-ramp(p,.58,.78)),
      mediaX:mix(mobile?0:w*.20,0,ramp(p,.05,.82)),
      mediaY:mix(mobile?h*.06:h*.04,mobile?h*.04:-h*.04,approach),
      mediaZ:mix(-80,mobile?-640:-900,retreat),
      mediaRotateY:mix(mobile?-8:-16,0,approach),
      mediaRotateZ:mix(mobile?2:3,0,approach),
      mediaScale:mix(1,mobile?1.02:1.08,approach),
      destinationOpacity:ramp(p,.74,.94),
      groundRotate:mix(65,78,approach),light:mix(.3,.86,ramp(p,.08,.7))
    };
  }
  return Object.freeze({sample,clamp});
});
