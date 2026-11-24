"""Render the authored continuous camera in Cycles, including temporal water and sunset.
blender -b --python world-source/render_film.py -- SOURCE.blend OUTPUT START END
360 frames at 12fps. The first 4.9 seconds end exactly at camera progress .18.
"""
import bpy,math,sys,os,json
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:];source,out,start,end=args[0],args[1],int(args[2]),int(args[3]);os.makedirs(out,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=source);s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=8;s.cycles.use_denoising=False;s.render.resolution_x=960;s.render.resolution_y=540;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.threads_mode='FIXED';s.render.threads=9
# Remove authored integer keyframes and directly sample the identical continuous path.
path=json.load(open(os.path.join(os.path.dirname(source),'world-camera.json')))['path'];s.camera.animation_data_clear()
def sample(t,key):
 i=next((i for i in range(len(path)-1) if t<=path[i+1]['t']),len(path)-2);u=(t-path[i]['t'])/(path[i+1]['t']-path[i]['t']);u=u*u*(3-2*u);return Vector(path[i][key]).lerp(Vector(path[i+1][key]),u)
waters=[(o,[v.co.copy() for v in o.data.vertices]) for o in s.objects if o.name in ['UpperRiver','LowerRiver','Waterfall']]
leaves=[o for o in s.objects if o.name.startswith('Olive foliage')]
for f in range(start,end):
 if os.path.exists(os.path.join(out,f'{f:04d}.png')):continue
 seconds=f/12;t=.18*seconds/4.9 if seconds<4.9 else .18+.82*(seconds-4.9)/25.1
 s.camera.location=sample(t,'p');s.camera.rotation_euler=(sample(t,'look')-s.camera.location).to_track_quat('-Z','Y').to_euler()
 for o,positions in waters:
  for v,base in zip(o.data.vertices,positions):v.co.z=base.z+.035*math.sin(base.x*3.7+seconds*1.3)+.025*math.sin(base.y*2.1+seconds*2.4)
  o.data.update()
 for k,o in enumerate(leaves):o.rotation_euler.z=.012*math.sin(seconds*.9+k)
 sunset=max(0,(t-.72)/.28);sun=s.objects.get('Late afternoon sunlight');sun.data.color=(1,.87-.25*sunset,.64-.36*sunset);sun.data.energy=2.4-.9*sunset
 sky=next(n for n in s.world.node_tree.nodes if n.type=='TEX_SKY');sky.sun_elevation=math.radians(23-18*sunset)
 s.render.filepath=os.path.join(out,f'{f:04d}.png');bpy.ops.render.render(write_still=True);print('FRAME_DONE',f,flush=True)
