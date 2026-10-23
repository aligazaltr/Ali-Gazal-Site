const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const frames = require('../machiavelli-frames');
const data = require('../site-data');
const {renderMachiavelliScene} = require('./render-machiavelli-scene');
const geometry = {height:740,mobile:false,portraitWidth:460,portraitHeight:546,portraitLeft:600,portraitTop:74,filmWidth:760,filmLeft:200,filmTop:111};
test('portrait travels to the cover face anchor while the real cover opens from the right', () => {
  for (const mobile of [false,true]) {
    const g = mobile ? {...geometry,mobile,portraitWidth:294,portraitHeight:349,portraitLeft:57,portraitTop:143,filmWidth:358,filmLeft:0,filmTop:172} : geometry;
    const a=frames.sample(0,g),b=frames.sample(.32,g),c=frames.sample(.68,g),d=frames.sample(1,g);
    assert.ok(b.portraitScale>a.portraitScale); assert.notEqual(a.portraitX,b.portraitX);
    assert.equal(c.filmClip,38); assert.equal(d.filmClip,0); assert.equal(d.portraitOpacity,0); assert.equal(d.outcomeOpacity,1);
    const faceX=g.portraitLeft+g.portraitWidth*(.5-.03*c.portraitScale)+c.portraitX;
    assert.ok(Math.abs(faceX-(g.filmLeft+g.filmWidth*.76))<.01);
  }
});
test('scroll sampling is finite, reversible, clamped and continuous at storyboard boundaries', () => {
  assert.deepEqual(frames.sample(-1,geometry),frames.sample(0,geometry));
  assert.deepEqual(frames.sample(2,geometry),frames.sample(1,geometry));
  for (const p of [0,.32,.68,.94,1]) {
    const values=frames.sample(p,geometry); assert.ok(Object.values(values).every(Number.isFinite));
    const before=frames.sample(p-.00001,geometry),after=frames.sample(p+.00001,geometry);
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
function fixture(reduce=false, height=740) {
  const listeners={},queue=new Map(),classes=new Set(),props={},imageListeners={};let id=0;
  const style={setProperty:(k,v)=>props[k]=v,removeProperty:k=>delete props[k]};
  const image={complete:true,naturalWidth:960,addEventListener:(k,v)=>imageListeners[k]=v};
  const portrait={offsetWidth:460,offsetHeight:546,offsetLeft:600,offsetTop:74,querySelector:()=>image};
  const film={offsetWidth:760,offsetTop:111};const stage={clientHeight:height-24,clientWidth:1152,style,removeAttribute:()=>Object.keys(props).forEach(k=>delete props[k])};
  const scene={style,dataset:{},classList:{add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n))},getBoundingClientRect:()=>({top:200-window.scrollY}),querySelector:s=>({'.mc-stage':stage,'.mc-portrait':portrait,'.mc-film':film})[s]};
  const preference={matches:reduce,addEventListener:(_,f)=>listeners.preference=f};
  let observed; class Observer{constructor(f){observed=f;}observe(){}}
  const requestAnimationFrame=f=>{queue.set(++id,f);return id;},cancelAnimationFrame=i=>queue.delete(i);
  const document={hidden:false,querySelector:()=>scene,addEventListener:(n,f)=>listeners[n]=f};
  const window={innerHeight:height,scrollY:0,IntersectionObserver:Observer,requestAnimationFrame,matchMedia:q=>q.includes('reduced')?preference:{matches:false},addEventListener:(n,f)=>listeners[n]=f};
  vm.runInNewContext(fs.readFileSync(require.resolve('../machiavelli-scene'),'utf8'),{window:{...window,AG_MACHIAVELLI_FRAMES:frames},document,IntersectionObserver:Observer,requestAnimationFrame,cancelAnimationFrame});
  return {listeners,queue,classes,props,preference,scene,imageListeners,document,observe:observed};
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
