"""Fixed, continuous exposure grade of denoised native frames, never upscaling.
python3 world-source/grade_quality_film.py CLEAN GRADED START END [FPS]
The display transform is inverted before exposure so highlights compress gently.
"""
from pathlib import Path
import sys,time,numpy as np
from PIL import Image
source,target=map(Path,sys.argv[1:3]);start,end=map(int,sys.argv[3:5]);fps=int(sys.argv[5]) if len(sys.argv)>5 else 24
target.mkdir(parents=True,exist_ok=True)
for i in range(start,end):
 src=source/f'{i:04d}.png';dest=target/src.name
 if dest.exists():continue
 while not src.exists() or time.time()-src.stat().st_mtime<.5:time.sleep(.5)
 y=np.asarray(Image.open(src).convert('RGB'),dtype=np.float32)/255
 y=np.where(y<=.04045,y/12.92,((y+.055)/1.055)**2.4)
 a=2.43*y-2.51;b=.59*y-.03;c=.14*y
 x=(-b-np.sqrt(np.maximum(0,b*b-4*a*c)))/(2*a)
 u=np.clip((i/fps-3.4)/2.5,0,1);u=u*u*(3-2*u)
 x*=.84*(1-u)+(.22/.67)*u
 y=np.clip((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0,1)
 y=np.where(y<=.0031308,12.92*y,1.055*y**(1/2.4)-.055)
 Image.fromarray(np.uint8(np.clip(y*255,0,255))).save(dest)
 print('GRADED',i,flush=True)
