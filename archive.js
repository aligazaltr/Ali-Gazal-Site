/* Progressive enhancement: published entries and details already exist in HTML. */
(() => {
  const data = window.AG_ARCHIVE_DATA;
  const core = window.AG_ARCHIVE;
  const form = document.querySelector('[data-archive-filters]');
  if (!data || !core || !form) return;
  const index = core.indexEntries(data);
  const cards = new Map([...document.querySelectorAll('[data-archive-entry]')].map(card => [card.dataset.archiveEntry, card]));
  const fields = { q: form.elements.q, author: form.elements.yazar, book: form.elements.kitap, category: form.elements.kategori };
  const count = document.getElementById('archive-count');
  const empty = document.getElementById('archive-empty');
  const randomButton = document.querySelector('[data-random-thought]');
  const feedback = document.getElementById('archive-feedback');
  const fallback = document.getElementById('archive-copy-fallback');
  const fallbackField = document.getElementById('archive-copy-value');
  let visible = [];
  let previousId = null;
  let pending;

  function filters() { return Object.fromEntries(Object.entries(fields).map(([key, node]) => [key, node.value])); }
  function fill(next) { for (const [key, field] of Object.entries(fields)) field.value = next[key] || ''; }
  function updateUrl() {
    const url = new URL(location.href);
    url.search = core.queryFor(filters());
    if (url.hash && !visible.some(entry => url.hash === `#dusunce-${entry.slug}`)) url.hash = '';
    history.replaceState(null, '', url);
  }
  function render(writeUrl = false) {
    visible = core.search(index, filters());
    const ids = new Set(visible.map(entry => entry.id));
    cards.forEach((card, id) => { card.hidden = !ids.has(id); });
    count.textContent = data.entries.length ? `${visible.length} / ${data.entries.length} düşünce` : 'Henüz yayımlanmış düşünce yok';
    empty.hidden = visible.length > 0;
    if (data.entries.length) {
      empty.querySelector('h2').textContent = 'Bu seçimle eşleşen düşünce yok.';
      empty.querySelector('p').textContent = 'Daha kısa bir kelime deneyebilir veya filtreleri temizleyebilirsin.';
    }
    randomButton.disabled = !visible.length;
    document.querySelector('[data-random-hint]').textContent = visible.length
      ? 'Seçtiğin filtrelerdeki düşünceler arasından.'
      : data.entries.length ? 'Keşfetmek için filtreleri genişlet.' : 'Doğrulanmış ilk düşünce yayımlandığında açılacak.';
    if (writeUrl) updateUrl();
  }
  function reveal(entry, focus = false) {
    const card = cards.get(entry.id);
    if (!card) return;
    if (card.hidden) { fill({}); render(); }
    const details = card.querySelector('details');
    if (details) details.open = true;
    if (focus) {
      card.focus({ preventScroll: true });
      card.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    previousId = entry.id;
  }
  function followHash(focus = false) {
    const entry = data.entries.find(item => location.hash === `#dusunce-${item.slug}`);
    if (entry) reveal(entry, focus);
  }
  function restore() { fill(core.readFilters(location.search, data)); render(); followHash(); }
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(pending); render(true); });
  fields.q.addEventListener('input', () => { clearTimeout(pending); pending = setTimeout(() => render(true), 100); });
  form.addEventListener('change', event => {
    if (event.target === fields.author && fields.book.value) {
      const book = data.books.find(item => item.id === fields.book.value);
      if (fields.author.value && book?.authorId !== fields.author.value) fields.book.value = '';
    }
    clearTimeout(pending); render(true);
  });
  document.querySelectorAll('[data-reset-archive]').forEach(button => button.addEventListener('click', () => {
    clearTimeout(pending); fill({}); render(true); fields.q.focus();
  }));
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-archive-filter-link]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    fill(core.readFilters(new URL(link.href).search, data)); render(true);
    document.getElementById('arsiv').scrollIntoView({ block: 'start', behavior: 'auto' });
    fields.q.focus({ preventScroll: true });
  });
  randomButton.addEventListener('click', () => {
    clearTimeout(pending); render(true);
    const entry = core.random(visible, previousId);
    if (!entry) return;
    const url = new URL(location.href); url.hash = `dusunce-${entry.slug}`;
    history.pushState(null, '', url); reveal(entry, true);
    feedback.textContent = 'Bir düşünce seçildi. Kaynağını ve yorumlarını inceleyebilirsin.';
  });
  window.addEventListener('popstate', restore);
  window.addEventListener('hashchange', () => followHash(true));

  async function copy(text) {
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(text); return; } catch (_) { /* Selection fallback below. */ }
    }
    const focused = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text; field.readOnly = true; field.style.cssText = 'position:fixed;opacity:0;inset:0;width:1px;height:1px';
    document.body.append(field); field.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch (_) { /* Show selectable text. */ }
    field.remove(); focused?.focus({ preventScroll: true });
    if (!success) throw new Error('copy-unavailable');
  }
  document.querySelectorAll('[data-entry-action]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const entry = data.entries.find(item => item.id === button.closest('[data-archive-entry]').dataset.archiveEntry);
      if (!entry) return;
      const url = core.entryUrl(entry, data.canonicalOrigin);
      const text = core.shareText(entry, data);
      const action = button.dataset.entryAction;
      fallback.hidden = true; feedback.textContent = '';
      if (action === 'share' && typeof navigator.share === 'function') {
        try { await navigator.share({ title: entry.title || 'Düşünce Arşivi · Ali Gazal', text, url }); feedback.textContent = 'Paylaşım menüsü açıldı.'; return; }
        catch (error) { if (error?.name === 'AbortError') return; }
      }
      const value = action === 'copy-text' ? `${text}\n${url}` : url;
      try { await copy(value); feedback.textContent = action === 'copy-text' ? 'Düşünce, kaynak bilgisiyle kopyalandı.' : 'Düşüncenin bağlantısı kopyalandı.'; }
      catch (_) {
        fallbackField.value = value; fallback.hidden = false;
        feedback.textContent = 'Otomatik kopyalama kullanılamıyor. Aşağıdaki metni seçip kopyalayabilirsin.';
        fallbackField.focus(); fallbackField.select();
      }
    });
  });
  restore();
  form.hidden = false;
  document.querySelector('[data-archive-discovery]').hidden = false;
})();
