from pathlib import Path
from PIL import Image
import numpy as np,oidn,time,sys
source=Path(sys.argv[1]);target=Path(sys.argv[2]);target.mkdir(parents=True,exist_ok=True)
device=oidn.NewDevice();oidn.CommitDevice(device)
for i in range(int(sys.argv[3])):
 path=source/f'{i:04d}.png';dest=target/path.name
 if dest.exists():continue
 while True:
  try:
   if not path.exists() or time.time()-path.stat().st_mtime<.8:time.sleep(1);continue
   image=Image.open(path).convert('RGB');image.load();break
  except (OSError,ValueError):time.sleep(1)
 data=np.asarray(image,dtype=np.float32)/255;output=np.empty_like(data);h,w=data.shape[:2]
 f=oidn.NewFilter(device,'RT');oidn.SetSharedFilterImage(f,'color',data,oidn.FORMAT_FLOAT3,w,h);oidn.SetSharedFilterImage(f,'output',output,oidn.FORMAT_FLOAT3,w,h);oidn.CommitFilter(f);oidn.ExecuteFilter(f)
 assert oidn.GetDeviceError(device)==0
 Image.fromarray(np.clip(output*255,0,255).astype('uint8')).save(dest);oidn.ReleaseFilter(f)
 print('DENOISED',i,flush=True)
oidn.ReleaseDevice(device)
