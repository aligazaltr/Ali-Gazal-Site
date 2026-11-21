const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const M=require('../hero-opening-math');
const source=fs.readFileSync(require.resolve('../hero-opening-v1.js'),'utf8');
test('hero perspective keeps the whole cover inside its independent text/media regions',()=>{
 let cases=0;
 for(const width of [320,360,390,430,768,1000,1024,1440,1920]){
  const g=M.layout(width,width<=1000?844:900);
  for(const t of [0,.7,1.5,2.5,4,6])for(const p of [0,.15,.3,.45,.6,.75,1]){
   const s=M.sample(t,p,g),b=s.bounds;
   const r={left:(b.left+1)/2,right:(b.right+1)/2,top:(1-b.top)/2,bottom:(1-b.bottom)/2};
   assert.ok(r.left>=g.safe.left-.001&&r.right<=g.safe.right+.001&&r.top>=g.safe.top-.001&&r.bottom<=g.safe.bottom+.001,JSON.stringify({width,t,p,r,safe:g.safe}));
   assert.ok(s.vp.every(Number.isFinite));cases++;
  }
 }
 assert.equal(cases,378);
});
test('hero camera has genuine depth travel and a deterministic reversible scroll continuation',()=>{
 const g=M.layout(1440,900),a=M.sample(0,0,g),b=M.sample(6,0,g),c=M.sample(6,1,g);
 assert.ok(a.distance>b.distance&&b.distance>c.distance);
 assert.ok(a.yaw>b.yaw&&b.yaw>c.yaw);
 assert.equal(a.reveal,0);assert.equal(b.reveal,1);assert.equal(b.titleReveal,1);assert.equal(b.detailReveal,1);
 for(let i=0;i<=100;i++){
  const p=i/100,s=M.sample(6,p,g);M.sample(6,1-p,g);assert.deepEqual(M.sample(6,p,g),s);
  assert.equal(s.titleOpacity*s.continuation,0,'separate headings cannot be visible together');
  const n=M.sample(6,Math.min(1,p+.000001),g);
  assert.ok(Math.abs(s.distance-n.distance)<.001&&Math.abs(s.yaw-n.yaw)<.001);
 }
});
function fixture({reduce=false,saveData=false,large=false,short=false,noGL=false,shaderFails=false,has2D=false,hasGL=false}={}){
 const listeners={},classes=new Set();let contexts=0,frames=0,draws=0;
 const style={removeProperty(){},setProperty(){}};
 const node={style,addEventListener(){},hidden:true};
 const gl={VERTEX_SHADER:1,createShader:()=>({}),shaderSource(){},compileShader(){},getShaderParameter:()=>false,getShaderInfoLog:()=>'Controlled compile failure',deleteShader(){},isContextLost:()=>false};
 const activeGL=new Proxy({
   isContextLost:()=>false,createShader:()=>({}),createProgram:()=>({}),
   createTexture:()=>({}),createBuffer:()=>({}),
   getShaderParameter:()=>true,getProgramParameter:()=>true,
   getAttribLocation:()=>0,getUniformLocation:()=>null,
   NO_ERROR:0,getError:()=>0
 },{get:(target,key)=>key in target?target[key]:(()=>{})});
 const canvas={...node,addEventListener(k,fn){listeners[k]=fn;},
  getContext(){contexts++;return hasGL?activeGL:shaderFails?gl:null;}};
 const gradient={addColorStop(){}};
 const mock2D={setTransform(){},clearRect(){draws++;},save(){},translate(){},scale(){},createRadialGradient:()=>gradient,fillRect(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}};
 const backing={...node,getContext:()=>has2D?mock2D:null};
 const image={...node,complete:true,naturalWidth:1280};
 const stage={...node,clientWidth:390,clientHeight:844,removeAttribute(){}};
 const detail={...node,inert:false};
 const parts={'.ho-stage':stage,'.ho-canvas':canvas,'.ho-scene-canvas':backing,'.ho-cover-link':node,'.ho-media img':image,'.ho-copy':node,'.ho-continuation':detail,'.ho-skip':{...node},'.ho-replay':{...node}};
 const root={offsetHeight:1274,getBoundingClientRect:()=>({top:0}),dataset:{},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},querySelector:s=>parts[s],querySelectorAll:()=>[],addEventListener(){}};
 const document={documentElement:{dataset:{}},querySelector:()=>root,addEventListener(){}};
 const window={AG_HERO_DIRECTION:M,innerHeight:short?600:844,scrollY:0,matchMedia:()=>({matches:reduce,addEventListener(){}}),addEventListener(){},requestAnimationFrame(){frames++;return 1;},cancelAnimationFrame(){}};
 class MutationObserver{observe(){}disconnect(){}}
 vm.runInNewContext(source,{window,document,navigator:{connection:{saveData}},getComputedStyle:()=>({fontSize:large?'32px':'16px'}),MutationObserver,console:{warn(){}}});
 return{root,classes,detail,contexts,frames,get draws(){return draws;},listeners};
}
test('hero opt-outs, missing GPU and shader failure leave readable static content without a frame loop',()=>{
 new vm.Script(source);
 for(const flags of [{reduce:true},{saveData:true},{large:true},{short:true},{noGL:true},{shaderFails:true}]){
  const f=fixture(flags);assert.equal(f.root.dataset.heroMode,'static');assert.equal(f.classes.has('ho-live'),false);assert.equal(f.detail.inert,false);assert.equal(f.frames,0);
  assert.equal(f.contexts,flags.noGL||flags.shaderFails?1:0);
 }
});
test('missing WebGL and failed shaders switch to the second renderer when Canvas 2D is available',()=>{
 for(const flags of [{noGL:true},{shaderFails:true}]){
  const f=fixture({...flags,has2D:true});
  assert.equal(f.root.dataset.heroMode,'perspective');
  assert.equal(f.classes.has('ho-live'),true);
  assert.equal(f.classes.has('ho-perspective'),true);
  assert.equal(f.draws,1);
  assert.equal(f.frames,1);
 }
});
test('a context loss changes renderer without resetting the current scene sample',()=>{
 const f=fixture({hasGL:true,has2D:true});
 assert.equal(f.root.dataset.heroMode,'webgl');
 const seconds=f.root.dataset.heroSeconds,progress=f.root.dataset.heroProgress;
 let prevented=false;
 f.listeners.webglcontextlost({preventDefault(){prevented=true;}});
 assert.equal(prevented,true);
 assert.equal(f.root.dataset.heroMode,'perspective');
 assert.equal(f.root.dataset.heroSeconds,seconds);
 assert.equal(f.root.dataset.heroProgress,progress);
 assert.equal(f.draws,1);
});
test('hero study is isolated, index is untouched and the static page contains real links and media',()=>{
 const main=fs.readFileSync(require.resolve('../index.html'));
 assert.equal(crypto.createHash('sha256').update(main).digest('hex'),'79686e415eabfbc5dd597cfabf59dedb48d40a131197e51edd2383ecf6504df0');
 const html=fs.readFileSync(require.resolve('../hero-opening-v1.html'),'utf8');
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/href="https:\/\/youtu.be\/6MxLFTRudaQ"/);
 assert.match(html,/href="machiavelli.html"/);
 assert.match(html,/src="machiavelli-prens-7-gun-kapak.jpg" width="1280" height="720"/);
 assert.doesNotMatch(html,/hp-letter|hp-floor|KARARA\./);
});
