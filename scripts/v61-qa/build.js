/* Isolated real-browser fixtures. Never build into the release checkout. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {build}=require('../v5-qa/build');const root=path.resolve(__dirname,'../..');
const dir=path.resolve(process.argv[2]||'/tmp/ag-v61-qa');build(dir);
const base='0b3f0d02c240a8c19a0e3fbd232fcc0b90d066ab';
const git=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root});
const files=git('.assetsignore').toString().split('\n').filter(x=>x.startsWith('!/')).map(x=>x.slice(2));
for(const f of files){const b=git(f);fs.writeFileSync(path.join(dir,'baseline',f),f.endsWith('.html')?b.toString().replace('<head>','<head><script src="/_launch-prelude.js"></script>'):b);}
fs.appendFileSync(path.join(dir,'.assetsignore'),files.map(f=>'!/baseline/'+f).join('\n')+'\n');
for(const [s,t] of [['index.html','_v61-qa.html'],['qa.js','_v61-qa.js'],['qa.css','_v61-qa.css']])fs.copyFileSync(path.join(__dirname,s),path.join(dir,t));
fs.copyFileSync(path.join(root,'docs/cinematic-v6-1-2026-11-07/evidence/image-registration.json'),path.join(dir,'_v61-landmarks.json'));
fs.appendFileSync(path.join(dir,'_launch-prelude.js'),`\n// Explicit capability simulations; not physical old-browser measurements.\ntry{const o=parent.__launchOptions;if(o?.noObserver)window.IntersectionObserver=undefined;if(o?.noSticky){const supports=CSS.supports.bind(CSS);CSS.supports=(p,v)=>p==='position'&&v==='sticky'?false:supports(p,v);}if(o?.largeText)document.documentElement.style.fontSize='200%';}catch(_){}\n`);
let html=fs.readFileSync(path.join(dir,'machiavelli.html'),'utf8');
const portrait=html.match(/<div class="mc-portrait"[\s\S]*?<\/div>/)?.[0]||html.match(/<figure class="mc-portrait"[\s\S]*?<\/figure>/)?.[0];
if(!portrait)throw Error('portrait fixture marker missing');
const late=portrait.replace(/\bsrc="([^"]+)"/,'data-delayed-src="$1" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="').replace(/\bsrcset="([^"]+)"/,'data-delayed-srcset="$1"');
fs.writeFileSync(path.join(dir,'_v61-late.html'),html.replace(portrait,late));
const missing=portrait.replace(/\bsrc="[^"]+"/,'src="/_v61-missing-image.webp"').replace(/\bsrcset="[^"]+"/,'');
fs.writeFileSync(path.join(dir,'_v61-error.html'),html.replace(portrait,missing));
fs.appendFileSync(path.join(dir,'.assetsignore'),'!/_v61-qa.html\n!/_v61-qa.js\n!/_v61-qa.css\n!/_v61-landmarks.json\n!/_v61-late.html\n!/_v61-error.html\n');
console.log('V6.1 QA baseline '+base+'; all fixtures excluded from clean release.');
