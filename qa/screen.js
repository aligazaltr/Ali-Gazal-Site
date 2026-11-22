const options = new URLSearchParams(location.search);
const frame = document.querySelector('iframe');
const mobile = options.get('size') === 'mobile';
const theme = options.get('theme') === 'dark' ? 'dark' : 'light';
const width = mobile ? 390 : 1440;
const height = mobile ? 844 : 900;
frame.width = width;
frame.height = height;
const pages = {
  home: ['index.html', ''],
  threshold: ['index.html', '.world-alcove'],
  method: ['index.html', '#fikirden-deneye'],
  archive: ['dusunce-arsivi.html', ''],
  discovery: ['dusunce-arsivi.html', '.discovery-stage'],
  results: ['dusunce-arsivi.html', '.archive-results'],
  projects: ['rehberler.html', ''],
  about: ['hakkimda.html', ''],
  payot: ['irade-terbiyesi.html', '.research-opening'],
  machiavelli: ['machiavelli.html', ''],
  control: ['kontrol-bende-mi.html', '']
};
const key = options.get('page');
const [path, selector] = Object.hasOwn(pages, key) ? pages[key] : pages.home;
frame.addEventListener('load', () => {
  const view = frame.contentWindow;
  const doc = frame.contentDocument;
  if (doc.documentElement.dataset.theme !== theme) doc.querySelector('[data-theme-toggle]')?.click();
  function report() {
    document.body.dataset.viewport = `${view.innerWidth}x${view.innerHeight}`;
    document.body.dataset.theme = doc.documentElement.dataset.theme;
    document.body.dataset.overflow = Math.max(0, doc.documentElement.scrollWidth - view.innerWidth);
    document.body.dataset.grid = doc.querySelector('.archive-results') ? view.getComputedStyle(doc.querySelector('.archive-results')).gridTemplateColumns : '';
    document.body.dataset.ready = 'true';
  }
  view.requestAnimationFrame(() => {
    const target = selector && doc.querySelector(selector);
    if (target) view.scrollTo({top: target.getBoundingClientRect().top + view.scrollY - 18,behavior:'instant'});
    view.requestAnimationFrame(report);
  });
});
frame.src = '../' + path;
