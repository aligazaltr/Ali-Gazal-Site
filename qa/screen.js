const options = new URLSearchParams(location.search);
const frame = document.querySelector('iframe');
const mobile = options.get('size') === 'mobile';
const reference = options.get('version') === 'before';
const theme = options.get('theme') === 'dark' ? 'dark' : 'light';
const width = mobile ? 390 : 1440;
const height = mobile ? 844 : 900;
frame.width = width;
frame.height = height;
const page = {
  home: ['index.html', ''],
  library: ['index.html', '.home-library'],
  method: ['index.html', '#fikirden-deneye'],
  idea: ['index.html', '#hikaye-fikir h3'],
  experiment: ['index.html', '#hikaye-deney h3'],
  result: ['index.html', '#hikaye-sonuc h3'],
  archive: ['dusunce-arsivi.html', '.archive-intro'],
  discovery: ['dusunce-arsivi.html', '.discovery-stage'],
  cards: ['dusunce-arsivi.html', '.archive-results'],
  machiavelli: ['machiavelli.html', '.machiavelli-opening'],
  control: ['kontrol-bende-mi.html', '.control-intro'],
  payot: ['irade-terbiyesi.html', '.research-opening'],
  projects: ['rehberler.html', '.publication-opening'],
  about: ['hakkimda.html', '.author-opening']
};
const key = options.get('page');
const [path, selector] = Object.hasOwn(page, key) ? page[key] : page.home;
frame.addEventListener('load', () => {
  const view = frame.contentWindow;
  const doc = frame.contentDocument;
  if (doc.documentElement.dataset.theme !== theme) doc.querySelector('[data-theme-toggle]')?.click();
  const target = selector && doc.querySelector(selector);
  const storyTarget = ['idea', 'experiment', 'result'].includes(key);
  if (target) {
    const offset = storyTarget ? (mobile ? 320 : 350) : 22;
    view.scrollTo({top: target.getBoundingClientRect().top + view.scrollY - offset, behavior: 'instant'});
  }
  document.body.dataset.viewport = `${view.innerWidth}x${view.innerHeight}`;
  document.body.dataset.width = width;
  document.body.dataset.height = height;
  document.body.dataset.theme = doc.documentElement.dataset.theme;
  document.body.dataset.overflow = Math.max(0, doc.documentElement.scrollWidth - view.innerWidth);
  document.body.dataset.grid = doc.querySelector('.archive-results') ? view.getComputedStyle(doc.querySelector('.archive-results')).gridTemplateColumns : '';
  document.body.dataset.ready = 'true';
});
frame.src = (reference ? 'reference/' : '../') + path;
