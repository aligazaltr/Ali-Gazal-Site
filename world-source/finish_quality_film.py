"""Watch the graded render and produce bounded-size preview media and evidence.
python3 world-source/finish_quality_film.py GRADED SITE_ROOT
Does not publish, merge, change credentials or touch production.
"""
from pathlib import Path
import sys,time,json,subprocess,hashlib
from PIL import Image,ImageDraw,ImageFont
frames,root=map(Path,sys.argv[1:3]);evidence=root/'docs/living-world-v3';evidence.mkdir(parents=True,exist_ok=True)
while True:
 done=sum((frames/f'{i:04d}.png').exists() for i in range(720))
 print(json.dumps({'stage':'rendering','frames':done,'total':720,'percent':round(done/7.2,1)}),flush=True)
 if done==720:break
 time.sleep(30)
time.sleep(1)
dest=root/'world-film.mp4';log=evidence/'encode.log'
for rate in ['6M','5500k']:
 command=['ffmpeg','-y','-v','warning','-framerate','24','-i',str(frames/'%04d.png'),'-frames:v','720','-c:v','libx264','-preset','slow','-crf','19','-maxrate',rate,'-bufsize',rate,'-g','6','-bf','0','-pix_fmt','yuv420p','-movflags','+faststart',str(dest)]
 print(json.dumps({'stage':'encoding','bitrate_cap':rate}),flush=True)
 with log.open('w') as f:subprocess.run(command,stdout=f,stderr=subprocess.STDOUT,check=True)
 if dest.stat().st_size<25*1024*1024:break
else:raise RuntimeError('Preview encode exceeds the static-host file limit')
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=width,height,r_frame_rate,nb_frames:format=duration,size','-of','json',str(dest)]))
v=probe['streams'][0]
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1920,1080,'24/1',720)
assert abs(float(probe['format']['duration'])-30)<.01
Image.open(frames/'0000.png').save(root/'world-poster.webp',quality=96,method=6)
shots=[('room',0),('window',2.6),('valley',4.9),('river',9.3),('projects',12.7),('waterfall',21.4),('sunset',29.7)]
for name,seconds in shots:
 subprocess.run(['ffmpeg','-y','-v','error','-ss',str(seconds),'-i',str(dest),'-frames:v','1','-q:v','2',str(evidence/(name+'.jpg'))],check=True)
metadata={'source_commit':'7072ef582e1b8cf5db8699f3d406bbc8267a5b61','render_engine':'Blender 4.3.2 / Cycles CPU','native_resolution':[1920,1080],'rendered_frames':720,'native_fps':24,'duration_seconds':30,'cycles_samples':4,'denoiser':'OpenImageDenoise with linear HDR, normal and albedo guides','camera_interpolation':'nonuniform cubic Hermite, continuous velocity','frame_interpolation':False,'ai_upscaling':False,'delivery_probe':probe,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'known_visual_limits':['procedural vegetation and architecture','low sample count and denoising','not accepted as photorealistic final art']}
(evidence/'render-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
(evidence/'render-complete.json').write_text(json.dumps({'complete':True,'file':str(dest),'bytes':dest.stat().st_size}))
print(json.dumps({'stage':'complete','bytes':dest.stat().st_size,'frames':720}),flush=True)
