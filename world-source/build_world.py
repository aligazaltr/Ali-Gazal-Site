"""Original deterministic scene. Blender 4.3+. No external model or texture assets.
Run blender -b --python world-source/build_world.py -- /absolute/output-dir
Units are metres. Blender Z-up. GLB converts to Y-up for the same camera path.
"""
import bpy, math, random, json, sys, os
import numpy as np
from mathutils import Vector
random.seed(2718)
out=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else os.getcwd()
os.makedirs(out,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=False
scene.render.resolution_x=1280;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='AgX'
scene.render.fps=24
scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.8
# Seeded original PBR texture maps, shared by Blender and exported glTF.
def material(name,color,rough=.65,metal=0,kind=None):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 n=m.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 if kind:
  size=512; rng=np.random.default_rng(len(name)*71); yy,xx=np.mgrid[0:size,0:size];noise=rng.normal(0,.025,(size,size))
  if kind=='wood':noise+=.065*np.sin(yy*.22+5*np.sin(xx*.018))+.025*np.sin(yy*1.2+np.sin(xx*.04))
  elif kind=='paper':noise+=.035*np.sin(yy*1.6)+.018*np.sin(xx*.1)
  else:
   for scale,amp in [(12,.08),(33,.03),(85,.012)]: noise+=amp*np.sin(xx/scale+np.sin(yy/(scale*.7)))*np.sin(yy/(scale*1.3))
  data=np.ones((size,size,4),np.float32);data[:,:,:3]=np.clip(np.array(color)[None,None,:]*(1+noise[:,:,None]*3),0,1)
  image=bpy.data.images.new(name+'_original_color',width=size,height=size);image.pixels.foreach_set(data.ravel());image.pack()
  t=n.new('ShaderNodeTexImage');t.image=image;m.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color'])
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.23;bump.inputs['Distance'].default_value=.065
  m.node_tree.links.new(t.outputs['Color'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
 return m
stone=material('Honey limestone',(.61,.48,.32),kind='stone');edge=material('Cut travertine',(.76,.65,.47),kind='stone')
wood=material('Old walnut',(.17,.078,.032),kind='wood');pages=material('Laid ivory paper',(.79,.70,.49),kind='paper')
leathers=[material(n,c,.75,kind='leather') for n,c in [('Oxblood leather',(.23,.052,.027)),('Indigo leather',(.045,.083,.092)),('Olive leather',(.105,.12,.053)),('Burnished leather',(.29,.16,.06))]]
gold=material('Tarnished brass',(.43,.29,.1),.35,.72);earth=material('Dry riverbank',(.27,.23,.145),kind='stone');rockmat=material('Water-worn stone',(.33,.31,.24),kind='stone')
leafmats=[material('Olive leaf '+str(i),c,.78) for i,c in enumerate([(.16,.20,.08),(.26,.29,.12),(.34,.35,.18)])]
bark=material('Olive bark',(.17,.12,.07),kind='wood')
water=material('River water',(.035,.145,.13),.16,.15);p=water.node_tree.nodes.get('Principled BSDF');p.inputs['Transmission Weight'].default_value=.32;p.inputs['IOR'].default_value=1.333
# Actual geometry helpers. Bevels catch sunlight, every surface has consistent UVs.
def mesh(name,verts,faces,mat):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.data.materials.append(mat)
 uv=data.uv_layers.new(name='Planar stone UV')
 for polygon in data.polygons:
  for loop in polygon.loop_indices:
   v=data.vertices[data.loops[loop].vertex_index].co;uv.data[loop].uv=(v.x*.19,v.y*.19+v.z*.07)
 return o
def cube(name,loc,scale,mat,bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 if bevel:
  b=o.modifiers.new('Soft worn edges','BEVEL');b.width=bevel;b.segments=3;o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
 return o
def cylinder(name,a,b,r1,r2,mat,vertices=16):
 mid=(Vector(a)+Vector(b))/2;delta=Vector(b)-Vector(a);bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=r1,radius2=r2,depth=delta.length,location=mid);o=bpy.context.object;o.name=name;o.rotation_euler=delta.to_track_quat('Z','Y').to_euler();o.data.materials.append(mat)
 for f in o.data.polygons:f.use_smooth=True
 return o
def sphere(name,loc,scale,mat,sub=2):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat)
 for f in o.data.polygons:f.use_smooth=True
 return o
# Room and terrace are an actual open building, never a landscape billboard.
for i in range(-4,4):
 for j in range(-5,8):cube('Travertine floor slab',(i*1.85+.9,j*1.65,5.82),(1.82,1.62,.28),edge,.025)
cube('Left room wall',(-7,5.8,10),(0.6,12.5,8.5),stone)
cube('Right room wall',(7,5.8,10),(0.6,12.5,8.5),stone)
cube('Rear library wall',(0,12,10),(14.6,.6,8.5),stone)
cube('Ceiling',(0,6,14.25),(14.6,12.7,.45),wood)
for y in [1,4,7,10]:cube('Ceiling beam',(0,y,13.8),(14.5,.32,.45),wood)
# Front opening is 6m wide, camera physically traverses y=0.
for x in [-5.2,5.2]:cube('Window pier wall',(x,0,9.8),(4.3,.7,8),stone)
cube('Stone over arch',(0,0,13.7),(6.5,.7,1.5),stone)
def arch(name,cx,y,z,r,depth=.7):
 for i in range(26):
  a=i*math.pi/26;b=(i+1)*math.pi/26
  verts=[(cx+rr*math.cos(t),yy,z+rr*math.sin(t)) for yy in [y-depth/2,y+depth/2] for rr,t in [(r,a),(r,b),(r+.42,b),(r+.42,a)]]
  o=mesh(name+' voussoir '+str(i),verts,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],edge)
 for x in [cx-r-.22,cx+r+.22]:
  cylinder(name+' shaft',(x,y,z-4),(x,y,z-.12),.24,.22,edge,24)
  for zz,w,h in [(z-3.9,.8,.2),(z-3.65,.62,.16),(z-.15,.78,.24)]:cube(name+' capital',(x,y,zz),(w,depth+.25,h),edge,.035)
arch('Library window',0,0,10,3)
# Wall shelves behind and to camera left.
for x in [-6.2,5.9]:
 for z in [7,8.7,10.4,12.1]:
  cube('Library shelf',(x,8,z),(.7,5.5,.12),wood)
  for j in range(19):
   yy=5.4+j*.27;book=cube('Shelved volume',(x,yy,z+.55),(.48,.19,.94),random.choice(leathers),.025)
   for zz in [z+.22,z+.83]:cube('Spine gilding',(x-.25 if x>0 else x+.25,yy,zz),(.015,.195,.025),gold,.003)
# Main reading table left of the camera corridor.
cube('Reading table top',(-1.85,7,8),(4.4,2.5,.28),wood,.10)
for x in [-3.5,-.2]:
 for y in [6.1,7.9]:cylinder('Turned table leg',(x,y,6),(x,y,7.9),.12,.16,wood,24)
for index,(x,y,z,w,d,h) in enumerate([(-2.5,7,8.4,1.7,1.15,.45),(-2.45,7,8.88,1.55,1.1,.4),(-2.55,7,9.3,1.6,1.05,.38)]):
 mat=leathers[index]
 for dz in [-h/2,h/2]:cube('Book leather board '+str(index),(x,y,z+dz),(w+.1,d+.08,.065),mat,.035)
 cube('Page block '+str(index),(x+.025,y,z),(w-.06,d-.05,h-.06),pages,.015)
 cube('Rounded leather spine '+str(index),(x-w/2,y,z),(.11,d,h+.06),mat,.05)
 for yy in [y-d*.32,y+d*.32]:cube('Gold tooled band',(x-w/2-.06,yy,z),(.018,.035,h+.04),gold,.006)
# Binding tooling follows the actual covers, with original brass corner pieces.
for x,y,z,w,d,h in [(-2.5,7,8.4,1.7,1.15,.45),(-2.45,7,8.88,1.55,1.1,.4),(-2.55,7,9.3,1.6,1.05,.38)]:
 for xx in [x-w*.42,x+w*.42]:
  for yy in [y-d*.4,y+d*.4]:cube('Cover brass corner',(xx,yy,z+h/2+.038),(.13,.13,.014),gold,.012)
 for zz in [-.13,0,.13]:cube('Page fore-edge ruling',(x,y-d/2-.002,z+zz),(w-.07,.008,.006),gold,.001)
# Open book with gently curved paper surfaces, visible page thickness and binding.
for side in [-1,1]:
 verts=[];faces=[]
 for iy in range(13):
  for ix in range(25):
   u=ix/24;verts.append((-.4+side*u*.95,6.1+iy/12*1.3,8.2+.12*math.sin(u*math.pi)+.07*(1-u)))
 for iy in range(12):
  for ix in range(24):
   a=iy*25+ix;faces.append((a,a+1,a+26,a+25))
 o=mesh('Open book curved leaf',verts,faces,pages);sol=o.modifiers.new('Stacked paper thickness','SOLIDIFY');sol.thickness=.05
cube('Loose notes',(-.8,7.8,8.16),(.7,.5,.025),pages,.005)
cylinder('Brass pen',(-.85,6.5,8.3),(-.35,6.85,8.32),.023,.023,gold)
# River geography. One continuous bed, upstream and downstream separated by a real fall.
def river_x(y):return 3.8*math.sin((y+13)*.047)
def river_z(y):return 3.0 if y>-52 else 1.15
verts=[];faces=[]
for j in range(221):
 y=15-j*.9
 for i in range(161):
  x=-80+i;dist=abs(x-river_x(y));bank=5.5+.5*math.sin(y*.17)
  ridge=max(0,dist-bank)
  height=river_z(y)-.5+ridge*.24
  height+=min(1,ridge/4)*(.3*math.sin(x*.9+y*.7)+.12*math.cos(x*2.7-y*.8))
  height+=max(0,dist-12)*(.18*math.sin(x*.14+y*.1)+.19*math.cos(y*.11)+.15*math.sin(x*.33-y*.12))
  if y>0:height=max(height,5.2)
  verts.append((x,y,height))
for j in range(220):
 for i in range(160):
  a=j*161+i;faces.append((a,a+1,a+162,a+161))
o=mesh('Continuous valley terrain',verts,faces,earth)
for f in o.data.polygons:f.use_smooth=True
for ya,yb,name in [(-8,-52,'UpperRiver'),(-52,-140,'LowerRiver')]:
 verts=[];faces=[]
 for j in range(161):
  y=ya+(yb-ya)*j/160
  for k in range(13):
   x=river_x(y)+(k/12-.5)*10.5;z=river_z((ya+yb)/2)+.025*math.sin(y*3+k*.7);verts.append((x,y,z))
 for j in range(160):
  for k in range(12):
   a=j*13+k;faces.append((a,a+1,a+14,a+13))
 o=mesh(name,verts,faces,water)
 for f in o.data.polygons:f.use_smooth=True
# Waterfall is curved 3D surface, the river crest is continuous with it.
verts=[];faces=[]
for j in range(25):
 t=j/24
 for k in range(33):verts.append((river_x(-52)+(k/32-.5)*10.5,-52-.8*math.sin(t*math.pi/2),3-1.85*t))
for j in range(24):
 for k in range(32):
  a=j*33+k;faces.append((a,a+1,a+34,a+33))
fall=mesh('Waterfall',verts,faces,water)
for polygon in fall.data.polygons:polygon.use_smooth=True
# River edge rocks vary smoothly in size and angle.
for j in range(90):
 y=random.uniform(-120,-9);side=random.choice([-1,1]);x=river_x(y)+side*random.uniform(5.2,7.8);z=river_z(y)
 o=sphere('Bank limestone',(x,y,z), (random.uniform(.35,1.1),random.uniform(.5,1.3),random.uniform(.35,.8)),rockmat,2);o.rotation_euler.z=random.random()*6
# Classical river terrace, a bridge and a distant colonnade in the same geography.
for y in [-25,-28,-31]:
 for x in [10,13,16]:cube('Riverside terrace paving',(x,y,4),(2.95,2.95,.25),edge)
for y in [-23,-28,-33]:
 for x in [8.5,17.5]:
  cylinder('River pavilion column',(x,y,4),(x,y,9),.3,.25,edge,28)
  cube('Pavilion capital',(x,y,9),(.95,.95,.3),edge)
cube('Pavilion architrave',(13,-28,9.5),(10,11,.5),edge)
# Bridge arch faces along the river, spanning the actual water.
arch('Waterfall bridge',river_x(-51),-49,5.5,5.7,.9)
for x in [-6.6,6.6]:cube('Bridge abutment',(river_x(-51)+x,-49,3.8),(1.8,1.6,4),stone)
# Detailed olive trees with actual narrow leaf geometry, consolidated per tree.
def tree(x,y,z,scale=1):
 before=set(bpy.data.objects);cylinder('Olive trunk',(x,y,z),(x+.15*scale,y,z+3.4*scale),.24*scale,.12*scale,bark,14)
 centers=[]
 for b in range(7):
  angle=b*2.4;end=(x+math.cos(angle)*1.45*scale,y+math.sin(angle)*1.25*scale,z+(3.3+random.random()*1.3)*scale)
  cylinder('Olive bough',(x+.1*scale,y,z+2.2*scale),end,.09*scale,.025*scale,bark,8);centers.append(end)
 verts=[];faces=[]
 for center in centers:
  for k in range(180):
   a=random.random()*math.tau;r=random.random()**.4*1.3*scale
   pos=Vector(center)+Vector((math.cos(a)*r,math.sin(a)*r,random.uniform(-.65,.65)*scale));angle=random.random()*math.tau
   length=random.uniform(.22,.36)*scale;v=Vector((math.cos(angle),math.sin(angle),.25))*length;cross=Vector((-math.sin(angle),math.cos(angle),.1))*length*.26
   n=len(verts);verts += [tuple(pos-v),tuple(pos+cross),tuple(pos+v),tuple(pos-cross),tuple(pos+Vector((0,0,.025*scale)))];faces.extend([(n,n+1,n+4),(n+1,n+2,n+4),(n+2,n+3,n+4),(n+3,n,n+4)])
 o=mesh('Olive foliage',verts,faces,leafmats[random.randrange(3)])
 for f in o.data.polygons:f.use_smooth=True
for x,y,s in [(-6,-6,1.3),(6,-8,1),(-10,-20,1.5),(15,-18,1.3),(-10,-38,1.5),(13,-45,1.2),(-12,-62,1.5),(10,-78,1.7),(-19,-87,1.8),(20,-99,1.5)]:tree(x,y,6 if y>-10 else river_z(y)+max(0,abs(x-river_x(y))-5)*.29,s)
# Foreground branch inside the room.
tree(4.6,8.6,6,1.2)
# Large geological ridge meshes, never flat background photographs.
# Natural irregular riverbank ground cover, original narrow grass meshes.
verts=[];faces=[]
for k in range(12000):
 y=random.uniform(-125,-10);side=random.choice([-1,1]);x=river_x(y)+side*random.uniform(6.5,17);dist=abs(x-river_x(y));z=river_z(y)-.5+max(0,dist-5.5)*.24
 z+=min(1,max(0,dist-5.5)/4)*(.3*math.sin(x*.9+y*.7)+.12*math.cos(x*2.7-y*.8))
 z+=max(0,dist-12)*(.18*math.sin(x*.14+y*.1)+.19*math.cos(y*.11)+.15*math.sin(x*.33-y*.12))
 n=len(verts);height=random.uniform(.15,.48);angle=random.uniform(0,math.tau);v=(math.cos(angle)*.025,math.sin(angle)*.025)
 verts.extend([(x-v[0],y-v[1],z),(x+v[0],y+v[1],z),(x+.08,y+.02,z+height)]);faces.append((n,n+1,n+2))
mesh('Dry meadow blades',verts,faces,leafmats[1])
cube('Bridge walkway',(river_x(-51),-49,11.85),(13.8,2.3,.5),edge,.1)
for side in [-1,1]:
 for k in range(18):
  x=river_x(-51)-6.8+k*.8;cube('Bridge parapet',(x,-49+side*1.05,12.35),(.79,.32,.7),stone,.035)
# Warm physical illumination.
world=bpy.data.worlds.new('Mediterranean sky');world.use_nodes=True;scene.world=world
nodes=world.node_tree.nodes;sky=nodes.new('ShaderNodeTexSky');sky.sky_type='NISHITA';sky.sun_elevation=math.radians(23);sky.sun_rotation=math.radians(140);sky.altitude=150
world.node_tree.links.new(sky.outputs['Color'],nodes['Background'].inputs['Color']);nodes['Background'].inputs['Strength'].default_value=.26
bpy.ops.object.light_add(type='SUN',location=(15,-15,30));sun=bpy.context.object;sun.name='Late afternoon sunlight';sun.rotation_euler=(math.radians(32),math.radians(-22),math.radians(-35));sun.data.energy=2.4;sun.data.angle=.08
bpy.ops.object.light_add(type='AREA',location=(0,-.4,11));area=bpy.context.object;area.name='Soft window bounce';area.data.energy=900;area.data.shape='DISK';area.data.size=6;area.rotation_euler=(Vector((0,7,8))-area.location).to_track_quat('-Z','Y').to_euler()
# One continuous spatial route, intro ends at t=.18, same route used in browser.
path=[
 {'t':0,'p':[1.4,10.3,9.5],'look':[-1.3,6.8,8.8]},
 {'t':.055,'p':[.9,8.3,9.45],'look':[-1.2,5.5,8.8]},
 {'t':.11,'p':[.35,3.5,9.55],'look':[0,-18,6]},
 {'t':.18,'p':[0,-4,10],'look':[0,-24,3.7]},
 {'t':.31,'p':[1,-17,6.4],'look':[2,-33,3.2]},
 {'t':.43,'p':[2.7,-28,5.5],'look':[4,-43,3]},
 {'t':.55,'p':[3,-39,5.3],'look':[1,-51,3]},
 {'t':.65,'p':[6,-48,5.4],'look':[-2,-55,1.6]},
 {'t':.76,'p':[6,-59,4.2],'look':[-1,-53,2.5]},
 {'t':.87,'p':[14,-73,15],'look':[0,-37,4]},
 {'t':1,'p':[19,-88,26],'look':[0,-35,4]}
]
def sample(t,key):
 i=next((i for i in range(len(path)-1) if t<=path[i+1]['t']),len(path)-2);u=(t-path[i]['t'])/(path[i+1]['t']-path[i]['t']);u=max(0,min(1,u));u=u*u*(3-2*u)
 return Vector(path[i][key]).lerp(Vector(path[i+1][key]),u)
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='Living world continuous camera';scene.camera=cam;cam.data.lens=29;cam.data.clip_end=450
for frame in range(1,721):
 t=(frame-1)/719;cam.location=sample(t,'p');cam.rotation_euler=(sample(t,'look')-cam.location).to_track_quat('-Z','Y').to_euler();cam.keyframe_insert(data_path='location',frame=frame);cam.keyframe_insert(data_path='rotation_euler',frame=frame)
scene.frame_end=720;scene.frame_set(1)
# Export sources and the original geometric scene. Water time is animated by the web shader.
with open(os.path.join(out,'world-camera.json'),'w') as f:json.dump({'coordinates':'Blender Z-up, metres','introEnd':.18,'introSeconds':4.9,'path':path},f,indent=2)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out,'living-world.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(out,'living-world.glb'),export_format='GLB',export_animations=False,export_lights=False,export_cameras=False,export_apply=True,export_image_format='JPEG',export_jpeg_quality=90)
print('WORLD_BUILT',len(scene.objects),flush=True)
for label,t in [('room',.015),('window',.105),('valley',.23),('river',.45),('waterfall',.72),('sunset',1)]:
 scene.frame_set(1+round(t*719));scene.render.filepath=os.path.join(out,label+'.png');bpy.ops.render.render(write_still=True)
