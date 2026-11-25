"""Non-destructive quality pass over the Phase 1 authored world.
blender -b --python world-source/refine_world.py -- BASE.blend OUTPUT
Original geometry, river coordinates and camera stops are retained.
All added surfaces are procedural or original, with no stock environment.
"""
import bpy, math, random, sys, os, json
from mathutils import Vector
random.seed(2718)
source,out=sys.argv[sys.argv.index('--')+1:]
os.makedirs(out,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=source)
s=bpy.context.scene
s.camera.animation_data_clear()
s.render.engine='CYCLES';s.cycles.samples=24;s.cycles.use_denoising=False
s.cycles.use_adaptive_sampling=True;s.cycles.adaptive_threshold=.08
s.cycles.max_bounces=6;s.cycles.diffuse_bounces=3;s.cycles.glossy_bounces=3
s.cycles.transmission_bounces=4;s.cycles.transparent_max_bounces=4
s.render.threads_mode='FIXED';s.render.threads=9
s.render.resolution_x=1920;s.render.resolution_y=1080;s.render.resolution_percentage=100
s.render.fps=24;s.view_settings.exposure=-.75
s.view_settings.look='AgX - Medium High Contrast'

def surface(name,low,high,scale=4,rough=.6,bump=.025):
 m=bpy.data.materials.get(name) or bpy.data.materials.new(name)
 m.use_nodes=True;n=m.node_tree.nodes;n.clear();l=m.node_tree.links
 outn=n.new('ShaderNodeOutputMaterial');p=n.new('ShaderNodeBsdfPrincipled')
 l.new(p.outputs['BSDF'],outn.inputs['Surface']);p.inputs['Roughness'].default_value=rough
 tex=n.new('ShaderNodeTexCoord');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=scale;noise.inputs['Detail'].default_value=4;noise.inputs['Roughness'].default_value=.7
 l.new(tex.outputs['Object'],noise.inputs['Vector'])
 ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.2;ramp.color_ramp.elements[0].color=(*low,1);ramp.color_ramp.elements[1].position=.8;ramp.color_ramp.elements[1].color=(*high,1)
 l.new(noise.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs[0],p.inputs['Base Color'])
 micro=n.new('ShaderNodeTexNoise');micro.inputs['Scale'].default_value=140;micro.inputs['Detail'].default_value=2;l.new(tex.outputs['Object'],micro.inputs['Vector'])
 b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.2;b.inputs['Distance'].default_value=bump;l.new(micro.outputs['Fac'],b.inputs['Height']);l.new(b.outputs[0],p.inputs['Normal'])
 return m

surface('Honey limestone',(.36,.29,.20),(.62,.54,.39),2,.78,.018)
surface('Cut travertine',(.46,.39,.28),(.74,.66,.50),3.5,.63,.012)
surface('Water-worn stone',(.16,.18,.15),(.41,.40,.32),2,.68,.04)
surface('Dry riverbank',(.16,.17,.105),(.39,.34,.22),.65,.91,.025)
surface('Laid ivory paper',(.68,.59,.40),(.84,.76,.56),4,.8,.0008)
surface('Olive bark',(.07,.055,.032),(.24,.19,.12),7,.87,.018)
for name in ['Oxblood leather','Indigo leather','Olive leather','Burnished leather']:
 m=bpy.data.materials.get(name)
 for n in m.node_tree.nodes:
  if n.type=='BUMP':n.inputs['Distance'].default_value=.003;n.inputs['Strength'].default_value=.14
for m in bpy.data.materials:
 if m.name.startswith('Olive leaf'):
  p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.115,.16,.062,1);p.inputs['Roughness'].default_value=.48;p.inputs['Subsurface Weight'].default_value=.05
  p.inputs['Subsurface Radius'].default_value=(.15,.3,.1)
# Replace ribbed book texture with an original printed page and proper page UVs.
page=bpy.data.materials.new('Original printed essay');page.use_nodes=True
pn=page.node_tree.nodes;p=pn.get('Principled BSDF');p.inputs['Roughness'].default_value=.82
im=bpy.data.images.load(os.path.join(os.path.dirname(__file__),'authored-page.png'));im.pack()
tex=pn.new('ShaderNodeTexImage');tex.image=im;page.node_tree.links.new(tex.outputs[0],p.inputs['Base Color'])
for o in s.objects:
 if o.name.startswith('Open book curved leaf'):
  o.data.materials.clear();o.data.materials.append(page)
  uv=o.data.uv_layers.active
  for poly in o.data.polygons:
   poly.use_smooth=True
   for li in poly.loop_indices:
    v=o.data.vertices[o.data.loops[li].vertex_index].co
    uv.data[li].uv=(abs(v.x+.4)/.95,(v.y-6.1)/1.3)
 if o.name.startswith('Page block'):
  # Thin fore-edge lines follow the actual page stack, rather than giant ribs.
  pass

