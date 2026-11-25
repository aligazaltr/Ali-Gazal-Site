"""Render the continuous refined scene; no frame interpolation or upscaling.
blender -b --python world-source/render_quality_film.py -- SOURCE OUTPUT START END [WIDTH HEIGHT SAMPLES FPS ENGINE]
END is exclusive. At 24 fps a 30 second film contains 720 distinct renders.
"""
import bpy, math, sys, os, json, time
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:];source,out=args[:2];start,end=map(int,args[2:4]);width,height,samples,fps=map(int,args[4:8] or [1920,1080,16,24]);engine=args[8] if len(args)>8 else 'CYCLES'
os.makedirs(out,exist_ok=True);bpy.ops.wm.open_mainfile(filepath=source);s=bpy.context.scene
s.render.engine=engine;s.render.resolution_x=width;s.render.resolution_y=height;s.render.resolution_percentage=100;s.render.image_settings.file_format='OPEN_EXR_MULTILAYER' if engine=='CYCLES' else 'PNG';s.render.image_settings.color_mode='RGB'
if engine=='CYCLES':
 s.view_layers[0].use_pass_diffuse_color=True;s.view_layers[0].use_pass_normal=True
 s.render.image_settings.exr_codec='ZIP';s.render.image_settings.color_depth='16'
if engine=='CYCLES':
 s.cycles.samples=samples;s.cycles.use_denoising=False;s.cycles.use_adaptive_sampling=True;s.cycles.adaptive_threshold=.08
 s.cycles.max_bounces=3;s.cycles.diffuse_bounces=1;s.cycles.glossy_bounces=2;s.cycles.transmission_bounces=2;s.cycles.volume_bounces=0
 s.cycles.use_light_tree=True
else:s.eevee.taa_render_samples=samples
s.render.threads_mode='FIXED';s.render.threads=9
s.render.use_persistent_data=True
s.camera.animation_data_clear()
path=json.load(open(os.path.join(os.path.dirname(source),'world-camera.json')))['path']
def sample(t,key):
 t=max(0,min(1,t));i=next((i for i in range(len(path)-1) if t<=path[i+1]['t']),len(path)-2)
 a,b=path[i],path[i+1];dt=b['t']-a['t'];u=(t-a['t'])/dt
 def slope(k):
  if k==0 or k==len(path)-1:return Vector((0,0,0))
  return (Vector(path[k+1][key])-Vector(path[k-1][key]))/(path[k+1]['t']-path[k-1]['t'])
 return (2*u**3-3*u*u+1)*Vector(a[key])+(u**3-2*u*u+u)*dt*slope(i)+(-2*u**3+3*u*u)*Vector(b[key])+(u**3-u*u)*dt*slope(i+1)
waters=[(o,[v.co.copy() for v in o.data.vertices]) for o in s.objects if o.name in ['UpperRiver','LowerRiver']]
leaves=[(o,o.rotation_euler.copy()) for o in s.objects if o.name.startswith('Olive foliage')]
water=bpy.data.materials['River water'];flow=water.node_tree.nodes['Flow coordinates'];noise=water.node_tree.nodes['Flow time']
foam=bpy.data.materials['Aerated waterfall'];fallflow=foam.node_tree.nodes['Falling water coordinates'];falltime=foam.node_tree.nodes['Falling water time']
sun=s.objects['Late afternoon sunlight'];sky=next(n for n in s.world.node_tree.nodes if n.type=='TEX_SKY')
def apply(seconds):
 t=.18*seconds/4.9 if seconds<4.9 else .18+.82*(seconds-4.9)/25.1
 s.camera.location=sample(t,'p');s.camera.rotation_euler=(sample(t,'look')-s.camera.location).to_track_quat('-Z','Y').to_euler()
 flow.inputs['Location'].default_value.y=seconds*.32;noise.inputs['W'].default_value=seconds*.24
 fallflow.inputs['Location'].default_value.z=seconds*1.2;falltime.inputs['W'].default_value=seconds*.3
 for o,positions in waters:
  for v,base in zip(o.data.vertices,positions):v.co.z=base.z+.012*math.sin(base.x*2.3+seconds*1.1)+.009*math.sin(base.y*1.1+seconds*2)
  o.data.update()
 for k,(o,rot) in enumerate(leaves):o.rotation_euler.z=rot.z+.008*math.sin(seconds*.85+k)
 sunset=max(0,min(1,(t-.73)/.27));sunset=sunset*sunset*(3-2*sunset)
 sun.data.color=(1,.88-.25*sunset,.72-.36*sunset);sun.data.energy=2.1-.65*sunset
 sky.sun_elevation=math.radians(23-17*sunset)
for f in range(start,end):
 dest=os.path.join(out,f'{f:04d}.exr' if engine=='CYCLES' else f'{f:04d}.png')
 if os.getenv('WORLD_CLEAN_DIR') and os.path.exists(os.path.join(os.environ['WORLD_CLEAN_DIR'],f'{f:04d}.png')):continue
 if os.path.exists(dest):continue
 apply(f/fps);s.render.filepath=dest;tick=time.monotonic();bpy.ops.render.render(write_still=True);print('QUALITY_FRAME',f,round(time.monotonic()-tick,2),flush=True)
