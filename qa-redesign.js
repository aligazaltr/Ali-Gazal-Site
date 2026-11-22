const routes = {
  home: ['index.html', '#gercek-deneyler'],
  projects: ['rehberler.html', '#machiavelli-dosyasi'],
  prens: ['machiavelli.html', '#deney-asamasi'],
  control: ['kontrol-bende-mi.html', '#deney'],
  payot: ['irade-terbiyesi.html', '#arastirma-asamalari'],
  archive: ['dusunce-arsivi.html', '#arsiv'],
  about: ['hakkimda.html', '#ben-kimim'],
  archived: ['marcus-aurelius.html', 'main'],
  missing: ['404.html', 'main']
};
const sizes = {320:720,360:800,390:844,430:932,1440:900,1920:1080};
const byId = id => document.getElementById(id);
const form = document.querySelector('form');
const stage = byId('stage');
const status = byId('status');
const output = byId('result');

async function openPage({page, version, width, theme, part, mode}) {
  const [filename, focus] = routes[page];
  const frame = document.createElement('iframe');
  const height = sizes[width];
  const scale = Math.min(1, (innerWidth - 28) / width, (innerHeight - 105) / height);
  frame.title = 'İncelenen sayfa';
  frame.style.width = width + 'px';
  frame.style.height = height + 'px';
  frame.style.transform = 'scale(' + scale + ')';
  stage.style.width = (width * scale) + 'px';
  stage.style.height = (height * scale) + 'px';
  const path = version === 'before' ? '/qa-redesign-before/' + filename : '/' + filename;
  localStorage.setItem('ag-theme',theme);
  if (mode === 'noscript' || mode === 'reduced' || mode === 'media' || page === 'archived') {
    let html = await (await fetch(path)).text();
    html = html.replace(/<meta http-equiv="refresh" content="0; url=rehberler.html">/, '');
    if (mode === 'noscript') frame.setAttribute('sandbox','allow-same-origin');
    if (mode === 'reduced' || mode === 'media') {
      html = html.replace('<head>', '<head><base href="/"><script src="/qa-redesign-mode.js?mode=' + mode + '"><' + '/script>');
    } else if (version !== 'before') html = html.replace('<head>', '<head><base href="/">');
    frame.srcdoc = html;
  } else frame.src = path;
  await new Promise((resolve,reject) => {
    const timer = setTimeout(() => reject(new Error('iframe yükleme süresi doldu')), 9000);
    frame.addEventListener('load', () => {clearTimeout(timer); resolve();},{once:true});
    stage.replaceChildren(frame);
  });
  const win = frame.contentWindow;
  const doc = frame.contentDocument;
  if (part === 'detail') {
    const destination = doc.querySelector(focus);
    const top = destination ? destination.getBoundingClientRect().top - 50 : win.innerHeight * .82;
    win.scrollTo({top,behavior:'instant'});
  } else if (part === 'mid' || part === 'end') {
    win.scrollTo({top:doc.documentElement.scrollHeight * (part === 'end' ? 1 : .48),behavior:'instant'});
  }
  await new Promise(resolve => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve)));
  return {win,doc,width,height};
}

function current() {
  const params = new URLSearchParams(location.search);
  for (const id of ['page','version','size','theme','part']) if (params.get(id)) byId(id).value=params.get(id);
  return {page:byId('page').value,version:byId('version').value,width:Number(byId('size').value),theme:byId('theme').value,part:byId('part').value};
}

function measurements({doc,win,width}, expectTheme) {
  const root = doc.documentElement;
  return {viewport:win.innerWidth, overflow:Math.max(root.scrollWidth,doc.body.scrollWidth)-root.clientWidth, title:doc.querySelector('main h1')?.innerText, theme:root.dataset.theme, ok:win.innerWidth===width && root.scrollWidth-root.clientWidth<=1 && Boolean(doc.querySelector('main h1')) && root.dataset.theme===expectTheme};
}

async function show(opts) {
  status.textContent='Görünüm hazırlanıyor';
  try {
    const view = await openPage(opts);
    const result=measurements(view,opts.theme);
    status.textContent = 'Görünüm hazır · ' + opts.width + ' px · ' + (opts.theme==='dark' ? 'Koyu' : 'Açık');
    return result;
  } catch(e) {status.textContent=e.message; throw e;}
}

form.addEventListener('submit',e=>{e.preventDefault(); show(current());});
byId('matrix').addEventListener('click', async e => {
  e.target.disabled=true;
  const cases=[];
  try {
    for(const theme of ['light','dark']) for(const width of Object.keys(sizes).map(Number)) for(const page of Object.keys(routes)) {
      status.textContent='Denetim · ' + cases.length + ' / 108';
      const view=await openPage({page,version:'after',width,theme,part:'top'});
      cases.push({page,width,theme,...measurements(view,theme)});
    }
    const nojs=await openPage({page:'archive',version:'after',width:390,theme:'light',part:'detail',mode:'noscript'});
    const reduced=await openPage({page:'home',version:'after',width:390,theme:'light',part:'top',mode:'reduced'});
    const modeReduced = !reduced.doc.querySelector('video').hasAttribute('src') && !reduced.doc.querySelector('[data-neighborhood-motion]:not([hidden])');
    const media=await openPage({page:'home',version:'after',width:390,theme:'light',part:'top',mode:'media'});
    let broken=media.doc.querySelector('[data-neighborhood-film]');
    if (broken.hasAttribute('src')) await new Promise(resolve => {broken.addEventListener('error',resolve,{once:true});setTimeout(resolve,1800);});
    const result={cases:cases.length,failures:cases.filter(x=>!x.ok||x.overflow>1),
       noJsThoughts:nojs.doc.querySelectorAll('[data-archive-entry]').length,
       reducedMotionScript:modeReduced,
       mediaFallback:!broken.hasAttribute('src')&&media.doc.querySelector('.neighborhood-poster img').complete};
    output.hidden=false;output.textContent=JSON.stringify(result,null,2);
    status.textContent='Denetim tamamlandı · ' + cases.length + ' görünüm';
  } catch(error){output.hidden=false;output.textContent=error.message; status.textContent='Denetim durdu';}
  e.target.disabled=false;
});
show(current());
