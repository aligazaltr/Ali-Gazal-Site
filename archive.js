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
  let lastFilters = '';
  const discovery = document.createElement('article');
  discovery.className = 'discovery-card';
  discovery.hidden = true;
  discovery.setAttribute('aria-label', 'Keşfedilen düşünce');
  document.querySelector('[data-archive-discovery]').after(discovery);
  function showDiscovery(entry) {
    const author = data.authors.find(item => item.id === entry.authorId);
    const book = data.books.find(item => item.id === entry.bookId);
    const node = (tag, text, className) => {
      const element = document.createElement(tag); element.textContent = text;
      if (className) element.className = className;
      return element;
    };
    discovery.dataset.selectedEntry = entry.id;
    const link = node('a', 'Kaynağı ve yorumları incele →', 'text-link');
    link.href = `#dusunce-${entry.slug}`;
    const actions = node('div', '', 'thought-actions');
    for (const [action, label] of [['copy-text', 'Metni kopyala'], ['copy-link', 'Bağlantıyı kopyala'], ['share', 'Paylaş ↗']]) {
      const button = node('button', label); button.type = 'button'; button.dataset.entryAction = action; actions.append(button);
    }
    discovery.replaceChildren(node('p', 'KEŞFEDİLEN DÜŞÜNCE / ' + core.kinds[entry.kind], 'eyebrow'),
      node('p', entry.text, 'discovery-text'), node('p', `${author?.name || entry.credit || ''} / ${book?.title || ''}`, 'discovery-author'),
      node('p', entry.source.locator || entry.source.page || '', 'discovery-source'), link, actions);
    const url = new URL(location.href); url.hash = `dusunce-${entry.slug}`;
    history.pushState(null, '', url);
    feedback.textContent = `${author?.name || 'Arşiv'}: ${entry.title || 'Yeni bir düşünce'} seçildi.`;
  }

  function filters() { return Object.fromEntries(Object.entries(fields).map(([key, node]) => [key, node.value])); }
  function fill(next) { for (const [key, field] of Object.entries(fields)) field.value = next[key] || ''; }
  function updateUrl() {
    const url = new URL(location.href);
    url.search = core.queryFor(filters());
    if (url.hash && !visible.some(entry => url.hash === `#dusunce-${entry.slug}`)) url.hash = '';
    history.replaceState(null, '', url);
  }
  function render(writeUrl = false) {
    const filterKey = JSON.stringify(filters());
    if (lastFilters !== filterKey) { window.AG_MOTION?.cancel(discovery); discovery.hidden = true; feedback.textContent = ''; lastFilters = filterKey; }
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
    window.AG_MOTION?.refresh();
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
  function restore() { window.AG_MOTION?.cancel(discovery); discovery.hidden = true; fill(core.readFilters(location.search, data)); render(); followHash(); }
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
    previousId = entry.id;
    if (discovery.hidden) {
      discovery.hidden = false; showDiscovery(entry);
      window.AG_MOTION?.animate(discovery, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350 });
    } else if (window.AG_MOTION) window.AG_MOTION.swap(discovery, () => showDiscovery(entry));
    else showDiscovery(entry);
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
  document.querySelectorAll('[data-entry-action]').forEach(button => { button.hidden = false; });
  document.addEventListener('click', async event => {
      const button = event.target.closest('[data-entry-action]');
      if (!button) return;
      const owner = button.closest('[data-archive-entry], [data-selected-entry]');
      const entry = data.entries.find(item => item.id === (owner?.dataset.archiveEntry || owner?.dataset.selectedEntry));
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
  restore();
  form.hidden = false;
  document.querySelector('[data-archive-discovery]').hidden = false;
})();
