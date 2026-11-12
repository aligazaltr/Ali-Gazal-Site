/* The portal and numeral share the exact inner contour and SVG coordinate system. */
const glyph=require('./portal-review/geometry.json');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function renderControlScene(project){
 return `<section class="control-scene" data-control-scene aria-labelledby="control-title">
  <div class="portal-stage">
    <div class="portal-overline"><span>ALİ GAZAL / DENEY 02</span><span class="control-live">${esc(project.statusLabel)}</span></div>
    <svg class="portal-canvas" viewBox="0 0 1280 800" aria-hidden="true" focusable="false" data-glyph-bounds="${glyph.bounds.join(' ')}" data-counter-center="${glyph.center.join(' ')}">
      <defs><mask id="control-aperture" maskUnits="userSpaceOnUse" x="0" y="0" width="1280" height="800"><rect class="portal-mask-field" width="1280" height="800" fill="white"/><path class="portal-counter" d="${glyph.counter}" fill="black" transform="matrix(.85 0 0 .85 101 -10)"/></mask></defs>
      <g class="portal-world">${Array.from({length:9},(_,i)=>`<rect class="portal-gate${i%3===0?' portal-gate-accent':''}"/>`).join('')}<path class="portal-rays"/><path class="portal-horizon"/></g>
      <g class="portal-foreground"><rect class="portal-veil" width="1280" height="800" mask="url(#control-aperture)"/><g class="portal-number" transform="matrix(.85 0 0 .85 101 -10)">${glyph.paths.map(d=>`<path d="${d}"/>`).join('')}</g></g>
      <rect class="portal-final-frame"/><path class="portal-rails"/>
    </svg>
    <p class="portal-measure" aria-hidden="true">60 GÜN / BİR SORU</p>
    <div class="portal-question"><h1 id="control-title"><span>KONTROL</span><span>BENDE <em>Mİ?</em></span></h1><p class="control-subtitle">60 Günlük Davranış Deneyi</p></div>
    <div class="portal-foot"><a href="#deney">Deney dosyasını oku <span aria-hidden="true">↓</span></a><small>Zamanın görsel bir yorumu.<br>Sonuç veya başarı göstergesi değildir.</small></div>
  </div>
</section>`;
}
module.exports={renderControlScene};
