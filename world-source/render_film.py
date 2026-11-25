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
# Refine the real waterfall curtain before animation, removing faceted crest gaps.
fall=bpy.data.objects.get('Waterfall')
for polygon in fall.data.polygons:polygon.use_smooth=True
for vertex in fall.data.vertices:
 t=vertex.index//33/24
 vertex.co.y=-52-.8*math.sin(t*math.pi/2)
 vertex.co.z=3-1.85*t
foam=bpy.data.materials.new('Aerated falling water');foam.use_nodes=True
nodes=foam.node_tree.nodes;principal=nodes.get('Principled BSDF');principal.inputs['Roughness'].default_value=.24;principal.inputs['Transmission Weight'].default_value=.12;principal.inputs['IOR'].default_value=1.333
coordinates=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(5,2,1.3);foam.node_tree.links.new(coordinates.outputs['Generated'],mapping.inputs['Vector'])
wave=nodes.new('ShaderNodeTexNoise');wave.inputs['Scale'].default_value=7;wave.inputs['Detail'].default_value=3;wave.inputs['Roughness'].default_value=.65;foam.node_tree.links.new(mapping.outputs['Vector'],wave.inputs['Vector'])
ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.18;ramp.color_ramp.elements[0].color=(.06,.23,.19,1);ramp.color_ramp.elements[1].position=.72;ramp.color_ramp.elements[1].color=(.64,.78,.67,1)
foam.node_tree.links.new(wave.outputs['Color'],ramp.inputs['Fac']);foam.node_tree.links.new(ramp.outputs['Color'],principal.inputs['Base Color'])
bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12;bump.inputs['Distance'].default_value=.035;foam.node_tree.links.new(wave.outputs['Color'],bump.inputs['Height']);foam.node_tree.links.new(bump.outputs['Normal'],principal.inputs['Normal']);fall.data.materials.clear();fall.data.materials.append(foam)
spray=[]
for i in range(70):
 x=-3.6+(i/69)*10.1;y=-53.2+math.sin(i*2.7)*.28
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=.035+(i%4)*.016,location=(x,y,1.3));drop=bpy.context.object;drop.name='Waterfall airborne foam';drop.data.materials.append(foam);spray.append((drop,x,y))
 for polygon in drop.data.polygons:polygon.use_smooth=True
for edge in [-1,1]:
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3,radius=1,location=(-3.6+edge*5.3,-52.4,2.25));rock=bpy.context.object;rock.name='Waterfall bank joint';rock.scale=(.85,1.05,1.15);rock.data.materials.append(bpy.data.materials.get('Water-worn stone'))
 for polygon in rock.data.polygons:polygon.use_smooth=True
waters=[(o,[v.co.copy() for v in o.data.vertices]) for o in s.objects if o.name in ['UpperRiver','LowerRiver','Waterfall']]
leaves=[o for o in s.objects if o.name.startswith('Olive foliage')]
for f in range(start,end):
 if os.path.exists(os.path.join(out,f'{f:04d}.png')):continue
 seconds=f/12;t=.18*seconds/4.9 if seconds<4.9 else .18+.82*(seconds-4.9)/25.1
 s.camera.location=sample(t,'p');s.camera.rotation_euler=(sample(t,'look')-s.camera.location).to_track_quat('-Z','Y').to_euler()
 mapping.inputs['Location'].default_value.z=seconds*1.1
 for i,(drop,x,y) in enumerate(spray):
  drop.location=(x+.12*math.sin(seconds*2+i),y,1.2+((seconds*.8+i*.037)%1)*.48)
 for o,positions in waters:
  for v,base in zip(o.data.vertices,positions):v.co.z=base.z+.035*math.sin(base.x*3.7+seconds*1.3)+.025*math.sin(base.y*2.1+seconds*2.4)
  o.data.update()
 for k,o in enumerate(leaves):o.rotation_euler.z=.012*math.sin(seconds*.9+k)
 sunset=max(0,(t-.72)/.28);sun=s.objects.get('Late afternoon sunlight');sun.data.color=(1,.87-.25*sunset,.64-.36*sunset);sun.data.energy=2.4-.9*sunset
 sky=next(n for n in s.world.node_tree.nodes if n.type=='TEX_SKY');sky.sun_elevation=math.radians(23-18*sunset)
 s.render.filepath=os.path.join(out,f'{f:04d}.png');bpy.ops.render.render(write_still=True);print('FRAME_DONE',f,flush=True)
