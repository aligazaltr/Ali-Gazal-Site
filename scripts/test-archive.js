const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../archive-core.js');
const { publicData, validate, renderCard, renderPage, changes } = require('./build-archive.js');
const source = require('../content/archive.json');
const site = require('../site-data.js');
const clone = value => JSON.parse(JSON.stringify(value));

// Entirely synthetic software fixtures. Never attributed to a real author.
function fixture() {
  const data = clone(source);
  data.quotes.forEach(entry => { entry.status = 'draft'; entry.text = ''; });
  data.originalInsights = [];
  data.authors.push({ id: 'test-author', slug: 'test-author', name: 'Test Yazarı', bio: 'Yazılım testi; gerçek yazar değil.' });
  data.books.push({ id: 'test-book', slug: 'test-book', title: 'Test Kitabı', authorId: 'test-author', originalLanguage: 'tr', originalTitle: '', focus: 'Yazılım testi' });
  const entry = { ...clone(data.quotes[0]), id: 'test-one', slug: 'test-one', kind: 'direct-quote', authorId: 'test-author', bookId: 'test-book',
    text: 'IŞIK, İRADE ve çalışma: bu bir yazılım test metnidir; gerçek alıntı değildir.',
    title: 'Yalnızca test', categoryIds: ['irade-disiplin', 'basari-calisma'], tags: ['öğrenme'],
    meaning: 'Bağlam araması için test açıklaması.', commentary: 'Dikkat üzerine test yorumu.',
    application: 'Alışkanlık için test alanı.', critique: 'Sınırlar için test alanı.',
    status: 'published', publishedAt: '2026-10-19', videoRefs: [],
    verification: { status: 'verified', checkedBy: 'Automated test', checkedAt: '2026-10-19', evidence: 'Synthetic test, not editorial verification.' },
    rights: { status: 'approved', basis: 'Synthetic test text' },
    source: { language: 'tr', publisher: 'Test yayınevi', edition: 'Test baskısı', page: '1', locator: '', translator: '', url: '' } };
  data.quotes.push(entry);
  data.quotes.push({ ...clone(entry), id: 'test-two', slug: 'test-two', text: 'İkinci yazılım test metni; gerçek alıntı değildir.', categoryIds: ['felsefe-yasam'], tags: [], meaning: '', commentary: '', application: '', critique: '' });
  return data;
}

