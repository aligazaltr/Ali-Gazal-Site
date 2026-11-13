const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const data=require('../site-data'),{renderHtml}=require('./sync-site'),{pages,renderSitemap}=require('./sync-seo'),frames=require('../control-frames');
const root=path.resolve(__dirname,'..'),page=fs.readFileSync(path.join(root,'kontrol-bende-mi.html'),'utf8');
const control=data.projects['kontrol-bende-mi'];
test('Project 02 is ongoing; dates do not turn a chosen horizon into an outcome',()=>{
 assert.equal(control.statusLabel,'Deney devam ediyor');assert.equal(control.completedAt,null);
 assert.equal((Date.parse(control.dates.plannedEnd)-Date.parse(control.dates.plannedStart))/864e5+1,60);
 assert.deepEqual(data.projectOrder,['machiavelli','kontrol-bende-mi','irade-terbiyesi']);
 const index=fs.readFileSync(path.join(root,'rehberler.html'),'utf8');assert.ok(index.indexOf('control-index-title')<index.indexOf('id="siradaki-proje"'));
 assert.match(index,/03<\/span><p>Sıradaki araştırma/);assert.match(index,/href="kontrol-bende-mi.html"/);
 for(const p of [control,data.projects['irade-terbiyesi']])assert.equal(p.video.published,false);
});
test('new project public schema is restricted and contains no diary/result/release data',()=>{
 assert.deepEqual(Object.keys(control.experiment).sort(),['method','milestones','purpose','state','states']);
 for(const m of control.experiment.milestones)assert.deepEqual(Object.keys(m).sort(),['id','label','note']);
 assert.deepEqual(control.evidence,{published:false,entries:[]});assert.deepEqual(control.result,{published:false,summary:'',limitations:[]});
 assert.equal(control.video.url,'');assert.equal(control.video.title,'');assert.equal(control.video.durationSeconds,null);assert.equal(control.publishedAt,null);assert.equal(control.video.thumbnail.src,'');
 assert.doesNotMatch(page,/role="progressbar"|<iframe|<video|href="https:\/\/(?:www\.)?youtube.com\/watch/);
 assert.equal(renderHtml(page),page);assert.match(page,/id="control-aperture"/);
});
test('controlled public result and future video use escaped HTML and existing HTTPS gate',()=>{
 const d=structuredClone(data),p=d.projects['kontrol-bende-mi'];p.video.published=true;p.video.url='https://www.youtube.com/watch?v=TESTFIXTURE';p.video.title='SENTETİK TEST <Başlık>';p.video.durationSeconds=100;p.publishedAt='2026-11-20';
 p.video.thumbnail={src:'machiavelli-prens-7-gun-kapak.jpg',alt:'SENTETİK TEST KAPAĞI',width:1280,height:720};
 p.result={published:true,summary:'SENTETİK TEST <Özet>',limitations:['SENTETİK SINIR']};
 const rendered=renderHtml(page,d);assert.match(rendered,/aria-label="YouTube’da izle: SENTETİK TEST &lt;Başlık&gt;/);assert.match(rendered,/SENTETİK TEST &lt;Özet&gt;/);assert.equal(renderHtml(rendered,d),rendered);
 p.video.url='';assert.throws(()=>renderHtml(page,d),/yayın için/);
});
test('project experiment states are explicit rather than a phase-completion sequence',()=>{
 const src=fs.readFileSync(path.join(root,'site-data.js'),'utf8');
 for(const state of ['preparing','testing','reviewing','production']){const box={module:{exports:{}}};vm.runInNewContext(src.replace('  // Publication copy',`  data.projects['kontrol-bende-mi'].experiment.state='${state}';\n  // Publication copy`),box);assert.equal(box.module.exports.projects['kontrol-bende-mi'].video.published,false);}
 const box={module:{exports:{}}};assert.throws(()=>vm.runInNewContext(src.replace('  // Publication copy',"  data.projects['kontrol-bende-mi'].experiment.state='published';\n  // Publication copy"),box),/verified video/);
});
test('camera is deterministic and reversible without stored phase state',()=>{
 const g={width:390,height:740,bounds:[57,20,1210.5,794.5],center:[934.2297,407.2622],radius:98};
 let prev=0;for(let i=0;i<=100;i++){const f=frames.sample(i/100,g);assert.ok(f.scale>=prev);assert.ok(f.question>=0&&f.question<=1);assert.ok(f.foreground>=0&&f.foreground<=1);assert.ok(f.matrix.every(Number.isFinite));prev=f.scale;}
 for(const p of [0,.2,.43,.5,.75,1]){const first=frames.sample(p,g);frames.sample(1,g);assert.deepEqual(frames.sample(p,g),first);}
 for(const v of [-3,NaN])assert.deepEqual(frames.sample(v,g),frames.sample(0,g));assert.deepEqual(frames.sample(5,g),frames.sample(1,g));
});
test('crawlable new page and only reviewed release assets',()=>{
 assert.equal(pages['kontrol-bende-mi.html'],'/kontrol-bende-mi');assert.match(renderSitemap(),/<loc>https:\/\/aligazal.com\/kontrol-bende-mi<\/loc>/);
 const manifest=fs.readFileSync(path.join(root,'.assetsignore'),'utf8');for(const n of ['kontrol-bende-mi.html','control-frames.js','control-scene.js','control-scene.css','kontrol-bende-mi-share.png'])assert.ok(manifest.includes('!/'+n));
 assert.doesNotMatch(manifest,/!\/.*(?:control-review|thumbnail-|control-alternative|control-qa)/);
 assert.equal((page.match(/<h1\b/g)||[]).length,1);assert.match(page,/<svg class="portal-canvas"[^>]*aria-hidden="true"/);
});
