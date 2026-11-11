/* Build isolated review assets. Never execute with the product checkout as output. */
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'../..');
const out=path.resolve(process.argv[2]||'/workspace/scratch/934bf1c88e00/control-review-build');
if(out===root||out.startsWith(root+path.sep))throw Error('Review output must be outside product checkout');
fs.mkdirSync(path.join(out,'dist'),{recursive:true});const dir=path.join(out,'dist');
const write=(f,v)=>fs.writeFileSync(path.join(dir,f),v),allowed=fs.readFileSync(path.join(root,'.assetsignore'),'utf8').split('\n').filter(s=>s.startsWith('!/')).map(s=>s.slice(2));
for(const f of allowed)write(f,fs.readFileSync(path.join(root,f)));
const primary=fs.readFileSync(path.join(root,'kontrol-bende-mi.html'),'utf8');
write('control-alternative.html',primary.replace('data-control-composition="editorial"','data-control-composition="cinematic"').replace('<head>','<head><meta name="robots" content="noindex,nofollow">'));
for(const f of ['kontrol-bende-mi.html','control-alternative.html','rehberler.html'])write(f,fs.readFileSync(path.join(dir,f),'utf8').replace('<head>','<head><script src="control-prelude.js"></script>'));
for(const f of ['qa.html','qa.js','prelude.js'])write('control-'+f,fs.readFileSync(path.join(__dirname,f)));
for(const n of ['A','C'])write('thumbnail-'+n+'.png',fs.readFileSync(path.join(root,'docs/control-v1-2026-11-12/thumbnail-'+n+'.png')));
const extras=['control-alternative.html','control-qa.html','control-qa.js','control-prelude.js','thumbnail-A.png','thumbnail-C.png'];
write('.assetsignore',['*',...allowed.concat(extras).map(f=>'!/'+f),''].join('\n'));
write('_headers',fs.readFileSync(path.join(root,'_headers'))+'\n/*\n  X-Robots-Tag: noindex, nofollow\n');
write('wrangler.jsonc',JSON.stringify({name:'ali-gazal-site',compatibility_date:'2026-09-21',build:{command:'node --check control-qa.js && node --check control-scene.js'},assets:{directory:'./',html_handling:'auto-trailing-slash',not_found_handling:'404-page'}},null,2));
fs.mkdirSync(path.join(out,'.openai'),{recursive:true});fs.writeFileSync(path.join(out,'.openai/hosting.json'),JSON.stringify({static:{directory:'dist'}}));
console.log(JSON.stringify({out,assets:allowed.length+extras.length,productionManifestUnchanged:true}));
