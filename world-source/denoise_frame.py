from PIL import Image
import numpy as np,oidn,sys
source=np.asarray(Image.open(sys.argv[1]).convert('RGB'),dtype=np.float32)/255
output=np.empty_like(source)
device=oidn.NewDevice();oidn.CommitDevice(device);f=oidn.NewFilter(device,'RT');h,w=source.shape[:2]
oidn.SetSharedFilterImage(f,'color',source,oidn.FORMAT_FLOAT3,w,h);oidn.SetSharedFilterImage(f,'output',output,oidn.FORMAT_FLOAT3,w,h);oidn.CommitFilter(f);oidn.ExecuteFilter(f)
assert oidn.GetDeviceError(device)==0
Image.fromarray(np.clip(output*255,0,255).astype('uint8')).save(sys.argv[2]);oidn.ReleaseFilter(f);oidn.ReleaseDevice(device)
