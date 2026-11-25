"""Authoring evidence, without replacing any scene contents.
blender -b --python world-source/export_scene_manifest.py -- WORLD.blend OUTPUT.json
"""
import bpy,sys,json
source,out=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=source);s=bpy.context.scene
important=['Continuous valley terrain','UpperRiver','LowerRiver','Waterfall','Reading table top','Left room wall','Right room wall','Rear library wall','Bridge walkway','Pavilion architrave']
data={'coordinates':'Blender Z-up, metres','objects':len(s.objects),'mesh_objects':sum(o.type=='MESH' for o in s.objects),'materials':sorted(m.name for m in bpy.data.materials),'geometry':[],'lights':[],'camera':{'lens_mm':s.camera.data.lens,'near':s.camera.data.clip_start,'far':s.camera.data.clip_end}}
for name in important:
 o=s.objects.get(name)
 if o:data['geometry'].append({'name':name,'position':list(o.location),'dimensions':list(o.dimensions),'vertices':len(o.data.vertices),'faces':len(o.data.polygons),'materials':[m.name for m in o.data.materials]})
for o in s.objects:
 if o.type=='LIGHT':data['lights'].append({'name':o.name,'type':o.data.type,'position':list(o.location),'rotation':list(o.rotation_euler),'energy':o.data.energy,'color':list(o.data.color)})
with open(out,'w') as f:json.dump(data,f,indent=2)
print('SCENE_EVIDENCE_SAVED',len(s.objects),flush=True)
