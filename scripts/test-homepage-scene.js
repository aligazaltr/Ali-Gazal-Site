const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const F=require('../homepage-frames'),data=require('../site-data'),{renderHomepageScene}=require('./render-homepage-scene');
const {unpublishedFixture}=require('./release-fixture');

test('homepage camera is finite, reversible and continuous across the passage at six widths',()=>{
  for(const width of [320,360,390,430,768,1440]){
    const g={width,height:844,mobile:width<=1000};
    for(let i=0;i<=100;i++){
      const p=i/100,a=F.sample(p,g);F.sample(1-p,g);assert.deepEqual(F.sample(p,g),a);
      for(const v of Object.values(a))assert.ok(Number.isFinite(v));
    }
    for(const p of [.02,.04,.08,.18,.23,.30,.40,.56,.86,1]){
      const a=F.sample(p-1e-7,g),b=F.sample(p+1e-7,g);
      for(const k of Object.keys(a))assert.ok(Math.abs(a[k]-b[k])<.005,`${width} ${p} ${k}`);
    }
    assert.deepEqual(F.sample(-100,g),F.sample(0,g));assert.deepEqual(F.sample(100,g),F.sample(1,g));
    const end=F.sample(1,g);assert.equal(end.mediaRotateY,0);assert.equal(end.mediaRotateZ,0);assert.equal(end.destinationOpacity,1);
  }
});
test('homepage uses latest real release and falls back safely after withdrawal without mutating the registry',()=>{
  const fixture=structuredClone(data),before=JSON.stringify(fixture);
  const released=renderHomepageScene(fixture);assert.doesNotMatch(released,/hp-letter|hp-decision|hp-floor/);assert.match(released,/Son videoyu izle/);assert.match(released,/6MxLFTRudaQ/);
  assert.equal(JSON.stringify(fixture),before);
  const withdrawn=renderHomepageScene(unpublishedFixture());
  assert.doesNotMatch(withdrawn,/Son videoyu izle|href="https:\/\/(?:www\.)?(?:youtube|youtu\.be)|YAYIMLANMIŞ ÇALIŞMANIN/);
  assert.match(withdrawn,/href="machiavelli.html"/);assert.match(withdrawn,/PROJE KAPAĞI/);
  const other=structuredClone(fixture.projects.machiavelli);other.id='new-test';other.slug='new-test';other.publishedAt='2026-12-01';other.video.url='https://youtu.be/TESTFIXTURE';other.video.title='<script>unsafe</script> & title';fixture.projects['new-test']=other;
  const newer=renderHomepageScene(fixture);assert.match(newer,/data-project="new-test"/);assert.match(newer,/TESTFIXTURE/);assert.doesNotMatch(newer,/<script>unsafe/);assert.match(newer,/&lt;script&gt;unsafe/);
});
test('the original homepage body below the hero is byte-identical and no project registry is modified',()=>{
  const protected=require('./homepage-review/protected.json'),crypto=require('node:crypto');
  const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
  const current=fs.readFileSync('index.html','utf8'),anchor='<section id="fikirden-deneye"';
  assert.equal(hash(current.slice(current.indexOf(anchor))),protected.homepageAfterHero);
  for(const [file,want] of Object.entries(protected.files))assert.equal(hash(fs.readFileSync(file)),want,file);
});

function fixture({reduce=false,broken=false,large=false}={}){
  const listeners={},mql={},writes={},classes=new Set(),queue=new Map();let id=0,cancels=0;
  const style={setProperty:(k,v)=>writes[k]=v,removeProperty:k=>delete writes[k]};
  const stage={style,offsetHeight:844,clientHeight:844,clientWidth:390,removeAttribute:()=>Object.keys(writes).forEach(k=>delete writes[k])};
  const opening={style:{removeProperty(){}}},destination={style:{removeProperty(){}},inert:false};const image={complete:true,naturalWidth:broken?0:1280,addEventListener(){}};
  const scene={style,dataset:{},offsetHeight:1694,classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k)},getBoundingClientRect:()=>({top:100-window.scrollY}),querySelector:s=>({'.hp-stage':stage,'.hp-media img':image,'.hp-opening':opening,'.hp-destination':destination,'.hp-intro-light':{animate:()=>({cancel(){cancels++;},finished:new Promise(()=>{})})}}[s]),addEventListener:(k,f)=>listeners['scene:'+k]=f};
  const document={hidden:false,documentElement:{},querySelector:()=>scene,addEventListener:(k,f)=>listeners[k]=f};
  const window={AG_HOMEPAGE_FRAMES:F,scrollY:100,innerHeight:844,matchMedia:q=>mql[q]||(mql[q]={matches:q.includes('reduce')?reduce:q.includes('1000'),addEventListener:(k,f)=>listeners[q]=f}),requestAnimationFrame:f=>{queue.set(++id,f);return id;},cancelAnimationFrame:n=>queue.delete(n),addEventListener:(k,f)=>listeners[k]=f};
  vm.runInNewContext(fs.readFileSync('homepage-scene.js','utf8'),{window,document,getComputedStyle:()=>({fontSize:large?'32px':'16px'})});
  return{window,document,scene,stage,destination,writes,classes,listeners,queue,flush(){for(const [k,f]of [...queue]){queue.delete(k);f();}}};
}
test('reduced motion, failed media and large reader text keep the complete static document',()=>{
  for(const flags of [{reduce:true},{broken:true},{large:true}]){const f=fixture(flags);assert.equal(f.scene.dataset.homepageMode,'static');assert.equal(f.classes.has('hp-enabled'),false);assert.equal(f.destination.inert,false);assert.equal(f.queue.size,0);}
});
test('homepage controller schedules one frame, reverses scroll, and cancels work when backgrounded',()=>{
  const f=fixture();assert.equal(f.scene.dataset.homepageMode,'spatial');assert.equal(f.destination.inert,true);
  for(let i=0;i<15;i++)f.listeners.scroll();assert.equal(f.queue.size,1);
  f.window.scrollY=525;f.flush();assert.equal(f.writes['--hp-progress'],'0.5000');assert.equal(f.destination.inert,false);
  f.window.scrollY=100;f.listeners.scroll();f.flush();assert.equal(f.writes['--hp-progress'],'0.0000');
  f.listeners.scroll();f.document.hidden=true;f.listeners.visibilitychange();assert.equal(f.queue.size,0);
  f.document.hidden=false;f.listeners.visibilitychange();assert.equal(f.writes['--hp-progress'],'0.0000');
});
