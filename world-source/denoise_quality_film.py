"""Denoise native linear EXR renders using geometry/albedo guides, then tone map.
python3 world-source/denoise_quality_film.py RAW CLEAN START END
Dependencies: OpenEXR, oidn==0.2.1, numpy, Pillow. No frame interpolation.
"""
from pathlib import Path
import sys, time, json, ctypes, os
import OpenEXR, numpy as np, oidn
from PIL import Image
source,target=map(Path,sys.argv[1:3]);start,end=map(int,sys.argv[3:5]);target.mkdir(parents=True,exist_ok=True)
lib=getattr(oidn,'__lib_oidn')
lib.oidnSetDevice1i.argtypes=[ctypes.c_void_p,ctypes.c_char_p,ctypes.c_int]
lib.oidnSetFilter1b.argtypes=[ctypes.c_void_p,ctypes.c_char_p,ctypes.c_bool]
device=oidn.NewDevice();lib.oidnSetDevice1i(device,b'numThreads',2);oidn.CommitDevice(device)
def read_channels(channels,suffix,axes='RGB'):
 return np.ascontiguousarray(np.stack([channels[next(k for k in channels if k.endswith('.'+suffix+'.'+axis))].pixels for axis in axes],axis=-1),dtype=np.float32)
def tonemap(data):
 # ACES fitted display transform, fixed exposure for temporal consistency.
 x=np.maximum(0,data)*float(os.getenv('WORLD_EXPOSURE','.67'))
 mapped=(x*(2.51*x+.03))/(x*(2.43*x+.59)+.14)
 mapped=np.clip(mapped,0,1)
 return np.where(mapped<=.0031308,12.92*mapped,1.055*mapped**(1/2.4)-.055)
for i in range(start,end):
 dest=target/f'{i:04d}.png';path=source/f'{i:04d}.exr'
 if dest.exists():continue
 while not path.exists() or time.time()-path.stat().st_mtime<.8:time.sleep(.5)
 with OpenEXR.File(str(path),separate_channels=True) as f:
  channels=f.channels();color=read_channels(channels,'Combined');albedo=read_channels(channels,'DiffCol');normal=read_channels(channels,'Normal','XYZ')
 normal/=np.maximum(1e-6,np.linalg.norm(normal,axis=-1,keepdims=True));output=np.empty_like(color);h,w=color.shape[:2]
 filt=oidn.NewFilter(device,'RT')
 for name,data in [('color',color),('albedo',albedo),('normal',normal),('output',output)]:oidn.SetSharedFilterImage(filt,name,data,oidn.FORMAT_FLOAT3,w,h)
 lib.oidnSetFilter1b(filt,b'hdr',True);oidn.CommitFilter(filt);oidn.ExecuteFilter(filt)
 assert oidn.GetDeviceError(device)==0
 Image.fromarray(np.uint8(np.clip(tonemap(output)*255,0,255))).save(dest)
 oidn.ReleaseFilter(filt)
 if '--discard-raw' in sys.argv:path.unlink()
 print('QUALITY_DENOISED',i,flush=True)
oidn.ReleaseDevice(device)
