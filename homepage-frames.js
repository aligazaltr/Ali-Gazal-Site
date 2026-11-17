/* Pure physical camera sampling; no time, DOM state or accumulated scroll. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AG_HOMEPAGE_FRAMES=api;})(typeof window==='undefined'?this:window,function(){
  const clamp=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  const ramp=(p,a,b)=>ease((p-a)/(b-a));
  const mix=(a,b,t)=>a+(b-a)*t;
  function sample(progress,geometry={}) {
    const p=clamp(Number(progress)||0), mobile=!!geometry.mobile;
    const w=geometry.width||1440,h=geometry.height||800;
    const depart=ramp(p,.02,.30), approach=ramp(p,.18,.86), settle=ramp(p,.56,1);
    const orbit=approach===1?0:Math.sin(approach*Math.PI);
    const camera=approach*(mobile?170:290);
    return {
      progress:p,camera,
      cameraX:-orbit*w*(mobile?.025:.045),cameraYaw:orbit*(mobile?2:4),
      titleX:-depart*(mobile?0:45),titleY:-depart*(mobile?20:12),
      titleZ:-depart*220,titleRotate:-depart*(mobile?3:7),
      titleOpacity:1-ramp(p,.04,.23),
      mediaX:mix(mobile?0:w*.20,mobile?0:w*.18,approach),
      mediaY:mix(mobile?h*.06:h*.04,mobile?-h*.025:0,approach),
      mediaZ:-80,
      mediaRotateY:mix(mobile?-8:-16,0,settle)-orbit*(mobile?5:12),
      mediaRotateZ:mix(mobile?2:3,0,settle),
      mediaScale:mix(1,mobile?.84:.77,approach),
      destinationOpacity:ramp(p,.23,.40),destinationZ:mix(-120,0,settle),
      light:mix(.35,.55,approach)
    };
  }
  return Object.freeze({sample,clamp});
});
