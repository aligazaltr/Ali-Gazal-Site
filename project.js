/* Project-page behavior. Every public feature is gated by publication-safe data. */
(() => {
  const siteData = window.AG_SITE_DATA;
  const projectId = document.body.dataset.project;
  const project = projectId && siteData?.projects?.[projectId];
  if (!project) return;

  const resetTimers = new WeakMap();

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function fallbackCopy(text) {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();

    let copied = false;
    try {
      copied = typeof document.execCommand === 'function' && document.execCommand('copy');
    } catch (_) {
      copied = false;
    }

    field.remove();
    return copied;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (_) {
        // Restricted clipboard access can still use the local selection fallback.
      }
    }

    if (!fallbackCopy(text)) throw new Error('Clipboard unavailable');
  }

  function isYouTubeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtu.be'
      ].includes(url.hostname);
    } catch (_) {
      return false;
    }
  }

  function renderPhase() {
    const track = document.querySelector('[data-project-phase]');
    if (!track || !Array.isArray(siteData.phases)) return;

    const currentIndex = siteData.phases.findIndex(phase => phase.id === project.phase);
    if (currentIndex < 0) return;

    track.querySelectorAll('[data-phase]').forEach((item, index) => {
      const state = item.querySelector('[data-phase-state]');
      item.classList.remove('is-complete', 'is-current', 'is-next');
      item.removeAttribute('aria-current');

      if (index < currentIndex) {
        item.classList.add('is-complete');
        if (state) state.textContent = 'Geçildi';
      } else if (index === currentIndex) {
        item.classList.add('is-current');
        item.setAttribute('aria-current', 'step');
        if (state) state.textContent = 'Şu an';
      } else {
        item.classList.add('is-next');
        if (state) state.textContent = 'Sırada';
      }
    });

    const summary = document.querySelector('[data-phase-summary]');
    const current = siteData.phases[currentIndex];
    if (summary) summary.textContent = `Güncel aşama: ${current.label}. Sonraki aşamalar tamamlanmış sayılmıyor.`;
  }

  function setupShare() {
    const button = document.querySelector('[data-share-project]');
    if (!button) return;

    const status = document.querySelector('[data-share-status]');
    const fallback = document.querySelector('[data-share-fallback]');
    const link = document.querySelector('[data-share-url]');
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    const url = canonical || `${siteData.canonicalOrigin}/${project.slug}`;

    if (link) {
      link.href = url;
      link.textContent = url;
    }
    button.hidden = false;

    button.addEventListener('click', async () => {
      if (status) status.textContent = '';
      if (fallback) fallback.hidden = true;

      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: project.sharing.title,
            text: project.sharing.description,
            url
          });
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }

      try {
        await copyText(url);
        if (status) status.textContent = 'Proje bağlantısı kopyalandı.';
      } catch (_) {
        if (fallback) fallback.hidden = false;
        if (status) status.textContent = 'Otomatik kopyalama kullanılamıyor.';
      }
    });
  }

  function setupCopyButtons() {
    document.querySelectorAll('[data-copy-text]').forEach(button => {
      const source = document.querySelector(button.dataset.copyTarget);
      const card = button.closest('.copy-card');
      const status = card?.querySelector('[data-copy-status]');
      if (!source || !status) return;

      const originalLabel = button.textContent;
      button.addEventListener('click', async () => {
        const previousTimer = resetTimers.get(button);
        if (previousTimer) window.clearTimeout(previousTimer);
        status.textContent = '';

        try {
          await copyText(source.textContent);
          button.textContent = 'Kopyalandı';
          status.textContent = 'Metin panoya kopyalandı.';
          const timer = window.setTimeout(() => {
            button.textContent = originalLabel;
            status.textContent = '';
            resetTimers.delete(button);
          }, 2400);
          resetTimers.set(button, timer);
        } catch (_) {
          button.textContent = originalLabel;
          status.textContent = 'Otomatik kopyalama başarısız. Metni seçerek kopyalayabilirsin.';
          source.closest('.copy-text')?.focus();
        }
      });
    });
  }

  function renderVideoPanel() {
    const panel = document.querySelector('[data-video-panel]');
    const video = project.video;
    if (!panel || !video.published || !video.title || !isYouTubeUrl(video.url)) return;

    panel.replaceChildren();
    panel.append(element('p', 'eyebrow', 'VİDEO YAYINDA'));

    if (video.thumbnail.src && video.thumbnail.alt) {
      const image = document.createElement('img');
      image.className = 'video-cover';
      image.src = video.thumbnail.src;
      image.alt = video.thumbnail.alt;
      image.width = Number(video.thumbnail.width) || 1280;
      image.height = Number(video.thumbnail.height) || 720;
      image.loading = 'lazy';
      image.decoding = 'async';
      panel.append(image);
    }

    panel.append(element('h2', '', video.title));
    panel.append(element('p', '', 'Video YouTube’da yayımlandı. Site içi oynatıcı yerine doğrudan kanaldaki videoya gidebilirsin.'));
    const link = element('a', 'button primary', 'YouTube’da videoyu izle ↗');
    link.href = video.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    panel.append(link);
  }

  function renderPublishedResult() {
    if (!project.result.published || !project.result.summary) return;
    const panel = document.querySelector('[data-result-panel]');
    if (!panel) return;

    const title = panel.querySelector('[data-result-title]');
    const summary = panel.querySelector('[data-result-summary]');
    if (title) title.textContent = 'Deneyin doğrulanmış sonucu';
    if (summary) summary.textContent = project.result.summary;

    if (Array.isArray(project.result.limitations) && project.result.limitations.length) {
      const heading = element('h3', 'result-limit-title', 'Yorum sınırları');
      const list = element('ul', 'question-list');
      project.result.limitations.forEach(item => list.append(element('li', '', item)));
      panel.append(heading, list);
    }
  }

  function renderEvidenceLedger() {
    const mount = document.querySelector('[data-evidence-ledger]');
    const entries = project.evidence.entries.filter(entry => entry.public !== false);
    if (!mount || !project.features.evidenceLedger || !project.evidence.published || !entries.length) return;

    const section = element('section', 'feature-panel evidence-ledger');
    section.id = 'kanit-defteri';
    section.setAttribute('aria-labelledby', 'kanit-defteri-baslik');
    section.append(element('p', 'eyebrow', 'KANIT DEFTERİ'));
    const heading = element('h2', '', 'Kayıt neyi gösteriyor, neyi göstermiyor?');
    heading.id = 'kanit-defteri-baslik';
    section.append(heading);

    const list = element('div', 'evidence-list');
    entries.forEach(entry => {
      const card = element('article', 'evidence-card');
      const meta = element('div', 'evidence-meta');
      meta.append(element('span', '', entry.dayLabel || entry.dateLabel || 'Kayıt'));
      meta.append(element('span', 'evidence-type', entry.evidenceType));
      card.append(meta, element('h3', '', entry.title), element('p', '', entry.summary));

      const details = element('dl', 'evidence-details');
      [
        ['İlgili ilke', entry.principle],
        ['Kayıt zamanı', entry.recordedAt],
        ['Desteklediği', entry.supports],
        ['Kanıtlamadığı', entry.doesNotProve]
      ].forEach(([term, description]) => {
        if (!description) return;
        const row = document.createElement('div');
        row.append(element('dt', '', term), element('dd', '', description));
        details.append(row);
      });
      card.append(details);
      list.append(card);
    });

    section.append(list);
    mount.append(section);
  }

  function secondsLabel(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainder = total % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
      : `${minutes}:${String(remainder).padStart(2, '0')}`;
  }

  function timestampUrl(base, seconds) {
    const url = new URL(base);
    url.searchParams.set('t', String(Math.max(0, Math.floor(Number(seconds) || 0))));
    return url.href;
  }

  function renderVideoTimeline() {
    const mount = document.querySelector('[data-video-timeline]');
    const video = project.video;
    if (!mount || !project.features.videoTimeline || !video.published || !isYouTubeUrl(video.url) || !video.chapters.length) return;

    const section = element('section', 'feature-panel video-timeline');
    section.id = 'video-zaman-cizelgesi';
    section.setAttribute('aria-labelledby', 'video-zaman-cizelgesi-baslik');
    section.append(element('p', 'eyebrow', 'VİDEO ZAMAN ÇİZELGESİ'));
    const heading = element('h2', '', 'Doğrudan ilgili bölüme git.');
    heading.id = 'video-zaman-cizelgesi-baslik';
    section.append(heading);

    const list = element('ol', 'timeline-list');
    video.chapters.forEach(chapter => {
      const item = document.createElement('li');
      const link = element('a', 'timeline-link');
      link.href = timestampUrl(video.url, chapter.seconds);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(element('span', 'timeline-time', secondsLabel(chapter.seconds)));
      const copy = element('span', 'timeline-copy');
      copy.append(element('strong', '', chapter.label));
      if (chapter.description) copy.append(element('small', '', chapter.description));
      link.append(copy, element('span', 'timeline-arrow', '↗'));
      item.append(link);
      list.append(item);
    });

    section.append(list);
    mount.append(section);
  }

  function localDateValue(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function trackerExport(state) {
    const lines = [
      project.title,
      `Başlangıç: ${state.startDate}`,
      ''
    ];
    state.days.forEach(day => {
      lines.push(`Gün ${day.day}: ${day.completed ? 'Tamamlandı' : 'Tamamlanmadı'}`);
      lines.push(day.note || 'Not yok.');
      lines.push('');
    });
    return lines.join('\n');
  }

  function renderTryIt() {
    const mount = document.querySelector('[data-try-it]');
    const config = project.tryIt;
    const enabled = project.features.tryIt && config.enabled;
    if (!mount || !enabled || !config.guide || !config.rules.length) return;

    const storageKey = `ag:experiment:${project.slug}:v${config.storageVersion}`;
    let state = null;
    let storageBlocked = false;

    try {
      const saved = window.localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.version === config.storageVersion && parsed?.slug === project.slug && Array.isArray(parsed.days)) {
        state = parsed;
      }
    } catch (_) {
      storageBlocked = true;
    }

    const section = element('section', 'feature-panel try-it-panel');
    section.id = 'kendin-dene';
    section.setAttribute('aria-labelledby', 'kendin-dene-baslik');
    section.append(element('p', 'eyebrow', 'KENDİN DENE'));
    const heading = element('h2', '', `${config.durationDays} günlük kişisel deneyini başlat.`);
    heading.id = 'kendin-dene-baslik';
    section.append(heading);
    section.append(element('p', 'feature-intro', 'Notların yalnızca bu tarayıcıda tutulur; siteye veya üçüncü bir tarafa gönderilmez.'));

    const status = element('p', 'tracker-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    section.append(status);

    const content = element('div', 'tracker-content');
    section.append(content);
    mount.append(section);

    function save(nextState) {
      state = nextState;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
        storageBlocked = false;
        status.textContent = 'Değişiklik yalnızca bu tarayıcıya kaydedildi.';
        return true;
      } catch (_) {
        storageBlocked = true;
        status.textContent = 'Tarayıcı depolamasına erişilemiyor; değişiklik bu ziyaretin dışında korunamayabilir.';
        return false;
      }
    }

    function renderStart() {
      content.replaceChildren();
      const rules = element('ol', 'tracker-rules');
      config.rules.forEach(rule => rules.append(element('li', '', rule)));
      content.append(rules);

      const controls = element('div', 'tracker-start');
      const label = element('label', '', 'Başlangıç tarihi');
      const input = document.createElement('input');
      input.type = 'date';
      input.value = localDateValue();
      label.append(input);
      const start = element('button', 'button primary', 'Deneyi başlat');
      start.type = 'button';
      controls.append(label, start);
      content.append(controls);

      const guideButton = element('button', 'button secondary', 'Rehberi kopyala');
      guideButton.type = 'button';
      guideButton.addEventListener('click', async () => {
        try {
          await copyText(config.guide);
          status.textContent = 'Deney rehberi kopyalandı.';
        } catch (_) {
          status.textContent = 'Rehber otomatik kopyalanamadı.';
        }
      });
      content.append(guideButton);

      if (storageBlocked) status.textContent = 'Tarayıcı depolaması kullanılamıyor; deney ilerlemesi kalıcı olmayabilir.';

      start.addEventListener('click', () => {
        const started = {
          version: config.storageVersion,
          slug: project.slug,
          startDate: input.value || localDateValue(),
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          days: Array.from({ length: config.durationDays }, (_, index) => ({
            day: index + 1,
            completed: false,
            note: '',
            updatedAt: null
          }))
        };
        save(started);
        renderTracker();
      });
    }

    function renderTracker() {
      content.replaceChildren();
      const completed = state.days.filter(day => day.completed).length;
      content.append(element('p', 'tracker-summary', `${completed}/${state.days.length} gün tamamlandı · Başlangıç ${state.startDate}`));

      const days = element('div', 'tracker-days');
      state.days.forEach((day, index) => {
        const card = element('section', 'tracker-day');
        const checkLabel = element('label', 'tracker-check');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = Boolean(day.completed);
        checkLabel.append(checkbox, element('span', '', `Gün ${day.day}`));

        const noteLabel = element('label', 'tracker-note', 'Kısa günlük notu');
        const textarea = document.createElement('textarea');
        textarea.rows = 3;
        textarea.maxLength = 1200;
        textarea.value = day.note || '';
        textarea.placeholder = 'Yalnızca gözlediğin olayı ve yaptığın davranışı yaz.';
        noteLabel.append(textarea);
        card.append(checkLabel, noteLabel);

        function updateDay() {
          const next = {
            ...state,
            updatedAt: new Date().toISOString(),
            days: state.days.map((current, currentIndex) => currentIndex === index ? {
              ...current,
              completed: checkbox.checked,
              note: textarea.value,
              updatedAt: new Date().toISOString()
            } : current)
          };
          save(next);
        }

        checkbox.addEventListener('change', () => {
          updateDay();
          renderTracker();
        });
        textarea.addEventListener('change', updateDay);
        days.append(card);
      });
      content.append(days);

      const actions = element('div', 'tracker-actions');
      const exportButton = element('button', 'button secondary', 'Metin olarak indir');
      exportButton.type = 'button';
      exportButton.addEventListener('click', () => {
        const blob = new Blob([trackerExport(state)], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.slug}-deney-kaydi.txt`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
      });

      const printButton = element('button', 'button secondary', 'Yazdır');
      printButton.type = 'button';
      printButton.addEventListener('click', () => window.print());

      const resetButton = element('button', 'button danger-button', 'Deneyi sıfırla');
      resetButton.type = 'button';
      resetButton.addEventListener('click', () => {
        if (!window.confirm('Bu tarayıcıdaki deney notlarını silmek istediğine emin misin?')) return;
        try {
          window.localStorage.removeItem(storageKey);
        } catch (_) {
          // The in-memory state can still be reset for this visit.
        }
        state = null;
        status.textContent = 'Deney kaydı sıfırlandı.';
        renderStart();
      });

      actions.append(exportButton, printButton, resetButton);
      content.append(actions);
    }

    if (state) renderTracker();
    else renderStart();
  }

  renderPhase();
  setupShare();
  setupCopyButtons();
  renderVideoPanel();
  renderPublishedResult();
  renderEvidenceLedger();
  renderVideoTimeline();
  renderTryIt();
})();