def river_x(y):return 3.8*math.sin((y+13)*.047)
def river_z(y):return 3 if y>-52 else 1.15
def terrain_z(x,y):
 dist=abs(x-river_x(y));ridge=max(0,dist-(5.5+.5*math.sin(y*.17)))
 h=river_z(y)-.5+ridge*.24
 h+=min(1,ridge/4)*(.09*math.sin(x*.9+y*.7)+.035*math.cos(x*2.7-y*.8))
 h+=max(0,dist-12)*(.12*math.sin(x*.14+y*.1)+.11*math.cos(y*.11)+.1*math.sin(x*.33-y*.12))
 return max(h,5.2) if y>0 else h
terrain=bpy.data.objects.get('Continuous valley terrain')
for v in terrain.data.vertices:v.co.z=terrain_z(v.co.x,v.co.y)
sub=terrain.modifiers.new('Subtle eroded bank smoothing','SUBSURF');sub.levels=1;sub.render_levels=1
grass=bpy.data.objects.get('Dry meadow blades')
if grass:
 for v in grass.data.vertices:
  x,y=v.co.x,v.co.y
  dist=abs(x-river_x(y));old=river_z(y)-.5+max(0,dist-5.5)*.24
  old+=min(1,max(0,dist-5.5)/4)*(.3*math.sin(x*.9+y*.7)+.12*math.cos(x*2.7-y*.8))
  old+=max(0,dist-12)*(.18*math.sin(x*.14+y*.1)+.19*math.cos(y*.11)+.15*math.sin(x*.33-y*.12))
  v.co.z=terrain_z(x,y)+(v.co.z-old)*.75

def mesh(name,verts,faces,mat):
 d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);s.collection.objects.link(o);d.materials.append(mat)
 for f in d.polygons:f.use_smooth=True
 return o
def stone(name,loc,scale,mat):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.rotation_euler=(random.random(),random.random(),random.random()*6.28);o.data.materials.append(mat)
 for f in o.data.polygons:f.use_smooth=True
 return o
# Layered rocks, herbs and sparse dry grasses break the banks' regular outline.
rock=bpy.data.materials['Water-worn stone'];herb=surface('Riverbank sage',(.075,.10,.045),(.24,.28,.12),12,.8,.002)
verts=[];faces=[]
for j in range(1300):
 y=random.uniform(-112,-9);side=random.choice([-1,1]);x=river_x(y)+side*random.uniform(5.4,8.3)
 z=terrain_z(x,y)+.03
 if j<160:stone('Shore pebbles',(x,y,z),(random.uniform(.07,.24),random.uniform(.1,.4),random.uniform(.05,.16)),rock)
 for k in range(9):
  a=random.random()*math.tau;r=random.uniform(.02,.22);h=random.uniform(.12,.35)
  px=x+math.cos(a)*r;py=y+math.sin(a)*r;n=len(verts)
  verts.extend([(px-.018,py,z),(px+.018,py,z),(px+math.cos(a)*.15,py+math.sin(a)*.15,z+h)])
  faces.append((n,n+1,n+2))
mesh('Mediterranean bankside herbs',verts,faces,herb)

# Water: world-scale capillary normals, Fresnel reflection and moving turbulence.
water=bpy.data.materials['River water'];water.node_tree.nodes.clear();n=water.node_tree.nodes;l=water.node_tree.links
outn=n.new('ShaderNodeOutputMaterial');p=n.new('ShaderNodeBsdfPrincipled');l.new(p.outputs[0],outn.inputs['Surface'])
p.inputs['Base Color'].default_value=(.055,.145,.105,1);p.inputs['Roughness'].default_value=.115;p.inputs['IOR'].default_value=1.333;p.inputs['Transmission Weight'].default_value=.42;p.inputs['Metallic'].default_value=0
coord=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping');mapping.name='Flow coordinates';mapping.inputs['Scale'].default_value=(1.7,.5,1);l.new(coord.outputs['Object'],mapping.inputs['Vector'])
noise=n.new('ShaderNodeTexNoise');noise.noise_dimensions='4D';noise.name='Flow time';noise.inputs['Scale'].default_value=6;noise.inputs['Detail'].default_value=3;noise.inputs['Roughness'].default_value=.6;l.new(mapping.outputs[0],noise.inputs['Vector'])
b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.32;b.inputs['Distance'].default_value=.055;l.new(noise.outputs['Fac'],b.inputs['Height']);l.new(b.outputs[0],p.inputs['Normal'])
micro=n.new('ShaderNodeTexNoise');micro.inputs['Scale'].default_value=58;micro.inputs['Detail'].default_value=2;l.new(mapping.outputs[0],micro.inputs['Vector'])
b2=n.new('ShaderNodeBump');b2.inputs['Strength'].default_value=.16;b2.inputs['Distance'].default_value=.008;l.new(micro.outputs['Fac'],b2.inputs['Height']);l.new(b.outputs[0],b2.inputs['Normal']);l.new(b2.outputs[0],p.inputs['Normal'])
for o in s.objects:
 if o.name in ['UpperRiver','LowerRiver']:
  for v in o.data.vertices:v.co.z=river_z(v.co.y if o.name=='UpperRiver' else -60)
  sub=o.modifiers.new('Continuous water surface','SUBSURF');sub.levels=1

