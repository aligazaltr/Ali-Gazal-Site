/* Project sharing stays on the visitor's current site, without tracking links. */
(() => {
  const button = document.querySelector('[data-share-project]');
  if (!button) return;

  const status = document.querySelector('[data-share-status]');
  const fallback = document.querySelector('[data-share-fallback]');
  const link = document.querySelector('[data-share-url]');
  // The file lives beside this page; discard query strings and fragments.
  const url = new URL('machiavelli.html', document.baseURI).href;
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
