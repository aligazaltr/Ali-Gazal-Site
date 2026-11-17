/* Homepage-only scene. Public registry values also produce the no-JS document. */
const { publishedUrl } = require('../video-links.js');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderHomepageScene(data) {
  const released = Object.values(data.projects).filter(p => publishedUrl(p.video)
    && /^\d{4}-\d{2}-\d{2}$/.test(p.publishedAt || ''))
    .sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
  const project = released[0] || data.projects.machiavelli;
  const video = publishedUrl(project.video);
  const thumbnail = project.video.thumbnail;
  const label = video ? `YouTube’da izle: ${project.video.title} (yeni sekmede)` : `${project.shortTitle} deney dosyasını incele`;
  const image = thumbnail?.src && thumbnail.alt
    ? `<img class="project-cover" src="${escape(thumbnail.src)}" alt="${escape(thumbnail.alt)}" width="${thumbnail.width}" height="${thumbnail.height}" loading="eager" fetchpriority="high" decoding="async">` : '';
  return `<section class="hp-scene" data-homepage-scene data-project="${escape(project.id)}" aria-labelledby="hp-question">
      <div class="hp-stage">
        <div class="hp-topline"><span>ALİ GAZAL / THE EXPERIMENT</span><span aria-hidden="true">FİKİRDEN GERÇEK HAYATA</span></div>
        <div class="hp-atmosphere hp-intro-light" aria-hidden="true"></div>
        <div class="hp-opening">
          <p class="hp-kicker">Bir merakın peşinden.</p>
          <h1 id="hp-question"><span>Bir fikir.</span><span>Gerçekten işe</span><em>yarar mı?</em></h1>
          <p class="hp-promise">Fikirleri gerçek hayatta test ediyorum.</p>
        </div>
        <div class="hp-perspective">
          <div class="hp-world">
            <figure class="hp-media">
              <a class="hp-media-link" data-project-cover data-cover-priority="high" data-project-video-link href="${escape(video || project.slug+'.html')}"${video ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${escape(label)}">
                ${image}
              </a>
              <figcaption><span>${video ? 'YAYIMLANMIŞ ÇALIŞMANIN KAPAĞI' : 'PROJE KAPAĞI'}</span><span>${escape(project.shortTitle)}</span></figcaption>
            </figure>
          </div>
        </div>
        <div class="hp-destination"><p class="hp-destination-label">FİKİRDEN GERÇEK HAYATA</p><h2>Bir fikri,<br>gerçek hayatta sınadım.</h2><p class="hp-result">${escape(project.shortTitle)}<br>${escape(project.statusLabel)}</p><a class="hp-research" href="${escape(project.slug)}.html">Deney dosyasını incele <span aria-hidden="true">→</span></a></div>
        <div class="hp-bottom">
          <div class="hp-actions"><a class="button primary" href="rehberler.html">Deneyleri keşfet <span aria-hidden="true">→</span></a><a class="hp-watch" data-project-video-link href="${escape(video || project.slug+'.html')}"${video ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${escape(label)}">${video ? 'Son videoyu izle' : 'Deney dosyasını incele'} <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" focusable="false"><path d="M5 19 19 5M5 5h14v14" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></a></div>
          <p class="hp-scroll-note"><span aria-hidden="true">↓</span> Bir fikrin içinden geç.</p>
          <div class="hp-progress" aria-hidden="true"><span>FİKİR</span><i><b></b></i><span>GERÇEK HAYAT</span></div>
        </div>
      </div>
    </section>`;
}
module.exports = { renderHomepageScene };
