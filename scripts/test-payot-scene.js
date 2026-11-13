const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const F=require('../payot-frames'),{renderPayotScene}=require('./render-payot-scene'),data=require('../site-data');
for(const width of [390,768,1440])test(`Payot ${width}px: reversible binding targets the actual cover word, finite through all five scenes`,()=>{
 const bw=Math.min(width*.58,width<680?224:292),g={width,height:788,bookWidth:bw,largeSize:Math.min(width*.19,190),smallSize:bw*.146,large:[-140,-70,0,70,140],small:[-28,-14,0,14,28]};
 for(let i=0;i<=200;i++){const p=i/200,a=F.sample(p,g);F.sample(1-p,g);assert.deepEqual(F.sample(p,g),a);assert.doesNotMatch(JSON.stringify(a),/null|NaN|Infinity/);for(const item of [...a.words,...a.letters,...a.leaves])assert.ok(item.opacity>=0&&item.opacity<=1);}
 const center=F.sample(.38,g);assert.equal(center.bind,0);assert.ok(center.letters.every(x=>x.opacity===1));
 const end=F.sample(1,g);assert.equal(end.book.opacity,1);assert.equal(end.question,1);assert.ok(end.ticks.every(x=>x===1));
 end.letters.forEach((x,i)=>{assert.equal(x.x,end.book.x+g.small[i]);assert.equal(x.y,end.book.y-end.book.height*.5+end.book.height*.39);assert.ok(Math.abs(x.scale-g.smallSize/g.largeSize)<1e-12);});
 for(const p of [.06,.23,.29,.36,.4,.53,.67,.69,.79,.91,.95]){const a=F.sample(p-1e-7,g),b=F.sample(p+1e-7,g);assert.ok(Math.abs(a.book.x-b.book.x)<.01);assert.ok(Math.abs(a.letters[0].y-b.letters[0].y)<.01);}
});
test('Payot renderer preserves truthful planned state, semantic final and source-owned entrance',()=>{
 const s=renderPayotScene(data.projects['irade-terbiyesi']);assert.equal((s.match(/<h1/g)||[]).length,1);assert.match(s,/7 GÜN · PLANLANAN UYGULAMA/);assert.match(s,/Deney henüz başlamadı/);assert.match(s,/href="#payot-arastirma"/);assert.equal((s.match(/<i><span>/g)||[]).length,7);assert.doesNotMatch(s,/<img|<video|<iframe|youtube|yayınevi|yüzde|başarı oranı/i);
 const html=fs.readFileSync('irade-terbiyesi.html','utf8');assert.match(html,/<!-- experience:payot-scene:start -->/);assert.equal((html.match(/<h1\b/g)||[]).length,1);
 const js=fs.readFileSync('payot-scene.js','utf8');assert.match(js,/pref\.matches/);assert.match(js,/fallback\(\)/);assert.match(js,/getBoundingClientRect/);assert.doesNotMatch(js,/setInterval|setTimeout|preventDefault|wheel/);
});
