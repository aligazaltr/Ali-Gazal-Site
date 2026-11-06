/* Runs before the stylesheet to apply a saved choice without a theme flash. */
(() => {
  const root = document.documentElement;
  const system = window.matchMedia?.('(prefers-color-scheme: light)');
  let saved;

  try {
    saved = window.localStorage.getItem('ag-theme');
  } catch (_) {
    // Private browsing or restricted storage: the site still follows the system.
  }

  let theme = saved === 'light' || saved === 'dark'
    ? saved
    : system?.matches ? 'light' : 'dark';
  let chosen = saved === 'light' || saved === 'dark';

  function apply(next) {
    theme = next;
    root.dataset.theme = theme;
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.content = theme === 'light' ? '#f5f0e7' : '#0b0b0a';

    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    button.hidden = false;
    button.setAttribute('aria-pressed', String(theme === 'light'));
    button.setAttribute('aria-label', theme === 'light'
      ? 'Açık tema etkin. Koyu temaya geç'
      : 'Koyu tema etkin. Açık temaya geç');
    button.querySelector('[data-theme-label]').textContent = theme === 'light' ? 'Açık tema' : 'Koyu tema';
    button.querySelector('[data-theme-icon]').textContent = theme === 'light' ? '☀' : '☾';
  }

  apply(theme);

  document.addEventListener('DOMContentLoaded', () => {
    apply(theme);
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      chosen = true;
      apply(theme === 'light' ? 'dark' : 'light');
      try {
        window.localStorage.setItem('ag-theme', theme);
      } catch (_) {
        // The choice remains active on this page if storage is unavailable.
      }
    });
  });

  system?.addEventListener?.('change', event => {
    if (!chosen) apply(event.matches ? 'light' : 'dark');
  });

  window.addEventListener('storage', event => {
    if (event.key !== 'ag-theme') return;
    chosen = event.newValue === 'light' || event.newValue === 'dark';
    apply(chosen ? event.newValue : system?.matches ? 'light' : 'dark');
  });
})();
