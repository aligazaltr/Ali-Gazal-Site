/* The guide is prepared but stays private until the verified publication handoff. */
(() => {
  const projectConfig = Object.freeze({
    showSevenDayGuide: false
  });

  const guideIsVisible = projectConfig.showSevenDayGuide === true;
  const guide = document.querySelector('[data-seven-day-guide]');

  if (guide) guide.hidden = !guideIsVisible;
  document.querySelectorAll('[data-seven-day-guide-link]').forEach(item => {
    item.hidden = !guideIsVisible;
  });
  document.querySelectorAll('[data-guide-pending]').forEach(item => {
    item.hidden = guideIsVisible;
  });
  document.querySelectorAll('[data-guide-published]').forEach(item => {
    item.hidden = !guideIsVisible;
  });

  const resetTimers = new WeakMap();

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
        status.textContent = 'Otomatik kopyalama başarısız. Metni alandan seçerek kopyalayabilirsin.';
        source.closest('.copy-text')?.focus();
      }
    });
  });

  /* Project sharing stays on the verified live URL, without tracking links. */
  const button = document.querySelector('[data-share-project]');
  if (!button) return;

  const status = document.querySelector('[data-share-status]');
  const fallback = document.querySelector('[data-share-fallback]');
  const link = document.querySelector('[data-share-url]');
  // Previews and URLs with query strings still share the verified live page.
  const url = document.querySelector('link[rel="canonical"]')?.href
    || new URL(window.location.pathname, window.location.href).href;
  link.href = url;
  link.textContent = url;
  button.hidden = false;

  button.addEventListener('click', async () => {
    status.textContent = '';
    fallback.hidden = true;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Machiavelli / Prens deneyi | Ali Gazal',
          text: 'Deneyin güncel durumu ve yöntemi',
          url
        });
        return;
      } catch (error) {
        // Closing the device share sheet is a normal action, not a failure.
        if (error?.name === 'AbortError') return;
      }
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      status.textContent = 'Proje bağlantısı kopyalandı.';
    } catch (_) {
      fallback.hidden = false;
      status.textContent = 'Otomatik kopyalama kullanılamıyor.';
    }
  });
})();
