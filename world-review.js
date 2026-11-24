import {createLivingWorld} from './world-renderer.js';
const canvas=document.querySelector('canvas'),status=document.querySelector('[role=status]');
try{
 const world=await createLivingWorld(canvas);
 status.textContent=`${Math.round(world.stats.triangles).toLocaleString('tr-TR')} üçgen · Ortam hazır`;
 let started=0,playing=false,overview=false;
 document.querySelector('#play').onclick=()=>{started=performance.now();playing=true;overview=false;};
 document.querySelector('#overview').onclick=()=>{playing=false;overview=!overview;};
 document.querySelector('#record').onclick=()=>{
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
  const stream=canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000}),chunks=[];
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recorder.onstop=()=>{const link=document.createElement('a');link.href=URL.createObjectURL(new Blob(chunks,{type:mime}));link.download='Ali_Gazal_3D_Kamera_Yolculugu.webm';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),60000);stream.getTracks().forEach(t=>t.stop());document.body.classList.remove('recording');};
  document.body.classList.add('recording');started=performance.now();playing=true;overview=false;recorder.start();setTimeout(()=>recorder.stop(),30000);
 };
 function loop(now){
  const progress=playing?Math.min(1,(now-started)/30000):0;
  world.draw(progress,now/1000);
  if(overview){world.camera.position.set(70,95,65);world.camera.lookAt(0,0,45);world.renderer.render(world.scene,world.camera);}
  requestAnimationFrame(loop);
 }requestAnimationFrame(loop);
}catch(error){status.textContent='3D ortam açılamadı. '+error.message;}
