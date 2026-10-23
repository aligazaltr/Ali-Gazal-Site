/* Geometry shared by the four visual prototypes and the scroll controller. */
(function(root) {
  const clamp = value => Math.max(0, Math.min(1, value));
  function frames(g) {
    const scale = Math.min(.85, .418 * g.filmWidth / g.portraitWidth);
    const alignX = g.filmLeft + g.filmWidth * .76 - (g.portraitLeft + g.portraitWidth * (.5 - .03 * scale));
    const alignY = g.filmTop + g.filmWidth / (16 / 9) * .3 - (g.portraitTop + g.portraitHeight * (.3 + .12 * scale));
    return [
      { editionOpacity:1,titleX:0,titleY:0,titleScale:1,titleOpacity:1,portraitX:0,portraitY:0,portraitScale:.88,portraitOpacity:.38,premiseOpacity:1,premiseY:0,filmScale:.94,filmClip:100,outcomeOpacity:0,outcomeY:16 },
      { editionOpacity:0,titleX:0,titleY:-g.height*.075,titleScale:g.mobile?.66:.54,titleOpacity:.78,portraitX:-g.portraitWidth*(g.mobile?.12:.25),portraitY:0,portraitScale:g.mobile?1.05:1.1,portraitOpacity:1,premiseOpacity:.5,premiseY:-10,filmScale:.94,filmClip:100,outcomeOpacity:0,outcomeY:16 },
      { editionOpacity:0,titleX:0,titleY:-g.height*.075,titleScale:g.mobile?.6:.35,titleOpacity:.8,portraitX:alignX,portraitY:alignY,portraitScale:scale,portraitOpacity:.9,premiseOpacity:0,premiseY:-24,filmScale:1,filmClip:38,outcomeOpacity:0,outcomeY:16 },
      { editionOpacity:0,titleX:0,titleY:-g.height*.075,titleScale:g.mobile?.6:.35,titleOpacity:1,portraitX:alignX,portraitY:alignY,portraitScale:scale,portraitOpacity:0,premiseOpacity:0,premiseY:-24,filmScale:1,filmClip:0,outcomeOpacity:1,outcomeY:0 }
    ];
  }
  function sample(progress, geometry) {
    const p = clamp(Number.isFinite(progress) ? progress : 0);
    const stops = [0,.32,.68,.94], states = frames(geometry);
    let index = stops.findIndex((stop, i) => i < 3 && p >= stop && p < stops[i + 1]);
    if (index < 0) return { ...states[p >= .94 ? 3 : 0], progress:p };
    let t = (p - stops[index]) / (stops[index + 1] - stops[index]);
    t = t*t*(3-2*t);
    return Object.fromEntries([...Object.keys(states[index]).map(key => [key, states[index][key] + (states[index+1][key]-states[index][key])*t]), ['progress',p]]);
  }
  function apply(stage, values) {
    Object.entries(values).forEach(([key,value]) => {
      const name = '--' + key.replace(/[A-Z]/g, match => '-' + match.toLowerCase());
      const unit = /[XY]$/.test(key) ? 'px' : key === 'filmClip' ? '%' : '';
      stage.style.setProperty(name, value.toFixed(4) + unit);
    });
  }
  const api = Object.freeze({frames, sample, apply});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AG_MACHIAVELLI_FRAMES = api;
})(typeof window !== 'undefined' ? window : this);