# A continuous waterfall crest plus tapered aerated filaments, not faceted sheets.
fall=bpy.data.objects['Waterfall']
for v in fall.data.vertices:
 t=v.index//33/24;v.co.y=-52-.8*math.sin(t*math.pi/2);v.co.z=3-1.85*t
sub=fall.modifiers.new('Smooth falling curtain','SUBSURF');sub.levels=2
foam=surface('Aerated waterfall',(.28,.40,.32),(.68,.76,.65),8,.66,.003)
fp=foam.node_tree.nodes.get('Principled BSDF');fp.inputs['Transmission Weight'].default_value=0;fp.inputs['IOR'].default_value=1.333
fall.data.materials.clear();fall.data.materials.append(water)
verts=[];faces=[]
for i in range(135):
 x=river_x(-52)+(random.random()-.5)*10.25;width=random.uniform(.012,.045);phase=random.random()*6.28;top=random.uniform(.01,.12);bottom=random.uniform(.75,1)
 for j in range(17):
  t=top+(bottom-top)*j/16;yy=-52-.8*math.sin(t*math.pi/2)-.025
  xx=x+.025*math.sin(t*19+phase);zz=3-1.85*t
  w=width*math.sin(math.pi*j/16)**.5;n=len(verts);verts.extend([(xx-w,yy,zz),(xx+w,yy,zz)])
  if j:faces.append((n-2,n-1,n+1,n))
mesh('Falling aerated filaments',verts,faces,foam)
for o in list(s.objects):
 if o.name.startswith('Waterfall airborne foam'):bpy.data.objects.remove(o,do_unlink=True)
for i in range(55):
 x=river_x(-52)+(random.random()-.5)*10;y=random.uniform(-53.6,-52.9)
 stone('Fine waterfall spray',(x,y,random.uniform(1.2,1.6)),(.015,.024,.045),foam)
verts=[];faces=[]
for i in range(450):
 x=river_x(-52)+(random.random()-.5)*10;y=random.uniform(-54.7,-53);r=random.uniform(.015,.055);n=len(verts)
 for j in range(9):
  a=j*math.tau/8;verts.append((x+math.cos(a)*r,y+math.sin(a)*r*1.9,1.178))
 faces.append(tuple(n+j for j in range(8)))
mesh('Waterfall foam pool',verts,faces,foam)

# Aeration belongs to the continuous water surface. Loose flat foam discs and
# full-height white filaments produced a dotted, artificial appearance.
for name in ['Waterfall foam pool','Falling aerated filaments']:
 o=bpy.data.objects.get(name)
 if o:bpy.data.objects.remove(o,do_unlink=True)
for o in list(s.objects):
 if o.name.startswith('Fine waterfall spray'):bpy.data.objects.remove(o,do_unlink=True)
