/* UI-driven audit harness. Source is kept outside the release assets. */
const $=id=>document.getElementById(id), pages=['index.html','machiavelli.html','rehberler.html','dusunce-arsivi.html','hakkimda.html','irade-terbiyesi.html'];
let frame=$('preview');
const output=value=>$('result').textContent=JSON.stringify(value);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function settle(w){await Promise.race([new Promise(resolve=>w.requestAnimationFrame(()=>w.requestAnimationFrame(resolve))),delay(250)]);}
async function load(page=$('page').value,width=Number($('width').value),theme=$('theme').value,options={}) {
  window.__launchOptions={reduced:$('reduced').checked,mock:false,...options};
  localStorage.setItem('ag-theme',theme);
  const next=document.createElement('iframe');next.id='preview';next.title='Site önizlemesi';next.style.width=width+'px';next.style.height='740px';
  if(options.nojs??$('nojs').checked)next.setAttribute('sandbox','allow-same-origin');
  const loaded=new Promise((resolve,reject)=>{next.onload=()=>{if(next.contentDocument.URL!=='about:blank')resolve();};setTimeout(()=>reject(new Error('iframe load deadline: '+page)),10000);});
  next.src=page;frame.replaceWith(next);frame=next;await loaded;
  await settle(next.contentWindow);
  return next.contentDocument;
}
function snapshot(d=frame.contentDocument){
 const w=d.defaultView,qa=w.__launchQA;
 const controls=[...d.querySelectorAll('button:not([hidden]),input:not([type=hidden]),select,.button,.mc-jump,nav a')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]'));
 return {page:new URL(d.URL).pathname,viewport:w.innerWidth,width:d.documentElement.clientWidth,height:w.innerHeight,documentWidth:d.documentElement.scrollWidth,theme:d.documentElement.dataset.theme,h1:d.querySelectorAll('h1').length,main:!!d.querySelector('main'),overflow:d.documentElement.scrollWidth>d.documentElement.clientWidth+1,smallTargets:controls.filter(e=>{const r=e.getBoundingClientRect();return r.width<24||r.height<24;}).map(e=>({text:e.textContent.trim().slice(0,45),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),canonical:d.querySelector('link[rel=canonical]')?.href,images:[...d.images].filter(i=>i.loading!=='lazy').map(i=>({src:i.currentSrc||i.src,loaded:i.complete&&i.naturalWidth>0})),scene:d.querySelector('[data-machiavelli-scene]')?.classList.contains('is-directed')??null,errors:qa?.errors||[],violations:qa?.violations||[],scriptRan:!!qa,shares:qa?.shares||[],activeAnimations:d.getAnimations().length};
}
$('show').onclick=async()=>{try{await load();output(snapshot());}catch(e){output({error:String(e)});}};
$('snapshot').onclick=()=>output(snapshot());
$('matrix').onclick=async()=>{
 const rows=[];$('matrix').disabled=true;
 try{for(const page of pages)for(const theme of ['dark','light'])for(const width of [320,360,390,430,768,1024,1440]){
  try{const d=await load(page,width,theme,{reduced:false,nojs:false});const row=snapshot(d);row.passed=!row.overflow&&!row.smallTargets.length&&row.h1===1&&row.main&&row.theme===theme&&row.viewport===width&&!row.errors.length&&!row.violations.length;rows.push(row);}catch(e){rows.push({page,width,theme,passed:false,error:String(e)});}
  output({running:true,done:rows.length,total:84,failed:rows.filter(r=>!r.passed),rows});
 }}finally{$('matrix').disabled=false;output({test:'layout',total:rows.length,failed:rows.filter(r=>!r.passed),rows});}
};
$('fallbacks').onclick=async()=>{
 const rows=[];$('fallbacks').disabled=true;
 try{for(const mode of ['nojs','reduced-js'])for(const page of pages)for(const width of [390,1440]){
  try{const d=await load(page,width,'light',{nojs:mode==='nojs',reduced:mode==='reduced-js'});const row={mode,...snapshot(d)};row.passed=!row.overflow&&row.h1===1&&row.main&&(mode==='nojs'?!row.scriptRan:row.activeAnimations===0)&&row.scene!==true;rows.push(row);}catch(e){rows.push({mode,page,width,passed:false,error:String(e)});}
  output({running:true,done:rows.length,total:24,rows});
 }}finally{$('fallbacks').disabled=false;output({test:'fallbacks',total:rows.length,failed:rows.filter(r=>!r.passed),rows});}
};
async function animations(d){await Promise.race([Promise.allSettled(d.getAnimations().map(a=>a.finished)),delay(1400)]);await settle(d.defaultView);}
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
 random.click();await animations(d);check('no immediate repeat',first!==d.querySelector('[data-selected-entry]').dataset.selectedEntry);
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
load().then(()=>output(snapshot())).catch(e=>output({error:String(e)}));
