"""Bake the same continuous camera into the native Blender timeline.
blender -b --python world-source/bake_camera_route.py -- SOURCE.blend CAMERA.json OUTPUT.blend
The film renderer samples this identical path directly and clears the bake.
"""
import bpy,sys,json
from mathutils import Vector
source,camera,out=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=source);s=bpy.context.scene
path=json.load(open(camera))['path'];s.camera.animation_data_clear()
def sample(t,key):
 i=next((i for i in range(len(path)-1) if t<=path[i+1]['t']),len(path)-2)
 a,b=path[i],path[i+1];dt=b['t']-a['t'];u=(t-a['t'])/dt
 def slope(k):
  if k==0 or k==len(path)-1:return Vector((0,0,0))
  return (Vector(path[k+1][key])-Vector(path[k-1][key]))/(path[k+1]['t']-path[k-1]['t'])
 return (2*u**3-3*u*u+1)*Vector(a[key])+(u**3-2*u*u+u)*dt*slope(i)+(-2*u**3+3*u*u)*Vector(b[key])+(u**3-u*u)*dt*slope(i+1)
for f in range(720):
 seconds=f/24;t=.18*seconds/4.9 if seconds<4.9 else .18+.82*(seconds-4.9)/25.1
 s.camera.location=sample(t,'p');s.camera.rotation_euler=(sample(t,'look')-s.camera.location).to_track_quat('-Z','Y').to_euler()
 s.camera.keyframe_insert(data_path='location',frame=f+1);s.camera.keyframe_insert(data_path='rotation_euler',frame=f+1)
for fc in s.camera.animation_data.action.fcurves:
 for k in fc.keyframe_points:k.interpolation='LINEAR'
s.timeline_markers.clear()
for seconds,label in [(0,'Çalışma odası'),(4.9,'Pencereden dışarı'),(9.3,'Nehre iniş'),(12.7,'Gerçek deneyler'),(16.2,'Fikir'),(19.4,'Deney'),(23.6,'Sonuç'),(29.8,'Arşive yükseliş')]:s.timeline_markers.new(label,frame=1+round(seconds*24))
s.render.fps=24;s.frame_end=720;s.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=out,compress=True)
print('CAMERA_TIMELINE_BAKED',720,flush=True)