test('initial catalog slots remain available and generated content is in sync', () => {
  for (const book of ['prens', 'irade-terbiyesi', 'kendime-dusunceler']) {
    assert.ok(source.books.some(row => row.id === book));
    assert.ok(source.quotes.filter(row => row.bookId === book).length >= 5);
  }
  const published = publicData().entries;
  assert.equal(published.length, [...source.quotes, ...source.originalInsights].filter(row => row.status === 'published').length);
  for (const entry of source.quotes.filter(row => row.status !== 'published')) assert.ok(!published.some(row => row.id === entry.id));
  assert.deepEqual(changes(), []);
});
test('draft and archived text / private verification notes never enter public artifacts', () => {
  const data = fixture(); data.quotes[0].text = 'PRIVATE_DRAFT_MARKER'; data.quotes[0].editorialNote = 'PRIVATE_EDITORIAL_MARKER';
  const published = data.quotes.at(-1); published.verification.evidence = 'PRIVATE_VERIFICATION_MARKER';
  const exported = JSON.stringify(publicData(data));
  assert.doesNotMatch(exported, /PRIVATE_/);
  data.quotes.at(-1).status = 'archived';
  assert.equal(publicData(data).entries.length, 1);
});
test('publishing fails closed for missing text, source, translation credit, verification or rights', () => {
  const mutations = [entry => { entry.text = ''; }, entry => { entry.verification.status = 'pending'; },
    entry => { entry.verification.evidence = ''; }, entry => { entry.verification.checkedAt = '2026-02-31'; },
    entry => { entry.rights.status = 'pending'; }, entry => { entry.source.page = ''; },
    entry => { entry.source.edition = ''; }, entry => { entry.publishedAt = null; },
    entry => { entry.source.url = 'javascript:alert(1)'; }, entry => { entry.source.language = 'en'; }];
  for (const mutate of mutations) { const data = fixture(); mutate(data.quotes.at(-1)); assert.throws(() => publicData(data)); }
});
test('invalid and duplicate identities / book-author relations are rejected', () => {
  const data = fixture(); data.quotes.at(-1).slug = '../bad'; assert.throws(() => validate(data));
  data.quotes.at(-1).slug = 'test-one'; assert.throws(() => validate(data));
  data.quotes.at(-1).slug = 'test-two'; data.quotes.at(-1).authorId = 'machiavelli'; assert.throws(() => validate(data));
});
test('Turkish search covers text, author, book, categories, tags and every commentary field', () => {
  const data = publicData(fixture()); const index = core.indexEntries(data);
  for (const q of ['ışık', 'ISIK', 'İrade', 'irade', 'CALISMA', 'test yazarı', 'TEST KITABI', 'disiplin', 'ogrenme', 'baglam', 'dikkat', 'aliskanlik', 'sinirlar']) {
    assert.ok(core.search(index, { q }).some(entry => entry.id === 'test-one'), q);
  }
  assert.equal(core.search(index, { q: 'bilinmeyenkelime' }).length, 0);
  assert.equal(core.search(index, { q: 'ışık disiplin' }).length, 1);
  assert.equal(core.search(index, { author: 'machiavelli' }).length, 0);
  assert.equal(core.search(index, { book: 'test-book', category: 'felsefe-yasam' }).length, 1);
  assert.equal(core.search(index, { q: 'ışık', category: 'felsefe-yasam' }).length, 0);
});
test('URL filters round-trip and discard invalid IDs without executing query text', () => {
  const data = publicData(fixture()); const filters = { q: 'İRADE & çalışma', author: 'test-author', book: 'test-book', category: 'irade-disiplin' };
  assert.deepEqual(core.readFilters(core.queryFor(filters), data), filters);
  assert.equal(core.readFilters('?yazar=unknown&kitap=unknown&kategori=unknown', data).author, '');
  assert.equal(core.readFilters('?q=' + 'x'.repeat(500), data).q.length, 200);
});
test('random discovery handles zero / one entry and avoids consecutive repetitions', () => {
  const entries = publicData(fixture()).entries;
  assert.equal(core.random([], null), null);
  assert.equal(core.random([entries[0]], entries[0].id).id, entries[0].id);
  for (const value of [0, 0.25, 0.5, 0.999]) assert.notEqual(core.random(entries, entries[0].id, value).id, entries[0].id);
});
test('all content kinds are labelled; translations require source text and credit', () => {
  const data = fixture(); const entry = data.quotes.at(-1);
  entry.kind = 'free-translation'; assert.throws(() => publicData(data));
  entry.source.originalText = 'Synthetic source for translation testing.'; entry.source.translator = 'Test çevireni';
  const exported = publicData(data); assert.match(renderCard(exported.entries.at(-1), exported), /Serbest çeviri/);
  entry.kind = 'paraphrase'; assert.doesNotMatch(renderCard(publicData(data).entries.at(-1), publicData(data)), /<blockquote>/);
  const insight = { ...clone(entry), id: 'test-insight', slug: 'test-insight', kind: 'original-insight', bookId: null, authorId: null, credit: 'Test editörü' };
  data.originalInsights.push(insight);
  assert.equal(publicData(data).entries.at(-1).kind, 'original-insight');
  insight.bookId = 'test-book'; insight.authorId = 'test-author';
  const own = publicData(data).entries.at(-1);
  assert.match(core.shareText(own, publicData(data)), /Test editörü · İlgili kitap: Test Kitabı/);
  assert.match(renderCard(own, publicData(data)), /class="thought-attribution">Test editörü/);
});
test('unreleased video produces no watch link; only verified in-range timestamp is exported', () => {
  const data = fixture(); const entry = data.quotes.at(-1);
  entry.videoRefs = [{ projectId: 'machiavelli', seconds: 42, timestampVerified: true }];
  assert.equal(publicData(data).entries.at(-1).videos.length, 0);
  const released = clone(site); const project = released.projects.machiavelli;
  Object.assign(project.video, { published: true, url: 'https://www.youtube.com/watch?v=TESTFIXTURE', title: 'TEST VIDEO — not real', durationSeconds: 90 });
  project.publishedAt = '2026-10-19';
  assert.equal(new URL(publicData(data, released).entries.at(-1).videos[0].url).searchParams.get('t'), '42');
  entry.videoRefs[0].timestampVerified = false;
  assert.equal(new URL(publicData(data, released).entries.at(-1).videos[0].url).searchParams.get('t'), null);
  entry.videoRefs[0].timestampVerified = true; entry.videoRefs[0].seconds = 90;
  assert.equal(publicData(data, released).entries.at(-1).videos[0].seconds, null);
  project.video.url = 'https://youtube.com.evil.example/watch?v=TESTFIXTURE';
  assert.equal(publicData(data, released).entries.at(-1).videos.length, 0);
});
test('static cards escape unsafe text, contain accessible details and handle long passages', () => {
  const data = fixture(); data.quotes.at(-1).text = '<img src=x onerror=alert(1)>' + 'çokuzunmetin'.repeat(500);
  const exported = publicData(data); const html = renderCard(exported.entries.at(-1), exported);
  assert.doesNotMatch(html, /<img src=x/); assert.match(html, /&lt;img/);
  assert.match(html, /<details><summary>/); assert.match(html, /tabindex="-1"/);
  assert.match(html, /data-entry-action="copy-text" hidden/);
  assert.ok(html.includes('çokuzunmetin'.repeat(500)));
});
test('sharing includes attribution, content kind, source locator and stable canonical anchor', () => {
  const data = publicData(fixture()); const entry = data.entries[0];
  assert.match(core.shareText(entry, data), /Test Yazarı — Test Kitabı/);
  assert.match(core.shareText(entry, data), /Doğrudan alıntı · s. 1/);
  assert.equal(core.entryUrl(entry, data.canonicalOrigin), site.canonicalOrigin + '/dusunce-arsivi#dusunce-test-one');
});
test('no-JS HTML has published text and source; empty archive is noindex, populated archive gains schema', () => {
  const template = fs.readFileSync(path.join(__dirname, '../dusunce-arsivi.html'), 'utf8');
  const empty = clone(source); empty.quotes = []; empty.originalInsights = [];
  assert.match(renderPage(template, publicData(empty)), /name="robots" content="noindex,follow"/);
  const html = renderPage(template, publicData(fixture()));
  assert.match(html, /name="robots" content="index,follow"/);
  assert.match(html, /application\/ld\+json/); assert.match(html, /Test baskısı/);
  assert.match(html, /IŞIK, İRADE ve çalışma/); assert.match(html, /id="archive-empty" hidden/);
});
test('published translations expose their source passage safely and retain their label when copied', () => {
  const data = fixture(); const entry = data.quotes.at(-1);
  entry.kind = 'free-translation'; entry.source.translator = 'Test çevireni';
  entry.source.originalText = '<script>not executable</script>'; entry.source.language = 'en';
  const published = publicData(data); const output = published.entries.at(-1);
  const html = renderCard(output, published);
  assert.equal(output.source.originalText, entry.source.originalText);
  assert.match(html, /Kaynak dilindeki pasaj/); assert.match(html, /lang="en"/);
  assert.match(html, /&lt;script&gt;not executable/); assert.doesNotMatch(html, /<script>/);
  assert.match(core.shareText(output, published), /Serbest çeviri/);
});
test('deployment allowlist excludes editorial source, test scripts and docs', () => {
  const allowlist = fs.readFileSync(path.join(__dirname, '../.assetsignore'), 'utf8').trim().split('\n');
  assert.ok(allowlist.includes('*'));
  assert.ok(allowlist.includes('!/*.js'));
  assert.ok(!allowlist.some(line => /!.*(?:content|scripts|docs|json)/.test(line)));
});
module.exports = { fixture };
