/* Public-only isolated browser lab; never add this expanded manifest to product. */
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.argv[2]||'/workspace/scratch/934bf1c88e00/portal-review-build');
if(out===root||out.startsWith(root+path.sep))throw Error('Review output must be outside product checkout');
const dir=path.join(out,'dist');fs.mkdirSync(dir,{recursive:true});const write=(p,v)=>{fs.mkdirSync(path.dirname(path.join(dir,p)),{recursive:true});fs.writeFileSync(path.join(dir,p),v);};
const allowed=fs.readFileSync(path.join(root,'.assetsignore'),'utf8').split('\n').filter(s=>s.startsWith('!/')).map(s=>s.slice(2));
for(const f of allowed){write(f,fs.readFileSync(path.join(root,f)));write('baseline/'+f,execFileSync('git',['show','9531e92ccecae87e3ae42a6f960447fa17f9efd7:'+f],{cwd:root,maxBuffer:20e6}));}
const head='<head><script src="portal-prelude.js"></script>';
const page=fs.readFileSync(path.join(root,'kontrol-bende-mi.html'),'utf8');write('kontrol-bende-mi.html',page.replace('<head>',head));
write('static-no-frames.html',page.replace('<head>',head).replace('  <script src="control-frames.js" defer></script>',''));
write('late-frames.html',page.replace('<head>',head).replace('  <script src="control-frames.js" defer></script>','').replace('  <script src="control-scene.js" defer></script>','  <script src="portal-late.js" defer></script>'));
write('baseline/portal-prelude.js',fs.readFileSync(path.join(__dirname,'prelude.js')));write('baseline/kontrol-bende-mi.html',fs.readFileSync(path.join(dir,'baseline/kontrol-bende-mi.html'),'utf8').replace('<head>',head));
for(const f of ['qa.html','qa.js','prelude.js'])write('portal-'+f,fs.readFileSync(path.join(__dirname,f)));
write('portal-late.js',"setTimeout(()=>{const a=document.createElement('script');a.src='control-frames.js';a.onload=()=>{const b=document.createElement('script');b.src='control-scene.js';document.head.append(b);};document.head.append(a);},1200);\n");
const extras=['portal-qa.html','portal-qa.js','portal-prelude.js','portal-late.js','static-no-frames.html','late-frames.html','baseline/portal-prelude.js',...allowed.map(x=>'baseline/'+x)];
write('.assetsignore',['*',...allowed.concat(extras).map(f=>'!/'+f),''].join('\n'));write('_headers',fs.readFileSync(path.join(root,'_headers'))+'\n/*\n  X-Robots-Tag: noindex, nofollow\n');
write('wrangler.jsonc',JSON.stringify({name:'ali-gazal-site',compatibility_date:'2026-09-21',build:{command:'node --check portal-qa.js && node --check control-scene.js && node --check control-frames.js'},assets:{directory:'./',html_handling:'auto-trailing-slash',not_found_handling:'404-page'}},null,2));
fs.mkdirSync(path.join(out,'.openai'),{recursive:true});fs.writeFileSync(path.join(out,'.openai/hosting.json'),JSON.stringify({static:{directory:'dist'}}));
console.log(JSON.stringify({out,assets:allowed.length+extras.length,productManifestUntouched:true}));
