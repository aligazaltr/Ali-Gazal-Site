const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const frames = require('../machiavelli-frames');
const data = require('../site-data');
const {renderMachiavelliScene} = require('./render-machiavelli-scene');
const geometry = {height:740,mobile:false,portraitWidth:460,portraitHeight:546,portraitLeft:600,portraitTop:74,filmWidth:760,filmLeft:200,filmTop:111};
test('portrait and cover share the registered image coordinate system throughout the fade',()=>{
  const {registration:m}=frames;
  for(const mobile of [false,true]) {
    const g=mobile?{...geometry,mobile,portraitWidth:294.375,portraitHeight:349.57,portraitLeft:57.3,portraitTop:143.2,filmWidth:358.75,filmLeft:0,filmTop:172.15}:geometry;
    const r=g.portraitWidth/960,k=g.filmWidth/1280,ox=g.portraitWidth*.5,oy=g.portraitHeight*.3;
    for(const p of [.4,.55,.65,.75,.78,.85,.95,1]) {
      const s=frames.sample(p,g),pa=s.portraitRotate*Math.PI/180,fa=s.filmRotate*Math.PI/180;
      for(const [x,y] of [[250,420],[440,390],[600,700]]) {
        const px=g.portraitLeft+ox+s.portraitX+Math.cos(pa)*s.portraitScale*(x*r-ox)-Math.sin(pa)*s.portraitScale*(y*r-oy);
        const py=g.portraitTop+oy+s.portraitY+Math.sin(pa)*s.portraitScale*(x*r-ox)+Math.cos(pa)*s.portraitScale*(y*r-oy);
        const cx=(m.a*x-m.b*y+m.x)*k,cy=(m.b*x+m.a*y+m.y)*k;
        const fx=g.filmLeft+g.filmWidth/2+s.filmX+Math.cos(fa)*s.filmScale*cx-Math.sin(fa)*s.filmScale*cy;
        const fy=g.filmTop+s.filmY+Math.sin(fa)*s.filmScale*cx+Math.cos(fa)*s.filmScale*cy;
        assert.ok(Math.hypot(px-fx,py-fy)<.001,'shared landmarks at '+p);
      }
      if(p>=.78){assert.ok(Math.abs(s.filmScale-1)<.00001);assert.ok(Math.abs(s.filmX+g.filmWidth/2)<.00001);assert.ok(Math.abs(s.filmY)<.00001);}
    }
    const final=frames.sample(1,g);assert.equal(final.filmOpacity,1);assert.equal(final.portraitOpacity,0);assert.equal(final.outcomeOpacity,1);assert.equal(final.titleOpacity,0);
  }
});
test('scroll sampling is finite, reversible, clamped and continuous at storyboard boundaries', () => {
  assert.deepEqual(frames.sample(-1,geometry),frames.sample(0,geometry));
  assert.deepEqual(frames.sample(2,geometry),frames.sample(1,geometry));
  for (const p of [0,.32,.48,.76,.78,.84,.94,1]) {
    const values=frames.sample(p,geometry); assert.ok(Object.values(values).every(Number.isFinite));
    const before=frames.sample(p-.000001,geometry),after=frames.sample(p+.000001,geometry);
    for(const key of Object.keys(values)) assert.ok(Math.abs(before[key]-after[key])<.01,key);
  }
  const middle=frames.sample(.52,geometry);frames.sample(.9,geometry);assert.deepEqual(frames.sample(.52,geometry),middle);
});
test('static composition contains the real cover, current status and a working research jump without fabricated video links', () => {
  const html=renderMachiavelliScene(data.projects.machiavelli);
  for(const value of ['MACHIAVELLI','PRENS',data.projects.machiavelli.video.thumbnail.src,data.projects.machiavelli.statusLabel,data.projects.machiavelli.dates.label,'href="#deney-asamasi"']) assert.ok(html.includes(value));
  assert.ok(!html.includes('youtube.com'));assert.ok(!/\shidden[\s>]/.test(html));
  assert.ok(html.includes('width="960" height="1140"'));assert.ok(html.includes('srcset='));
});
test('archive contains no page sweep or paper overlay and retains text, author and source entrances', () => {
  const js=fs.readFileSync(require.resolve('../archive.js'),'utf8'),css=fs.readFileSync(require.resolve('../archive.css'),'utf8');
  for(const name of ['discovery-turn','discovery-leaf','skewX']) assert.ok(!(js+css).includes(name));
  for(const name of ['.discovery-text','.discovery-author','.discovery-source'])assert.ok(js.includes(name));
});
function fixture(reduce=false, height=740, naturalWidth=960, fontSize=16, capabilities={}, imageDecode) {
  const listeners={},queue=new Map(),classes=new Set(),props={},imageListeners={};let id=0;
  const style={setProperty:(k,v)=>props[k]=v,removeProperty:k=>delete props[k]};
  const image={complete:true,naturalWidth,addEventListener:(k,v)=>imageListeners[k]=v};
  if(imageDecode)image.decode=imageDecode;
  const portrait={offsetWidth:460,offsetHeight:546,offsetLeft:600,offsetTop:74,querySelector:()=>image};
  const film={offsetWidth:760,offsetTop:111};const stage={clientHeight:height-24,clientWidth:1152,style,removeAttribute:()=>Object.keys(props).forEach(k=>delete props[k])};
  const scene={style,dataset:{},classList:{add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n))},getBoundingClientRect:()=>({top:200-window.scrollY}),querySelector:s=>({'.mc-stage':stage,'.mc-portrait':portrait,'.mc-film':film})[s]};
  const preference={matches:reduce,addEventListener:(_,f)=>listeners.preference=f};
  let observed; class Observer{constructor(f){observed=f;}observe(){}}
  const requestAnimationFrame=f=>{queue.set(++id,f);return id;},cancelAnimationFrame=i=>queue.delete(i);
  const document={hidden:false,querySelector:()=>scene,addEventListener:(n,f)=>listeners[n]=f};
  const window={CSS:{supports:()=>true},getComputedStyle:()=>({fontSize:String(fontSize)}),innerHeight:height,scrollY:0,IntersectionObserver:Observer,requestAnimationFrame,matchMedia:q=>q.includes('reduced')?preference:{matches:false},addEventListener:(n,f)=>listeners[n]=f};
  Object.assign(window,capabilities);
  vm.runInNewContext(fs.readFileSync(require.resolve('../machiavelli-scene'),'utf8'),{window:{...window,AG_MACHIAVELLI_FRAMES:frames},document,IntersectionObserver:Observer,requestAnimationFrame,cancelAnimationFrame});
  return {listeners,queue,classes,props,preference,scene,image,imageListeners,document,observe:observed};
}
test('scene controller keeps reduced motion and short windows in readable flow',()=>{
  for(const args of [[true,740],[false,390]]){const f=fixture(...args);assert.equal(f.classes.has('is-directed'),false);assert.equal(f.queue.size,0);}
});
test('scene controller schedules one visible frame and stops offscreen or in background',()=>{
  const f=fixture();assert.equal(f.classes.has('is-directed'),true);
  f.listeners.scroll();assert.equal(f.queue.size,0);
  f.observe([{isIntersecting:true}]);f.listeners.scroll();f.listeners.scroll();assert.equal(f.queue.size,1);
  f.observe([{isIntersecting:false}]);assert.equal(f.queue.size,0);
  f.observe([{isIntersecting:true}]);f.document.hidden=true;f.listeners.visibilitychange();assert.equal(f.queue.size,0);
  f.preference.matches=true;f.listeners.preference();assert.equal(f.classes.has('is-directed'),false);
});
test('an unavailable portrait restores the readable cover and research flow',()=>{
  const f=fixture();f.observe([{isIntersecting:true}]);assert.equal(f.queue.size,1);
  f.imageListeners.error();assert.equal(f.queue.size,0);assert.equal(f.classes.has('is-directed'),false);
  assert.equal(f.classes.has('is-scrolling'),false);assert.equal(f.scene.dataset.progress,undefined);
});

