/* UI-driven audit harness. Source is kept outside the release assets. */
const $=id=>document.getElementById(id), pages=['index.html','machiavelli.html','rehberler.html','dusunce-arsivi.html','hakkimda.html','irade-terbiyesi.html','404.html'];
let frame=$('preview');
const output=value=>$('result').textContent=JSON.stringify(value);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function settle(w){await Promise.race([new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve))),delay(250)]);}
async function load(page=$('page').value,width=Number($('width').value),theme=$('theme').value,options={}) {
  window.__launchOptions={reduced:$('reduced').checked,text200:$('text200').checked,mock:false,...options};
  localStorage.setItem('ag-theme',theme);
  const next=document.createElement('iframe');next.id='preview';next.title='Site önizlemesi';next.style.width=width+'px';next.style.height=$('height').value+'px';
  if(options.nojs??$('nojs').checked)next.setAttribute('sandbox','allow-same-origin');
  const loaded=new Promise((resolve,reject)=>{next.onload=()=>{if(next.contentDocument.URL!=='about:blank')resolve();};setTimeout(()=>reject(new Error('iframe load deadline: '+page)),10000);});
  // Keep the preceding document alive until the next has loaded. Removing it
  // early can abort a shared in-flight image request in Chromium iframe tests.
  const previous=frame;previous.id='previous-preview';previous.style.position='absolute';previous.style.visibility='hidden';
  next.src=($('variant').value==='baseline'&&!page.startsWith('_v5-')?'baseline/':'')+page;previous.after(next);frame=next;await loaded;previous.remove();
  const readyDeadline=Date.now()+5000;
  const renderReady=()=>{const d=next.contentDocument;return d.readyState==='complete'&&d.querySelector('h1')&&[...d.querySelectorAll('link[rel=stylesheet]')].every(l=>l.sheet)&&(next.hasAttribute('sandbox')||d.documentElement.dataset.theme);};
  while(!renderReady()&&Date.now()<readyDeadline)await delay(50);
  if(!renderReady())throw Error('Document/CSS/theme readiness deadline: '+page);
  await Promise.race([Promise.allSettled([...next.contentDocument.images].filter(i=>i.loading!=='lazy').map(i=>i.decode())),delay(5000)]);
  // An iframe load event / decode resolution can precede responsive-image
  // intrinsic metadata in Chromium. Wait for the asserted condition itself.
  const imageDeadline=Date.now()+3000;
  while([...next.contentDocument.images].some(i=>i.loading!=='lazy'&&(!i.complete||!i.naturalWidth))&&Date.now()<imageDeadline)await delay(50);
  await settle(next.contentWindow);
  // In embedded Chromium, pageshow/first layout can follow image decoding.
  // Require the real controller state; never turn a fallback into a passing scene.
  if((page==='machiavelli.html'||page==='_v5-published.html')&&!next.hasAttribute('sandbox')&&!window.__launchOptions.reduced&&Number($('height').value)>=420){
    const deadline=Date.now()+3000;
    while(!next.contentDocument.querySelector('.mc-scene.is-directed')&&Date.now()<deadline)await delay(50);
  }
  return next.contentDocument;
}
function snapshotBase(d=frame.contentDocument){
 const w=d.defaultView,qa=w.__launchQA;
 const controls=[...d.querySelectorAll('button:not([hidden]),input:not([type=hidden]),select,.button,.mc-jump,nav a')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]'));
 return {page:new URL(d.URL).pathname,viewport:w.innerWidth,width:d.documentElement.clientWidth,height:w.innerHeight,documentWidth:d.documentElement.scrollWidth,theme:d.documentElement.dataset.theme,h1:d.querySelectorAll('h1').length,main:!!d.querySelector('main'),overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth+1,smallTargets:controls.filter(e=>{const r=e.getBoundingClientRect();return r.width<24||r.height<24;}).map(e=>({text:e.textContent.trim().slice(0,45),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),canonical:d.querySelector('link[rel=canonical]')?.href,images:[...d.images].filter(i=>i.loading!=='lazy').map(i=>({src:i.currentSrc||i.src,loaded:i.complete&&i.naturalWidth>0})),scene:d.querySelector('[data-machiavelli-scene]')?.classList.contains('is-directed')??null,errors:qa?.errors||[],violations:qa?.violations||[],scriptRan:!!qa,shares:qa?.shares||[],activeAnimations:d.getAnimations().length,imageLifecycle:qa?.imageLifecycle||[]};
}
$('show').onclick=async()=>{try{await load();output(snapshot());}catch(e){output({error:String(e)});}};
$('snapshot').onclick=()=>output(snapshot());
$('matrix').onclick=async()=>{
 const rows=[];$('variant').value='candidate';$('text200').checked=false;$('matrix').disabled=true;
 try{for(const page of pages)for(const theme of ['dark','light'])for(const width of [320,360,390,430,768,1024,1440]){
  try{const d=await load(page,width,theme,{reduced:false,nojs:false});const row=snapshot(d);row.passed=(page==='404.html'?!row.canonical:row.canonical==='https://aligazal.com'+(page==='index.html'?'/':'/'+page.replace('.html','')))&&!row.overflow&&!row.smallTargets.length&&row.h1===1&&row.main&&row.theme===theme&&row.viewport===width&&!row.errors.length&&!row.violations.length;rows.push(row);}catch(e){rows.push({page,width,theme,passed:false,error:String(e)});}
  output({running:true,done:rows.length,total:98,failed:rows.filter(r=>!r.passed),rows});
 }}finally{$('matrix').disabled=false;output({test:'layout',total:rows.length,failed:rows.filter(r=>!r.passed),rows});}
};
$('fallbacks').onclick=async()=>{
 const rows=[];$('fallbacks').disabled=true;
 try{for(const mode of ['nojs','reduced-js'])for(const page of pages)for(const width of [390,1440]){
  try{const d=await load(page,width,'light',{nojs:mode==='nojs',reduced:mode==='reduced-js'});const row={mode,...snapshot(d)};row.passed=!row.overflow&&row.h1===1&&row.main&&(mode==='nojs'?!row.scriptRan:row.activeAnimations===0)&&row.scene!==true;rows.push(row);}catch(e){rows.push({mode,page,width,passed:false,error:String(e)});}
  output({running:true,done:rows.length,total:28,rows});
 }}finally{$('fallbacks').disabled=false;output({test:'fallbacks',total:rows.length,failed:rows.filter(r=>!r.passed),rows});}
};
async function animations(d){await Promise.race([Promise.allSettled(d.getAnimations().map(a=>a.finished)),delay(1400)]);await settle(d.defaultView);}
// Wait for the user-visible selection, not a transient list of animation promises.
async function selectionChanged(d, previous) {
 const deadline=Date.now()+1500;
 while(Date.now()<deadline){if(d.querySelector('[data-selected-entry]')?.dataset.selectedEntry!==previous)return true;await delay(25);}
 return false;
}
$('behavior').onclick=async()=>{
 const rows=[],check=(name,passed,detail)=>rows.push({name,passed:!!passed,...(detail?{detail}:{})});
 try{
 let d=await load('dusunce-arsivi.html',390,'dark',{mock:true,nojs:false,reduced:false}),w=d.defaultView;
 const author=d.querySelector('#archive-author'),book=d.querySelector('#archive-book'),query=d.querySelector('#archive-query'),random=d.querySelector('[data-random-thought]');
 const change=(e,v)=>{e.value=v;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const visible=()=>d.querySelectorAll('[data-archive-entry]:not([hidden])').length;
 change(author,'jules-payot');check('author filter',visible()===5);change(book,'irade-terbiyesi');
 random.scrollIntoView({block:'center',behavior:'instant'});random.focus();random.click();await animations(d);
 const first=d.querySelector('[data-selected-entry]').dataset.selectedEntry;check('filtered random',first.startsWith('irade-terbiyesi'));
 random.click();await selectionChanged(d,first);await animations(d);const second=d.querySelector('[data-selected-entry]').dataset.selectedEntry;check('no immediate repeat',first!==second,{first,second});
 for(let i=0;i<6;i++)random.click();await animations(d);check('last rapid selection stays valid',d.querySelector('[data-selected-entry]').dataset.selectedEntry.startsWith('irade-terbiyesi'));check('focus retained',d.activeElement===random);
 for(const action of ['copy-text','copy-link','share']){d.querySelector(`.discovery-card [data-entry-action="${action}"]`).click();await settle(w);}
 const shares=w.__launchQA.shares;check('copy text carries attribution',shares.some(s=>s.method==='clipboard'&&s.text.includes('Jules Payot')));
 check('preview link stays in preview',shares.some(s=>s.method==='clipboard'&&s.text.startsWith(location.origin+'/dusunce-arsivi#dusunce-')));
 check('native share adapter receives preview URL',shares.some(s=>s.method==='share'&&s.url.startsWith(location.origin+'/dusunce-arsivi#dusunce-')));
 change(query,'zxq-no-result');check('empty disables random',visible()===0&&random.disabled);check('empty hides stale thought',d.querySelector('.discovery-card').hidden);
 change(query,'');change(author,'');change(book,'');change(query,'İRADE');check('Turkish search',visible()===7);change(query,'');
 const details=d.querySelector('.thought-card details');details.open=true;check('source details open',details.querySelector('.thought-details').getBoundingClientRect().height>0);details.open=false;
 check('no black overlay',d.querySelectorAll('.discovery-turn,.discovery-leaf').length===0);check('no unexpected CSP/error',!w.__launchQA.errors.length&&!w.__launchQA.violations.length);
 d=await load('machiavelli.html',390,'dark',{mock:true,nojs:false,reduced:false});w=d.defaultView;const share=d.querySelector('[data-share-project]');share.scrollIntoView({block:'center',behavior:'instant'});share.click();await settle(w);
 check('project preview share origin',w.__launchQA.shares.some(s=>s.url===location.origin+'/machiavelli'));
 const env=d.querySelector('#share-environment');env.value='production';env.dispatchEvent(new w.Event('change',{bubbles:true}));share.click();await settle(w);
 check('explicit production share uses custom domain',w.__launchQA.shares.some(s=>s.url==='https://aligazal.com/machiavelli'));
 check('Machiavelli scroll controller loaded',d.querySelector('.mc-scene').classList.contains('is-directed'));
 output({test:'behavior',total:rows.length,failed:rows.filter(r=>!r.passed),rows,snapshot:snapshot(d)});
 }catch(e){output({test:'behavior',error:String(e),rows});}
};
$('csp').onclick=async()=>{
 try{const d=await load('machiavelli.html',390,'dark',{nojs:false,reduced:false});const w=d.defaultView;const tag=d.createElement('script');tag.textContent='window.__launchInlineCanaryExecuted=true';d.body.append(tag);await delay(150);tag.remove();output({test:'CSP inline canary',executed:w.__launchInlineCanaryExecuted===true,violations:w.__launchQA.violations,passed:w.__launchInlineCanaryExecuted!==true&&w.__launchQA.violations.some(v=>v.disposition==='enforce'&&v.blocked==='inline')});}catch(e){output({error:String(e)});}
};
$('scene').onclick=async()=>{const d=frame.contentDocument,s=d.querySelector('.mc-scene'),stage=d.querySelector('.mc-stage');if(!s)return;const travel=s.getBoundingClientRect().height-stage.getBoundingClientRect().height;d.defaultView.scrollTo({top:s.getBoundingClientRect().top+d.defaultView.scrollY-12+travel*.96,behavior:'instant'});await settle(d.defaultView);output(snapshot(d));};
function snapshot(d=frame.contentDocument) {
 const base=snapshotBase(d),w=d.defaultView;
 const parse=color=>{const n=color.match(/[\d.]+/g)?.map(Number)||[];return n.length>=3?n:null;};
 const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 const styles=[];
 for(const selector of ['.mc-film figcaption','.mc-source-note','.mc-date','.mc-outcome [data-project-field="statusLabel"]','#archive-author','#archive-query']){
  const el=d.querySelector(selector);if(!el)continue;const s=w.getComputedStyle(el),bg=parse(s.backgroundColor),border=parse(s.borderTopColor),fg=parse(s.color);
  const row={selector,fontSize:s.fontSize,lineHeight:s.lineHeight,color:s.color,background:s.backgroundColor,border:s.borderTopColor};
  if(bg&&bg[3]!==0&&border){const alpha=border[3]??1,mixed=border.slice(0,3).map((v,i)=>v*alpha+bg[i]*(1-alpha));row.borderContrast=ratio(mixed,bg);if(fg)row.textContrast=ratio(fg,bg);}
  styles.push(row);
 }
 return {...base,sceneFallback:d.querySelector('[data-qa-fallback]')?.dataset.qaFallback,styles,publishedLinks:[...d.querySelectorAll('[data-published-cover],a[data-project-video-link][target="_blank"]')].map(a=>({href:a.href,target:a.target,rel:a.rel,label:a.getAttribute('aria-label')}))};
}
$('video-matrix').onclick=async()=>{
 const rows=[];$('variant').value='candidate';$('height').value='740';$('text200').checked=false;
 try{for(const page of ['_v5-published.html','_v5-published-home.html'])for(const theme of ['dark','light'])for(const width of [320,360,390,430,768,1024,1440]){
  const d=await load(page,width,theme,{nojs:false,reduced:false});const r=snapshot(d);r.passed=!r.overflow&&!r.errors.length&&!r.violations.length&&r.images.every(i=>i.loaded)&&(page!=='_v5-published.html'||r.scene===true)&&r.publishedLinks.length===1&&r.publishedLinks[0].target==='_blank'&&r.publishedLinks[0].rel.includes('noopener')&&r.publishedLinks[0].href==='https://www.youtube.com/watch?v=TESTFIXTURE';rows.push(r);output({running:true,done:rows.length,total:28,failed:rows.filter(r=>!r.passed)});
 }}catch(e){rows.push({passed:false,error:String(e)});}output({test:'published layouts',total:rows.length,failed:rows.filter(r=>!r.passed),rows});
};
$('video-behavior').onclick=async()=>{
 const rows=[],check=(name,passed,detail)=>rows.push({name,passed:!!passed,detail});
 $('variant').value='candidate';$('height').value='740';$('text200').checked=false;
 try{
 let d=await load('machiavelli.html',390,'dark',{nojs:false,reduced:false});
 check('unpublished scene has no video anchor',!d.querySelector('[data-published-cover]'));
 d=await load('_v5-published.html',390,'dark',{nojs:false,reduced:false});
 let a=d.querySelector('[data-published-cover]'),film=d.querySelector('.mc-film');check('cinematic controller is active before focus',d.querySelector('.mc-scene').classList.contains('is-directed'),{fallback:d.querySelector('.mc-scene').dataset.qaFallback,height:d.defaultView.innerHeight});a.focus();await settle(d.defaultView);
 check('native cover anchor is keyboard focusable',d.activeElement===a);
 check('focus exposes cover before the scroll reveal',d.defaultView.getComputedStyle(film).clipPath==='none'&&d.defaultView.getComputedStyle(film).zIndex==='6',{clip:d.defaultView.getComputedStyle(film).clipPath,zIndex:d.defaultView.getComputedStyle(film).zIndex});
 check('named link announces destination and new tab',a.getAttribute('aria-label').includes('YouTube’da izle')&&a.getAttribute('aria-label').includes('yeni sekmede'));
 a.click();check('activation targets gated URL in a new tab',d.defaultView.__launchQA.videoActivations.some(x=>x.href==='https://www.youtube.com/watch?v=TESTFIXTURE'&&x.target==='_blank'&&x.rel.includes('noopener')));
 check('separate research route remains',!!d.querySelector('a.mc-jump[href="#deney-asamasi"]'));
 d=await load('_v5-published-home.html',390,'dark',{nojs:false,reduced:false});
 check('home cover targets the released video',d.querySelector('a[data-project-video-link]').href==='https://www.youtube.com/watch?v=TESTFIXTURE');
 check('home retains the dossier route',!!d.querySelector('.dossier-link[href="machiavelli.html"]'));
 d=await load('_v5-published.html',390,'light',{nojs:true,reduced:false});
 check('no-JS published cover remains a native link',!!d.querySelector('[data-published-cover][target="_blank"]')&&!d.defaultView.__launchQA);
 check('no-JS research route remains',!!d.querySelector('a.mc-jump[href="#deney-asamasi"]'));
 output({test:'video behavior',total:rows.length,failed:rows.filter(r=>!r.passed),rows});
 }catch(e){output({test:'video behavior',error:String(e),rows});}
};
$('text-matrix').onclick=async()=>{
 const rows=[];$('variant').value='candidate';$('height').value='740';$('text200').checked=true;
 try{for(const page of pages)for(const theme of ['dark','light'])for(const width of [390,768]){
  const d=await load(page,width,theme,{nojs:false,reduced:false});const r=snapshot(d);r.passed=!r.overflow&&!r.errors.length&&!r.violations.length;rows.push(r);output({running:true,done:rows.length,total:28,failed:rows.filter(r=>!r.passed)});
 }}catch(e){rows.push({passed:false,error:String(e)});}finally{$('text200').checked=false;}
 output({test:'text resize 200 percent (not browser zoom)',total:rows.length,failed:rows.filter(r=>!r.passed),rows});
};
// One test owns the iframe at a time, including the initial page load.
// Otherwise late initial-load results can overwrite a running suite and one
// suite can remove another suite's document (invalidating its image loads).
const auditButtons=[...document.querySelectorAll('button')];
let auditBusy=true;
const disableAuditButtons=value=>auditButtons.forEach(b=>b.disabled=value);
for(const button of auditButtons){
 const action=button.onclick;
 button.onclick=async()=>{
  if(auditBusy)return;
  auditBusy=true;disableAuditButtons(true);output({running:true,test:button.id});
  try{await action();}catch(e){output({error:String(e)});}
  finally{auditBusy=false;disableAuditButtons(false);}
 };
}
const captureParams=new URLSearchParams(location.search);
for(const id of ['page','width','height','theme','variant'])if(captureParams.has(id))$(id).value=captureParams.get(id);
if(captureParams.has('capture'))document.body.classList.add('qa-capture');
disableAuditButtons(true);
load().then(()=>output(snapshot())).catch(e=>output({error:String(e)})).finally(()=>{auditBusy=false;disableAuditButtons(false);});
