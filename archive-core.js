/* Pure archive operations shared by the static publisher, browser and tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AG_ARCHIVE = api;
})(typeof window === 'undefined' ? globalThis : window, () => {
  const kinds = Object.freeze({
    'direct-quote': 'Doğrudan alıntı', 'free-translation': 'Serbest çeviri',
    paraphrase: 'Parafraz', 'original-insight': 'Özgün düşünce'
  });
  function normalize(value) {
    return String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function indexEntries(data) {
    const authors = new Map(data.authors.map(item => [item.id, item]));
    const books = new Map(data.books.map(item => [item.id, item]));
    const categories = new Map(data.categories.map(item => [item.id, item]));
    return data.entries.map(entry => ({ entry, search: normalize([
      entry.title, entry.text, entry.credit, authors.get(entry.authorId)?.name, books.get(entry.bookId)?.title,
      entry.meaning, entry.commentary, entry.application, entry.critique,
      ...(entry.tags || []), ...(entry.categoryIds || []).map(id => categories.get(id)?.name)
    ].filter(Boolean).join(' ')) }));
  }
  function search(index, filters = {}) {
    const tokens = normalize(filters.q).split(' ').filter(Boolean);
    return index.filter(({ entry, search: haystack }) =>
      tokens.every(token => haystack.includes(token))
      && (!filters.author || entry.authorId === filters.author)
      && (!filters.book || entry.bookId === filters.book)
      && (!filters.category || entry.categoryIds.includes(filters.category))
    ).map(item => item.entry);
  }
  function random(entries, previousId, randomValue = Math.random()) {
    if (!entries.length) return null;
    const pool = entries.length > 1 ? entries.filter(entry => entry.id !== previousId) : entries;
    return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(randomValue * pool.length)))];
  }
  function readFilters(searchString, data) {
    const query = new URLSearchParams(searchString);
    const valid = (name, rows) => rows.some(row => row.id === query.get(name)) ? query.get(name) : '';
    return { q: (query.get('q') || '').slice(0, 200), author: valid('yazar', data.authors),
      book: valid('kitap', data.books), category: valid('kategori', data.categories) };
  }
  function queryFor(filters) {
    const params = new URLSearchParams();
    for (const [field, name] of [['q', 'q'], ['author', 'yazar'], ['book', 'kitap'], ['category', 'kategori']]) {
      if (filters[field]) params.set(name, filters[field]);
    }
    return params.toString();
  }
  function entryUrl(entry, origin) {
    return `${origin}/dusunce-arsivi#dusunce-${entry.slug}`;
  }
  function shareText(entry, data) {
    const author = entry.kind === 'original-insight' ? entry.credit : data.authors.find(item => item.id === entry.authorId)?.name || entry.credit;
    const book = data.books.find(item => item.id === entry.bookId)?.title;
    const text = entry.kind === 'direct-quote' ? `“${entry.text}”` : entry.text;
    const location = [entry.source?.page ? `s. ${entry.source.page}` : '', entry.source?.locator].filter(Boolean).join(' · ');
    return `${text}\n\n${author}${book ? `${entry.kind === 'original-insight' ? ' · İlgili kitap: ' : ' — '}${book}` : ''}\n${kinds[entry.kind]}${location ? ` · ${location}` : ''}`;
  }
  function safeHttps(value) {
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; }
    catch (_) { return ''; }
  }
  return Object.freeze({ kinds, normalize, indexEntries, search, random, readFilters, queryFor, entryUrl, shareText, safeHttps });
});