test('responsive image selection is not mistaken for a permanent image failure',()=>{
  const f=fixture(false,740,0);assert.equal(f.classes.has('is-directed'),true);
  f.imageListeners.error();assert.equal(f.classes.has('is-directed'),false);
  f.imageListeners.load();assert.equal(f.classes.has('is-directed'),true);
  f.imageListeners.error();assert.equal(f.classes.has('is-directed'),false);
  f.imageListeners.load();assert.equal(f.classes.has('is-directed'),true);
});

test('large reader text keeps the scene in normal readable flow',()=>{
  const f=fixture(false,740,960,32);assert.equal(f.classes.has('is-directed'),false);assert.equal(f.queue.size,0);
});

test('registration belongs to the unchanged approved image bytes',()=>{
 const hash=require('node:crypto').createHash;
 for(const [name,want] of [['machiavelli-portrait-960.webp','2c35b99687b86c42406cf6c8e5810ebe7d7193a6c7466496a9a1229c142225c5'],['machiavelli-prens-7-gun-kapak.jpg','4a0bfa2e1cdc2e2c2205f96f571ee12368f0afa71d99873b0061f99c03b3f8f7']])assert.equal(hash('sha256').update(fs.readFileSync(require('node:path').resolve(__dirname,'..',name))).digest('hex'),want);
});

test('missing browser capabilities leave the original readable document alone',()=>{
 for(const capabilities of [{IntersectionObserver:undefined},{requestAnimationFrame:undefined},{CSS:{supports:()=>false}}]){
  const f=fixture(false,740,960,16,capabilities);assert.equal(f.classes.has('is-directed'),false);assert.equal(f.queue.size,0);
 }
});

test('resize measurements coalesce before repaint',()=>{
 const f=fixture();f.listeners.resize();f.listeners.resize();assert.equal(f.queue.size,1);
 const cb=[...f.queue.values()][0];f.queue.clear();cb();assert.equal(f.classes.has('is-directed'),true);
});
test('a cached image failure before listener attachment still restores readable flow',async()=>{
 const f=fixture(false,740,0,16,{},()=>Promise.reject(Error('invalid image')));
 await new Promise(r=>setImmediate(r));for(const cb of f.queue.values())cb();
 assert.equal(f.classes.has('is-directed'),false);
 f.image.naturalWidth=960;f.imageListeners.load();assert.equal(f.classes.has('is-directed'),true);
});
