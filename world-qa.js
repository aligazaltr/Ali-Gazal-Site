const query=new URLSearchParams(location.search);
const frame=document.querySelector('iframe');
frame.width=query.get('size')==='mobile'?390:1280;
frame.height=query.get('size')==='mobile'?844:800;
localStorage.setItem('ag-theme',query.get('theme')||'dark');
frame.src='./';
const sections={intro:'.world-hero',river:'.world-river',projects:'#gercek-deneyler',fikir:'#hikaye-fikir',deney:'#hikaye-deney',sonuc:'#hikaye-sonuc',archive:'#yasayan-arsiv'};
frame.onload=()=>{
 const w=frame.contentWindow,doc=w.document;
 const timer=setInterval(()=>{
  if(!doc.body.dataset.worldPlayback)return;
  clearInterval(timer);
  const section=query.get('section')||'intro';
  if(section!=='intro'){
   doc.querySelector('.world-intro-skip').click();
   const element=doc.querySelector(sections[section]);
   w.scrollTo({top:w.scrollY+element.getBoundingClientRect().top-w.innerHeight*.13,behavior:'instant'});
  }
  setTimeout(()=>{document.body.dataset.ready='';document.body.dataset.view=w.innerWidth+'x'+w.innerHeight;document.body.dataset.overflow=String(Math.max(0,doc.documentElement.scrollWidth-w.innerWidth));},1800);
 },100);
};
const capture=document.querySelector('#capture'),status=document.querySelector('#status');
capture.onclick=async()=>{
 try{
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:24,displaySurface:'browser'},audio:false,preferCurrentTab:true});
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm',videoBitsPerSecond:5000000});const chunks=[];
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onstop=()=>{const link=document.createElement('a');link.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));link.download='Ali_Gazal_Gercek_Tarayici_Kaydi.webm';link.click();stream.getTracks().forEach(t=>t.stop());status.textContent='Kayıt tamamlandı';};
  recorder.start();status.textContent='Kayıt sürüyor';capture.textContent='Kaydı bitir';capture.onclick=()=>recorder.stop();
  frame.contentWindow.location.reload();setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},45000);
 }catch(error){status.textContent='Ekran kaydı açılamadı. '+error.message;}
};
