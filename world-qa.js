/* QA branch only. Tests the actual media element and layout in same-origin iframes. */
const params = new URLSearchParams(location.search);
const frame = document.querySelector('iframe');
const status = document.querySelector('#status');
const sections = {intro:'.world-hero',river:'.world-river',projects:'#gercek-deneyler',fikir:'#hikaye-fikir',deney:'#hikaye-deney',sonuc:'#hikaye-sonuc',archive:'#yasayan-arsiv'};
frame.width=params.get('size')==='mobile'?390:1440;
frame.height=params.get('size')==='mobile'?844:900;
localStorage.setItem('ag-theme',params.get('theme')||'dark');
frame.src='./';
const results=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const wait=async(test,ms=18000)=>{const start=performance.now();while(!test()){if(performance.now()-start>ms)throw Error('timeout');await sleep(80);}};
function note(name,pass,detail){results.push({name,pass,detail});document.querySelector('#results').textContent=JSON.stringify(results,null,2);}
frame.onload=async()=>{
 const w=frame.contentWindow,d=w.document,v=d.querySelector('#world-film');
 try{
  await wait(()=>d.body.dataset.worldPlayback==='film');
  const section=params.get('section')||'intro';
  if(section!=='intro'){
   d.querySelector('.world-intro-skip').click();
   w.scrollTo({top:w.scrollY+d.querySelector(sections[section]).getBoundingClientRect().top-w.innerHeight*.13,behavior:'instant'});
  }
  document.body.dataset.ready='';
  document.body.dataset.view=w.innerWidth+'x'+w.innerHeight;
  if(params.has('run')){
   const first=v.currentTime;await sleep(1100);note('automatic camera advances',v.currentTime>first+.1,{first,after:v.currentTime});
   await wait(()=>v.paused&&v.currentTime>=4.88);
   note('intro hands over at 4.9s',Math.abs(v.currentTime-4.9)<.06,v.currentTime);
   for(const key of ['river','projects','fikir','deney','sonuc','archive','projects']){
    const target=d.querySelector(sections[key]);w.scrollTo({top:w.scrollY+target.getBoundingClientRect().top-w.innerHeight*.13,behavior:'instant'});
    await sleep(850);note(key+' camera seek',v.currentTime>4.9,{time:v.currentTime,overflow:Math.max(0,d.documentElement.scrollWidth-w.innerWidth)});
   }
   const before=v.currentTime;v.dispatchEvent(new Event('canplay'));await sleep(250);note('canplay does not reset camera',Math.abs(v.currentTime-before)<.05,{before,after:v.currentTime});
   const time=v.currentTime;d.querySelector('[data-theme-toggle]').click();await sleep(250);note('theme preserves camera',Math.abs(v.currentTime-time)<.05,d.documentElement.dataset.theme);
   note('film is visible',getComputedStyle(v).display!=='none'&&v.videoWidth>0,{width:v.videoWidth,height:v.videoHeight});
   note('all projects remain linked',['machiavelli.html','kontrol-bende-mi.html','irade-terbiyesi.html'].every(href=>!!d.querySelector('#gercek-deneyler a[href="'+href+'"]')));
   document.body.dataset.completed='';status.textContent=results.every(r=>r.pass)?'Tüm tarayıcı kontrolleri geçti':'Başarısız kontrol var';
  }
 }catch(error){note('browser readiness',false,error.message);status.textContent=error.message;document.body.dataset.completed='';}
};
