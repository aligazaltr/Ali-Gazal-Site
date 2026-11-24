import * as THREE from './world-three.js';
import { GLTFLoader } from './world-gltf.js';
import { cameraPose } from './world-camera.js';

export async function createLivingWorld(canvas, onProgress=()=>{}) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.debug.onShaderError=()=>{throw new Error('3D shader compilation failed');};
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();
 scene.background=new THREE.Color('#adbbc0');
 scene.fog=new THREE.FogExp2('#b2b4a1',.006);
 const camera=new THREE.PerspectiveCamera(62,1,.07,450);
 const hemi=new THREE.HemisphereLight('#c4d9ef','#6e5134',2.1);scene.add(hemi);
 const sunlight=new THREE.DirectionalLight('#ffdd9a',3.7);
 sunlight.position.set(-20,38,16);sunlight.castShadow=true;
 sunlight.shadow.mapSize.set(2048,2048);sunlight.shadow.camera.left=-32;sunlight.shadow.camera.right=32;sunlight.shadow.camera.top=35;sunlight.shadow.camera.bottom=-35;sunlight.shadow.camera.far=130;sunlight.shadow.normalBias=.045;sunlight.shadow.bias=-.0001;sunlight.shadow.radius=3;
 scene.add(sunlight,sunlight.target);
 const bounce=new THREE.PointLight('#ffe2b3',65,28,2);bounce.position.set(0,11,1);scene.add(bounce);
 // A real three-dimensional sky enclosure supplies reflection colours to PBR water.
 const skyGeometry=new THREE.SphereGeometry(220,48,32);
 const skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,uniforms:{warm:{value:0}},vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 direction;uniform float warm;void main(){float h=normalize(direction).y;vec3 horizon=mix(vec3(.74,.73,.61),vec3(.88,.40,.17),warm);vec3 zenith=mix(vec3(.25,.42,.55),vec3(.24,.28,.40),warm);gl_FragColor=vec4(mix(horizon,zenith,smoothstep(0.,.8,h)),1.);}'});
 const sky=new THREE.Mesh(skyGeometry,skyMaterial);scene.add(sky);
 const environmentScene=new THREE.Scene();environmentScene.add(new THREE.Mesh(skyGeometry,skyMaterial));
 const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(environmentScene,.04,.1,500);scene.environment=env.texture;pmrem.dispose();
 const uniforms={time:{value:0}};
 const response=await fetch('./world-model.bin');
 if(!response.ok)throw new Error('Ortam dosyası yüklenemedi');
 const bytes=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const gltf=await new GLTFLoader().parseAsync(bytes, new URL('.',location.href).href);
 onProgress(1);
 const model=gltf.scene;scene.add(model);
 const waterMaterials=new Set(),leafMaterials=new Set();let triangles=0;
 model.traverse(object=>{
  if(!object.isMesh)return;
  triangles+=(object.geometry.index?.count??object.geometry.attributes.position.count)/3*(object.count??1);
  object.castShadow=true;object.receiveShadow=true;
  for(const material of Array.isArray(object.material)?object.material:[object.material]) {
   material.envMapIntensity=.7;
   if(material.map)material.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   if(/River water|Aerated falling water/.test(material.name))waterMaterials.add(material);
   if(/Olive leaf/.test(material.name)){leafMaterials.add(material);material.side=THREE.DoubleSide;}
  }
 });
 for(const material of waterMaterials){
  material.roughness=.17;material.metalness=.38;material.color.set('#397f74');
  material.onBeforeCompile=shader=>{
   shader.uniforms.worldTime=uniforms.time;
   shader.vertexShader='uniform float worldTime;varying vec3 waterPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 wp=(modelMatrix*vec4(position,1.)).xyz;
   transformed.y+=.035*sin(wp.x*3.7+worldTime*1.3)+.025*sin(wp.z*2.1-worldTime*2.4);
   waterPoint=wp;`);
   shader.fragmentShader='uniform float worldTime;varying vec3 waterPoint;\n'+shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
   normal=normalize(normal+vec3(.10*cos(waterPoint.x*3.7+worldTime*1.3),.05*sin(waterPoint.z*2.1-worldTime*2.4),.08*cos(waterPoint.z*4.0-worldTime*3.0)));`).replace('#include <color_fragment>',`#include <color_fragment>
   float crest=pow(max(0.,sin(waterPoint.z*9.-worldTime*4.+sin(waterPoint.x*3.))),18.);
   float falls=(1.-smoothstep(.1,.8,abs(waterPoint.z-52.3)));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.78,.87,.78),crest*(.08+falls*.65));`);
  };
 }
 for(const material of leafMaterials){
  material.onBeforeCompile=shader=>{shader.uniforms.worldTime=uniforms.time;shader.vertexShader='uniform float worldTime;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   transformed.x+=.055*sin(position.z*2.1+worldTime*1.1)*sin(position.x+worldTime*.6);
   transformed.z+=.025*sin(position.y*2.+worldTime*1.5);`);};
 }
 // Airborne spray occupies the fall in the same world coordinates.
 const sprayPositions=new Float32Array(180*3);
 for(let i=0;i<180;i++){sprayPositions[i*3]=(Math.sin(i*17.2)*.5+.5)*10-5-3.6;sprayPositions[i*3+1]=1.2+(i%11)/11;sprayPositions[i*3+2]=52.5+Math.sin(i*8.4)*.7;}
 const sprayGeometry=new THREE.BufferGeometry();sprayGeometry.setAttribute('position',new THREE.BufferAttribute(sprayPositions,3));
 const spray=new THREE.Points(sprayGeometry,new THREE.PointsMaterial({color:'#e1e5cb',size:.055,transparent:true,opacity:.27,depthWrite:false}));scene.add(spray);
 let lastWidth=0,lastHeight=0,disposed=false;
 const warmDay=new THREE.Color('#ffdd9a'),warmEvening=new THREE.Color('#ffab5d');
 function draw(progress,seconds){
  if(disposed)return;
  const width=canvas.clientWidth,height=canvas.clientHeight;
  if(width!==lastWidth||height!==lastHeight){
   lastWidth=width;lastHeight=height;
   renderer.setPixelRatio(Math.min(devicePixelRatio||1,width<700?1.5:1.75));
   renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=width<700?74:62;camera.updateProjectionMatrix();
  }
  const pose=cameraPose(progress);camera.position.fromArray(pose.position);camera.lookAt(...pose.target);
  uniforms.time.value=seconds;const sunset=Math.max(0,(progress-.72)/.28);skyMaterial.uniforms.warm.value=sunset;
  sunlight.color.copy(warmDay).lerp(warmEvening,sunset);sunlight.intensity=3.7-sunset*1.5;
  // Follow the active region with the shadow frustum, preserving a fixed sun direction.
  sunlight.target.position.set(camera.position.x,0,camera.position.z-8);sunlight.position.copy(sunlight.target.position).add(new THREE.Vector3(-20,38-sunset*20,16));
  spray.rotation.y=Math.sin(seconds*.18)*.012;
  renderer.render(scene,camera);
 }
 function dispose(){disposed=true;renderer.dispose();env.dispose();model.traverse(o=>o.geometry?.dispose());}
 return {draw,dispose,scene,camera,renderer,stats:{triangles,objects:model.children.length,waterMaterials:waterMaterials.size,leafMaterials:leafMaterials.size}};
}
