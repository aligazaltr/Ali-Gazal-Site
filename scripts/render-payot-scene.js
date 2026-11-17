/* Editorial construction, not a reproduction of a publisher's cover. */
function renderPayotScene(project){
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return `<section class="payot-scene" data-payot-scene aria-labelledby="payot-title">
 <div class="py-stage">
 <div class="py-shade" aria-hidden="true"></div>
 <div class="py-meta"><span>ALİ GAZAL / DENEY 03</span><span>${esc(project.display.experimentState)}</span></div>
 <div class="py-orbit" aria-hidden="true">${['DİKKAT','ERTELEME','KARAR','AMAÇ','ÇABA','ZAMAN'].map(t=>`<span>${t}</span>`).join('')}</div>
 <p class="py-axis" aria-hidden="true">DÜŞÜNCEDEN EYLEME</p>
 <div class="py-letters" aria-hidden="true">${Array.from('İRADE').map(t=>`<span>${t}</span>`).join('')}</div>
 <div class="py-leaves" aria-hidden="true">${Array.from({length:5},()=>'<i></i>').join('')}</div>
 <div class="py-book" role="img" aria-label="Jules Payot, İrade Terbiyesi. Özgün editoryal kitap kompozisyonu.">
 <div class="py-pages" aria-hidden="true"></div><div class="py-cover">
 <span class="py-author">JULES PAYOT</span><span class="py-static-title" aria-hidden="true">İRADE</span><span class="py-subtitle">TERBİYESİ</span><span class="py-cover-rule" aria-hidden="true"></span><span class="py-imprint">DÜŞÜNCEDEN<br>EYLEME</span><span class="py-book-mark" aria-hidden="true">AG / 03</span>
 </div></div>
 <div class="py-plan"><div class="py-ticks" aria-hidden="true">${Array.from({length:7},(_,i)=>`<i><span>${i+1}</span></i>`).join('')}</div><p>7 GÜN · PLANLANAN UYGULAMA</p></div>
 <div class="py-question"><p class="py-kicker">FİKİRDEN DENEYE</p><h1 id="payot-title">İRADE GERÇEKTEN<br><em>EĞİTİLEBİLİR Mİ?</em></h1><p>Jules Payot'nun fikirlerini gerçek hayatta test ediyorum.</p></div>
 <a class="py-read" href="#payot-arastirma">Araştırma dosyasını oku <span aria-hidden="true">↓</span></a>
 <div class="py-measures" aria-hidden="true"><span class="py-measure-large">${Array.from('İRADE').map(t=>`<b>${t}</b>`).join('')}</span><span class="py-measure-cover">${Array.from('İRADE').map(t=>`<b>${t}</b>`).join('')}</span></div>
 </div></section>`;
}
module.exports={renderPayotScene};
