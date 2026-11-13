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
 for(const [p,h] of Object.entries(expected.files)){
  let bytes=fs.readFileSync(p);
  // Project 03 adds only its generated entrance/dependencies; preserve the original research verbatim.
  if(p==='irade-terbiyesi.html')bytes=Buffer.from(bytes.toString().replace(/    <!-- experience:payot-scene:start -->[\s\S]*?<!-- experience:payot-scene:end -->\n/,'').replace(/^  <script src="payot-(?:frames|scene)\.js" defer><\/script>\n/gm,'').replace(/^  <link rel="stylesheet" href="payot-scene\.css">\n/gm,'').replace('class="research-opening" id="payot-arastirma"','class="research-opening"').replace('<h2 data-reveal="title" data-project-field="title">İrade gerçekten eğitilebilir mi?</h2>','<h1 data-reveal="title" data-project-field="title">İrade gerçekten eğitilebilir mi?</h1>'));
  if(p==='.assetsignore')bytes=Buffer.from(bytes.toString().replace(/^!\/payot-(?:frames\.js|scene\.js|scene\.css)\n/gm,''));
  assert.equal(hash(bytes),h,p);
 }
});
test('static scene is complete, semantic and does not invent a video',()=>{
 const s=renderControlScene(data.projects['kontrol-bende-mi']);assert.equal((s.match(/<h1/g)||[]).length,1);assert.match(s,/BENDE <em>Mİ\?/);assert.match(s,/href="#deney"/);assert.doesNotMatch(s,/<img|<video|<iframe|youtube|oynat/i);
});
const approved=require('./portal-review/approved-v2-frames');
test('V2.2 preserves approved camera, numeral and question motion at every progress sample',()=>{
 const fields=['progress','matrix','cx','cy','scale','coverScale','foreground','measure','question','questionWidth','questionX','questionY','questionScale','lineShift','frame','final'];
 for(const width of [360,390,430,1024,1440])for(let i=0;i<=200;i++){
  const g={width,height:788,bounds:glyph.bounds,center:glyph.center,radius:97},before=approved.sample(i/200,g),after=F.sample(i/200,g);
  for(const key of fields)assert.deepEqual(after[key],before[key],`width ${width} p ${i/200} ${key}`);
 }
});
test('viewport-baked contours retain every original control point without scale textures',()=>{
 for(const width of [360,390,430,1024,1440])for(const p of [0,.1,.18,.22,.3,.38,.43,.7,1]){
  const g={width,height:788,bounds:glyph.bounds,center:glyph.center,radius:97},m=F.sample(p,g).matrix;
  for(const d of [...glyph.paths,glyph.counter]){
   const commands=F.parsePath(d),baked=F.parsePath(F.transformPath(commands,m));assert.equal(commands.length,baked.length);
   commands.forEach((c,j)=>{assert.equal(c[0],baked[j][0]);for(let i=1;i<c.length;i++)assert.ok(Math.abs(baked[j][i]-(c[i]*m[0]+m[i%2?4:5]))<=.000051);});
  }
 }
});
test('new scene removes alpha-mask, rectangular tunnel, markers and unwanted caption at source',()=>{
 const s=renderControlScene(data.projects['kontrol-bende-mi']);
 assert.match(s,/<clipPath id="control-aperture" clipPathUnits="userSpaceOnUse">/);
 assert.doesNotMatch(s,/<mask\b|portal-(?:gate|rays|horizon|rails|veil)|<small|Zamanın görsel|Sonuç veya başarı göstergesi/);
 assert.match(s,/class="portal-depth-field"/);assert.match(s,/href="#deney"/);
 const css=fs.readFileSync('control-scene.css','utf8');assert.doesNotMatch(css,/portal-(?:gate|rays|horizon|rails|veil)|portal-foot small/);assert.doesNotMatch(css,/body\[data-project="kontrol-bende-mi"\]\{background:/);assert.match(css,/\.portal-stage\{[^}]*background:transparent/);
 const lettering=css.match(/\.portal-overline>span,\.portal-foot a\{([^}]+)\}/)[1];assert.doesNotMatch(lettering,/background/);assert.match(lettering,/text-shadow/);
});

test('spatial depth remains visible, finite and reversible without closed frame edges',()=>{
 const s=renderControlScene(data.projects['kontrol-bende-mi']);
 assert.equal((s.match(/class="portal-fold"/g)||[]).length,3);
 for(const width of [360,390,430,1024,1440]){
  const g={width,height:788,bounds:glyph.bounds,center:glyph.center,radius:97};
  for(const p of [.2,.3,.4,.5,.6,.7,1]){
   const a=F.sample(p,g);assert.equal(a.folds.length,3);
   for(const f of a.folds){assert.ok(f.z>0);assert.doesNotMatch(f.path,/NaN|Infinity/);assert.match(f.path,/Z$/);assert.doesNotMatch(f.edge,/Z/);assert.equal((f.edge.match(/L/g)||[]).length,2);}
   F.sample(1-p,g);assert.deepEqual(F.sample(p,g).folds,a.folds);
  }
  const paths=p=>F.sample(p,g).folds.map(f=>f.path);assert.notDeepEqual(paths(.4),paths(.5));assert.notDeepEqual(paths(.5),paths(.6));
 }
});