foam.node_tree.nodes.clear();fn=foam.node_tree.nodes;fl=foam.node_tree.links
fo=fn.new('ShaderNodeOutputMaterial');fp=fn.new('ShaderNodeBsdfPrincipled');fl.new(fp.outputs[0],fo.inputs['Surface'])
fp.inputs['Roughness'].default_value=.3;fp.inputs['Transmission Weight'].default_value=.16;fp.inputs['IOR'].default_value=1.333
fc=fn.new('ShaderNodeTexCoord');fm=fn.new('ShaderNodeMapping');fm.name='Falling water coordinates';fm.inputs['Scale'].default_value=(3.8,1,.55);fl.new(fc.outputs['Object'],fm.inputs[0])
ft=fn.new('ShaderNodeTexNoise');ft.noise_dimensions='4D';ft.name='Falling water time';ft.inputs['Scale'].default_value=8;ft.inputs['Detail'].default_value=3;fl.new(fm.outputs[0],ft.inputs['Vector'])
fr=fn.new('ShaderNodeValToRGB');fr.color_ramp.elements[0].position=.28;fr.color_ramp.elements[0].color=(.06,.20,.13,1);fr.color_ramp.elements[1].position=.72;fr.color_ramp.elements[1].color=(.63,.74,.62,1);fl.new(ft.outputs['Fac'],fr.inputs[0]);fl.new(fr.outputs[0],fp.inputs['Base Color'])
fb=fn.new('ShaderNodeBump');fb.inputs['Strength'].default_value=.22;fb.inputs['Distance'].default_value=.025;fl.new(ft.outputs['Fac'],fb.inputs['Height']);fl.new(fb.outputs[0],fp.inputs['Normal'])
fall.data.materials.clear();fall.data.materials.append(foam)
# Continuous impact foam uses the actual riverbed coordinates and the same
# moving water noise; no detached geometry or photographic layer is involved.
wn=water.node_tree.nodes;wl=water.node_tree.links;wp=next(x for x in wn if x.type=='BSDF_PRINCIPLED')
impact=wn.new('ShaderNodeVectorMath');impact.operation='ADD';impact.inputs[1].default_value=(-river_x(-52),53.5,0);wl.new(coord.outputs['Object'],impact.inputs[0])
scale=wn.new('ShaderNodeVectorMath');scale.operation='MULTIPLY';scale.inputs[1].default_value=(.17,.52,0);wl.new(impact.outputs[0],scale.inputs[0])
length=wn.new('ShaderNodeVectorMath');length.operation='LENGTH';wl.new(scale.outputs[0],length.inputs[0])
mask=wn.new('ShaderNodeMath');mask.operation='LESS_THAN';mask.inputs[1].default_value=1;wl.new(length.outputs['Value'],mask.inputs[0])
flecks=wn.new('ShaderNodeMapRange');flecks.inputs['From Min'].default_value=.51;flecks.inputs['From Max'].default_value=.72;wl.new(noise.outputs['Fac'],flecks.inputs['Value'])
factor=wn.new('ShaderNodeMath');factor.operation='MULTIPLY';wl.new(mask.outputs[0],factor.inputs[0]);wl.new(flecks.outputs[0],factor.inputs[1])
mix=wn.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.055,.145,.105,1);mix.inputs[2].default_value=(.58,.68,.56,1);wl.new(factor.outputs[0],mix.inputs[0]);wl.new(mix.outputs[0],wp.inputs['Base Color'])

# Better room fill, no flat frontal lamp. A broad warm bounce reveals bindings.
bpy.ops.object.light_add(type='AREA',location=(1.5,5,12.5));a=bpy.context.object;a.name='Reading room indirect bounce';a.data.energy=420;a.data.color=(1,.86,.66);a.data.shape='DISK';a.data.size=5;a.rotation_euler=(Vector((-1,7,8))-a.location).to_track_quat('-Z','Y').to_euler()
s.camera.data.lens=30;s.camera.data.dof.use_dof=False
sun=s.objects['Late afternoon sunlight'];sun.data.angle=.12
sky=next(n for n in s.world.node_tree.nodes if n.type=='TEX_SKY');sky.air_density=1.2;sky.dust_density=2.4
# Atmospheric perspective is a physical low density volume, shared by all views.
mist=bpy.data.materials.new('Valley atmospheric perspective');mist.use_nodes=True;mn=mist.node_tree.nodes;mn.clear();mo=mn.new('ShaderNodeOutputMaterial');mv=mn.new('ShaderNodeVolumeScatter');mv.inputs['Color'].default_value=(.64,.70,.73,1);mv.inputs['Density'].default_value=.0018;mv.inputs['Anisotropy'].default_value=.25;mist.node_tree.links.new(mv.outputs[0],mo.inputs['Volume'])
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,-80,27));o=bpy.context.object;o.name='Valley air volume';o.dimensions=(180,230,90);o.data.materials.append(mist)

camera_data=json.load(open(os.path.join(os.path.dirname(source),'world-camera.json')))
camera_data['interpolation']='nonuniform cubic Hermite with endpoint easing'
with open(os.path.join(out,'world-camera.json'),'w') as f:json.dump(camera_data,f,indent=2)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'living-world-refined.blend'),compress=True)
print('REFINEMENT_SAVED',len(s.objects),flush=True)
