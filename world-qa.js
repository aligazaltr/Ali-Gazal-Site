/* QA branch only. Tests the actual media element and layout in same-origin iframes. */
const params = new URLSearchParams(location.search);
const frame = document.querySelector('iframe');
const status = document.querySelector('#status');
const sections = {intro:'.world-hero',river:'.world-river',projects:'#gercek-deneyler',fikir:'#hikaye-fikir',deney:'#hikaye-deney',sonuc:'#hikaye-sonuc',archive:'#yasayan-arsiv'};
frame.width=params.get('size')==='mobile'?390:params.get('size')==='record'?1280:1440;
frame.height=params.get('size')==='mobile'?844:params.get('size')==='record'?720:900;
localStorage.setItem('ag-theme',params.get('theme')||'dark');
const mode=params.get('mode');
if(mode==='nojs') frame.setAttribute('sandbox','allow-same-origin');
frame.src=mode==='reduced'?'./?qa-reduced=1':mode==='deep'?'./#hikaye-sonuc':'./';
const results=[];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const wait=async(test,ms=18000)=>{const start=performance.now();while(!test()){if(performance.now()-start>ms)throw Error('timeout');await sleep(80);}};
function note(name,pass,detail){results.push({name,pass,detail});document.querySelector('#results').textContent=JSON.stringify(results,null,2);}
frame.onload=async()=>{
 const w=frame.contentWindow,d=w.document,v=d.querySelector('#world-film');
 try{
  if(mode==='nojs'||mode==='reduced'){
    await sleep(1200);note(mode+' readable fallback',!d.body.dataset.worldPlayback&&d.querySelector('h1').getBoundingClientRect().height>0);
    note(mode+' project links',['machiavelli.html','kontrol-bende-mi.html','irade-terbiyesi.html'].every(href=>!!d.querySelector('#gercek-deneyler a[href="'+href+'"]')));
    document.body.dataset.completed='';status.textContent='Fallback checks complete';return;
   }
   await wait(()=>d.body.dataset.worldPlayback==='film');
   if(mode==='early'){
    await wait(()=>v.currentTime>.7);const before=v.currentTime;w.scrollTo(0,w.scrollY+180);await sleep(150);const after=v.currentTime;
    note('early gesture preserves current camera',Math.abs(after-before)<.3,{before,after});
    w.scrollTo(0,w.scrollY+900);await sleep(700);note('scroll continues after early gesture',v.currentTime>after,v.currentTime);
    document.body.dataset.completed='';status.textContent='Early-input checks complete';return;
   }
   if(mode==='deep'){
    await sleep(1000);note('deep link avoids intro replay',v.paused&&v.currentTime>23,{time:v.currentTime,paused:v.paused});
    document.body.dataset.completed='';status.textContent='Deep-link checks complete';return;
   }
   if(mode==='error'){
    v.dispatchEvent(new Event('error'));await sleep(200);note('media error restores readable page',!d.body.dataset.worldPlayback&&d.querySelector('h1').getBoundingClientRect().height>0);
    document.body.dataset.completed='';status.textContent='Media-error checks complete';return;
   }
  if(params.has('tape')){
    document.body.classList.add('tape');document.body.dataset.recording='';
    await wait(()=>v.paused&&v.currentTime>=4.88);await sleep(500);
    const max=d.documentElement.scrollHeight-w.innerHeight;
    const animate=(from,to,milliseconds)=>new Promise(resolve=>{const start=performance.now();const tick=now=>{const u=Math.min(1,(now-start)/milliseconds);w.scrollTo({top:from+(to-from)*u,behavior:'instant'});if(u<1)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
    await animate(w.scrollY,max,24000);await sleep(1200);await animate(max,max*.55,5000);await sleep(800);
    document.body.dataset.completed='';status.textContent='Actual browser journey recorded';return;
   }
   const section=params.get('section')||'intro';
  if(section!=='intro'){
   d.querySelector('.world-intro-skip').click();
   w.scrollTo({top:w.scrollY+d.querySelector(sections[section]).getBoundingClientRect().top-w.innerHeight*.13,behavior:'instant'});
  }
  document.body.dataset.ready='';
  document.body.dataset.view=w.innerWidth+'x'+w.innerHeight;
  if(params.has('run')){
   const first=v.currentTime;await sleep(1100);note('intro actions fit first viewport',d.querySelector('.world-hero .world-actions').getBoundingClientRect().bottom<=w.innerHeight,{bottom:d.querySelector('.world-hero .world-actions').getBoundingClientRect().bottom,viewport:w.innerHeight});note('automatic camera advances',v.currentTime>first+.1,{first,after:v.currentTime});
   await wait(()=>v.paused&&v.currentTime>=4.88);
   note('intro hands over at 4.9s',Math.abs(v.currentTime-4.9)<.06,v.currentTime);
   for(const key of ['river','projects','fikir','deney','sonuc','archive','projects']){
    const target=d.querySelector(sections[key]);w.scrollTo({top:w.scrollY+target.getBoundingClientRect().top-w.innerHeight*.13,behavior:'instant'});
    await sleep(850);note(key+' camera seek',v.currentTime>4.9,{time:v.currentTime,overflow:Math.max(0,d.documentElement.scrollWidth-w.innerWidth)});
   }
   const before=v.currentTime;v.dispatchEvent(new Event('canplay'));await sleep(250);note('canplay does not reset camera',Math.abs(v.currentTime-before)<.05,{before,after:v.currentTime});
   const time=v.currentTime;d.querySelector('[data-theme-toggle]').click();await sleep(250);note('theme preserves camera',Math.abs(v.currentTime-time)<.05,d.documentElement.dataset.theme);
   note('film is visible',getComputedStyle(v).display!=='none'&&v.videoWidth>0,{width:v.videoWidth,height:v.videoHeight});
   w.scrollTo({top:0,behavior:'instant'});await sleep(700);note('reverse returns to the original books',v.currentTime<.1,v.currentTime);
   note('all projects remain linked',['machiavelli.html','kontrol-bende-mi.html','irade-terbiyesi.html'].every(href=>!!d.querySelector('#gercek-deneyler a[href="'+href+'"]')));
   document.body.dataset.completed='';status.textContent=results.every(r=>r.pass)?'Tüm tarayıcı kontrolleri geçti':'Başarısız kontrol var';
  }
 }catch(error){note('browser readiness',false,error.message);status.textContent=error.message;document.body.dataset.completed='';}
};

const capture=document.querySelector('#capture');
capture.onclick=async()=>{
 try{
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:24,displaySurface:'browser'},audio:false,preferCurrentTab:true});
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm',videoBitsPerSecond:5000000}),chunks=[];
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='Ali_Gazal_Browser_Recording.webm';a.click();stream.getTracks().forEach(t=>t.stop());capture.textContent='Kayıt tamamlandı'};
  recorder.start();capture.textContent='Kaydı bitir';capture.onclick=()=>recorder.stop();
  frame.contentWindow.location.reload();setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},45000);
 }catch(error){status.textContent='Ekran kaydı açılamadı: '+error.message}
};
