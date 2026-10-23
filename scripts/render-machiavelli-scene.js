/* One semantic composition; progressive motion is owned by machiavelli-scene.js. */
const escape = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function renderMachiavelliScene(project, videoIsValid = false) {
  const cover = project.video.thumbnail;
  return `<section class="mc-scene" data-machiavelli-scene aria-labelledby="mc-title">
  <div class="mc-stage">
    <div class="mc-atmosphere" aria-hidden="true"></div>
    <p class="mc-edition">BİR KİTAPTAN <span>GERÇEK HAYATA</span></p>
    <h1 class="mc-title" id="mc-title"><span>MACHIAVELLI</span><em>PRENS</em></h1>
    <div class="mc-portrait" aria-hidden="true"><img src="machiavelli-portrait-640.webp" srcset="machiavelli-portrait-640.webp 640w, machiavelli-portrait-960.webp 960w" sizes="(max-width: 600px) 80vw, 480px" width="960" height="1140" alt="" fetchpriority="high" decoding="async"></div>
    <p class="mc-premise">Üç düşünce.<br>Yedi gün.<br><em>Gerçek hayat.</em></p>
    <figure class="mc-film" data-project="machiavelli" data-project-cover data-cover-priority="high">
      <!-- project-cover:start --><img class="project-cover" src="${escape(cover.src)}" alt="${escape(cover.alt)}" width="${cover.width}" height="${cover.height}" loading="eager" fetchpriority="high" decoding="async"><!-- project-cover:end -->
      <figcaption data-project-field="display.coverCaption">${escape(project.display.coverCaption)}</figcaption>
    </figure>
    <div class="mc-outcome"><p class="eyebrow">MACHIAVELLI / PRENS</p><p class="mc-statement">ÜÇ DÜŞÜNCE. YEDİ GÜN. <em>GERÇEK HAYAT.</em></p><p data-project-field="statusLabel">${escape(project.statusLabel)}</p><p class="mc-date" data-project-field="dates.label">${escape(project.dates.label)}</p>${project.video.published && videoIsValid ? `<a class="text-link" href="${escape(project.video.url)}" target="_blank" rel="noopener noreferrer">YouTube’da videoyu izle ↗</a>` : ''}</div>
    <a class="mc-jump text-link" href="#deney-asamasi">Araştırma dosyasını incele <span aria-hidden="true">↓</span></a>
    <div class="mc-measure" aria-hidden="true"><span></span></div>
  </div>
</section>`;
}
module.exports = { renderMachiavelliScene };
