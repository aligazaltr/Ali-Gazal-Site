/* A deterministic timeline. Sixty strokes are a time metaphor, never day results. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AG_CONTROL_FRAMES=api;})(typeof window==='undefined'?globalThis:window,()=>{
  const clamp=p=>Math.max(0,Math.min(1,Number.isFinite(p)?p:0));
  const ease=p=>{p=clamp(p);return p*p*(3-2*p);};
  function sample(progress){const p=clamp(progress);return {progress:p,order:ease(p/.76),timeOpacity:1-.86*ease((p-.12)/.68),questionScale:.93+.07*ease(p/.82),noteOpacity:ease((p-.46)/.48),linesOpacity:1-.66*ease((p-.68)/.32)};}
  function apply(stage,frame){for(const [key,value]of Object.entries(frame))stage.style.setProperty('--'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),String(value));}
  return Object.freeze({sample,apply});
});
