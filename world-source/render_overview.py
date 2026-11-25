"""Authoring evidence only. Adds the actual camera route to a new review view."""
import bpy,sys,os,json
from mathutils import Vector
p=sys.argv[sys.argv.index('--')+1];bpy.ops.wm.open_mainfile(filepath=p+('/living-world-refined.blend' if os.path.exists(p+'/living-world-refined.blend') else '/living-world.blend'));s=bpy.context.scene
path=json.load(open(p+'/world-camera.json'))['path'];curve=bpy.data.curves.new('Actual camera route in metres','CURVE');curve.dimensions='3D';curve.bevel_depth=.11;curve.bevel_resolution=3;line=curve.splines.new('POLY');line.points.add(len(path)-1)
for v,item in zip(line.points,path):v.co=(*item['p'],1)
o=bpy.data.objects.new('Camera path evidence',curve);s.collection.objects.link(o);m=bpy.data.materials.new('Route gold');m.diffuse_color=(1,.36,.03,1);m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(1,.36,.03,1);m.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value=(1,.15,.01,1);m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value=2;o.data.materials.append(m)
s.camera.animation_data_clear();s.camera.location=(71,-88,100);s.camera.rotation_euler=(Vector((0,-38,3))-s.camera.location).to_track_quat('-Z','Y').to_euler();s.camera.data.type='ORTHO';s.camera.data.ortho_scale=130
s.render.threads_mode='FIXED';s.render.threads=9;s.cycles.samples=8;s.cycles.use_denoising=False;s.render.resolution_x=1280;s.render.resolution_y=900;s.render.resolution_percentage=100;s.render.filepath=p+'/overview.png';bpy.ops.render.render(write_still=True)
