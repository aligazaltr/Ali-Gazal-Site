/* The portal and numeral share the exact inner contour and SVG coordinate system. */
const glyph=require('./portal-review/geometry.json');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function renderControlScene(project){
 return `<section class="control-scene" data-control-scene aria-labelledby="control-title">
  <div class="portal-stage">
    <div class="portal-overline"><span>ALİ GAZAL / DENEY 02</span><span class="control-live">${esc(project.statusLabel)}</span></div>
    <svg class="portal-canvas" viewBox="0 0 1280 800" aria-hidden="true" focusable="false" data-glyph-bounds="${glyph.bounds.join(' ')}" data-counter-center="${glyph.center.join(' ')}">
      <defs>
        <path class="portal-counter" d="${glyph.counter}"/>
        <clipPath id="control-aperture" clipPathUnits="userSpaceOnUse"><path class="portal-opening" d="${glyph.counter}"/></clipPath>
        <radialGradient id="control-depth" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1"><stop class="portal-depth-center" offset="0" stop-opacity=".08"/><stop class="portal-depth-middle" offset=".48" stop-opacity=".025"/><stop class="portal-depth-edge" offset="1" stop-opacity="0"/></radialGradient>
        ${[['left','0%','0%','100%','0%'],['right','100%','0%','0%','0%'],['floor','0%','100%','0%','0%']].map(([side,x1,y1,x2,y2])=>`<linearGradient id="control-surface-${side}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop class="portal-material-outer" offset="0" stop-opacity=".58"/><stop class="portal-material-inner" offset=".68" stop-opacity=".80"/><stop class="portal-material-warm" offset="1" stop-opacity=".12"/></linearGradient>`).join('')}
      </defs>
      <g class="portal-world" clip-path="url(#control-aperture)"><rect class="portal-depth-field" width="1280" height="800" fill="url(#control-depth)"/>${['left','right','floor'].map(side=>`<g class="portal-fold" data-side="${side}"><path class="portal-fold-face" fill="url(#control-surface-${side})"/><path class="portal-fold-edge"/></g>`).join('')}</g>
      <g class="portal-foreground"><g class="portal-number" transform="matrix(.85 0 0 .85 101 -10)">${glyph.paths.map(d=>`<path d="${d}"/>`).join('')}</g></g>
      <rect class="portal-final-frame"/>
    </svg>
    <p class="portal-measure" aria-hidden="true">60 GÜN / BİR SORU</p>
    <div class="portal-question"><h1 id="control-title"><span>KONTROL</span><span>BENDE <em>Mİ?</em></span></h1><p class="control-subtitle">60 Günlük Davranış Deneyi</p></div>
    <div class="portal-foot"><a href="#deney">Deney dosyasını oku <span aria-hidden="true">↓</span></a></div>
  </div>
</section>`;
}
module.exports={renderControlScene};
