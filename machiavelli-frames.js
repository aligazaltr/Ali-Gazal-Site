/* Registered handoff for the existing storyboard. 51 feature inliers, median
   residual 0.67 px in the approved cover; no runtime image-matching library. */
(function(root) {
  const clamp=v=>Math.max(0,Math.min(1,v));
  const ease=(p,a,b)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
  // Intrinsic 960×1140 portrait pixels → final 1280×720 cover pixels.
  const registration=Object.freeze({a:.5758426516415409,b:-.0022365736899771587,x:708.8248406539958,y:-20.867641037686784,portraitWidth:960,coverWidth:1280});
  const origin=g=>[g.portraitOriginX??g.portraitWidth*.5,g.portraitOriginY??g.portraitHeight*.3];
  function landing(g) {
    const m=registration,k=g.filmWidth/m.coverWidth,r=g.portraitWidth/m.portraitWidth,[ox,oy]=origin(g),a=m.a*k/r,b=m.b*k/r;
    return {portraitScale:Math.hypot(a,b),portraitRotate:Math.atan2(b,a)*180/Math.PI,
      portraitX:g.filmLeft+k*m.x-g.portraitLeft-ox+a*ox-b*oy,
      portraitY:g.filmTop+k*m.y-g.portraitTop-oy+b*ox+a*oy};
  }
  function cover(s,g) {
    const m=registration,r=g.portraitWidth/m.portraitWidth,k=g.filmWidth/m.coverWidth,[ox,oy]=origin(g);
    const angle=s.portraitRotate*Math.PI/180,a=Math.cos(angle)*s.portraitScale,b=Math.sin(angle)*s.portraitScale;
    const px=g.portraitLeft+ox+s.portraitX-a*ox+b*oy,py=g.portraitTop+oy+s.portraitY-b*ox-a*oy;
    // Cover = portrait × inverse(registration): both faces coincide while fading.
    const den=m.a*m.a+m.b*m.b,ca=r*(a*m.a+b*m.b)/den,cb=r*(b*m.a-a*m.b)/den;
    return {...s,filmScale:Math.hypot(ca,cb)/k,filmRotate:Math.atan2(cb,ca)*180/Math.PI,
      filmX:px-ca*m.x+cb*m.y-(g.filmLeft+g.filmWidth/2),filmY:py-cb*m.x-ca*m.y-g.filmTop};
  }
  function frames(g) {
    const target=landing(g);
    return [
      {editionOpacity:1,titleX:0,titleY:0,titleScale:1,titleOpacity:1,portraitX:0,portraitY:0,portraitScale:.88,portraitRotate:0,portraitOpacity:.38,premiseOpacity:1,premiseY:0,filmOpacity:0,outcomeOpacity:0,outcomeY:6},
      {editionOpacity:0,titleX:0,titleY:-6,titleScale:g.mobile?.66:.54,titleOpacity:.8,portraitX:-g.portraitWidth*(g.mobile?.12:.25),portraitY:0,portraitScale:g.mobile?1.05:1.1,portraitRotate:0,portraitOpacity:1,premiseOpacity:.5,premiseY:-3,filmOpacity:0,outcomeOpacity:0,outcomeY:6},
      {editionOpacity:0,titleX:0,titleY:-6,titleScale:g.mobile?.6:.35,titleOpacity:0,...target,portraitOpacity:1,premiseOpacity:0,premiseY:-6,filmOpacity:1,outcomeOpacity:0,outcomeY:6},
      {editionOpacity:0,titleX:0,titleY:-6,titleScale:g.mobile?.6:.35,titleOpacity:0,...target,portraitOpacity:0,premiseOpacity:0,premiseY:-6,filmOpacity:1,outcomeOpacity:1,outcomeY:0}
    ].map(s=>cover(s,g));
  }
  function sample(progress,g) {
    const p=clamp(Number.isFinite(progress)?progress:0),stops=[0,.32,.78,.94],states=frames(g);
    const i=stops.findIndex((s,i)=>i<3&&p>=s&&p<stops[i+1]);let v;
    if(i<0)v={...states[p>=.94?3:0]};
    else {const t=ease(p,stops[i],stops[i+1]);v=Object.fromEntries(Object.keys(states[i]).map(k=>[k,states[i][k]+(states[i+1][k]-states[i][k])*t]));}
    v.filmOpacity=ease(p,.48,.84);if(p>=.32)v.portraitOpacity=1-ease(p,.76,.94);
    return {...cover(v,g),progress:p};
  }
  function apply(stage,values) {
    Object.entries(values).forEach(([key,value])=>{
      const name='--'+key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
      stage.style.setProperty(name,value.toFixed(6)+(/[XY]$/.test(key)?'px':/Rotate$/.test(key)?'deg':''));
    });
  }
  const api=Object.freeze({frames,sample,apply,registration,landing});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AG_MACHIAVELLI_FRAMES=api;
})(typeof window!=='undefined'?window:this);
