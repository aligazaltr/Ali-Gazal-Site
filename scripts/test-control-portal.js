const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const F=require('../control-frames'),glyph=require('./portal-review/geometry.json');
const {renderControlScene}=require('./render-control-scene');
const data=require('../site-data');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const width of [320,360,390,430,768,1024,1440])test(`actual counter covers ${width}px before foreground removal, with continuous phase boundaries`,()=>{
 const g={width,height:740,bounds:glyph.bounds,center:glyph.center,radius:97};
 const f=F.sample(.43,g);assert.equal(f.foreground,1);
 // An inscribed circle of the actual path covers the entire viewport, a conservative bound.
 const r=f.scale*g.radius;for(const x of [0,width])for(const y of [0,g.height])assert.ok(Math.hypot(x-f.cx,y-f.cy)<r);
 assert.ok(Math.abs(f.matrix[0]*g.center[0]+f.matrix[4]-width/2)<1e-8);
 for(const p of [.10,.35,.43,.46,.64,.68,.84,.85]){
  const a=F.sample(p-1e-7,g),b=F.sample(p+1e-7,g);assert.ok(Math.abs(a.scale-b.scale)<.001);assert.ok(Math.abs(a.cx-b.cx)<.001);assert.ok(Math.abs(a.questionWidth-b.questionWidth)<.001);
 }
 const end=F.sample(1,g);assert.equal(end.foreground,0);assert.equal(end.question,1);assert.ok(Math.abs(end.frame.width/end.frame.height-16/9)<1e-10);assert.equal(end.frame.opacity,1);
});
test('dossier after entrance and protected project content are identical to rollback point',()=>{
 const s=fs.readFileSync('kontrol-bende-mi.html','utf8');
 const expected=require('./portal-review/protected-hashes.json');
 assert.equal(hash(s.slice(s.indexOf('<p class="control-caption"'))),expected.dossier);
 for(const [p,h] of Object.entries(expected.files))assert.equal(hash(fs.readFileSync(p)),h,p);
});
test('static scene is complete, semantic and does not invent a video',()=>{
 const s=renderControlScene(data.projects['kontrol-bende-mi']);assert.equal((s.match(/<h1/g)||[]).length,1);assert.match(s,/BENDE <em>Mİ\?/);assert.match(s,/href="#deney"/);assert.doesNotMatch(s,/<img|<video|<iframe|youtube|oynat/i);
});
