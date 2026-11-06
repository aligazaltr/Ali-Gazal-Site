/* Isolated visual comparison output; never a product publishing command. */
const fs=require('node:fs'),path=require('node:path');
const {build}=require('../v5-qa/build');
const destination=process.argv[2]||'/tmp/ag-v6-qa';
build(destination);
const additions=[];
for(const [src,target] of [['about-notebook.html','_v6-about-notebook.html'],['projects-ledger.html','_v6-projects-ledger.html'],['alternatives.css','_v6-alternatives.css']]){
 let content=fs.readFileSync(path.join(__dirname,'variants',src),'utf8');
 if(target.endsWith('.html'))content=content.replace('<head>','<head><script src="/_launch-prelude.js"></script><meta name="robots" content="noindex,nofollow">');
 fs.writeFileSync(path.join(destination,target),content);additions.push(target);
}
fs.appendFileSync(path.join(destination,'.assetsignore'),additions.map(f=>'!/'+f).join('\n')+'\n');
const index=path.join(destination,'_launch-qa.html');
fs.writeFileSync(index,fs.readFileSync(index,'utf8').replace('</select></label><label>Genişlik','<option value="_v6-about-notebook.html">B · Hakkımda çalışma defteri</option><option value="_v6-projects-ledger.html">B · Proje çizelgesi</option></select></label><label>Genişlik'));
const js=path.join(destination,'_launch-qa.js');
let source=fs.readFileSync(js,'utf8');
source=source.replace('disableAuditButtons(true);\nload().then',`const captureParams=new URLSearchParams(location.search);
for(const id of ['page','width','height','theme','variant'])if(captureParams.has(id))$(id).value=captureParams.get(id);
if(captureParams.has('capture'))document.body.classList.add('qa-capture');
disableAuditButtons(true);
load().then`);
fs.writeFileSync(js,source);
fs.appendFileSync(path.join(destination,'_launch-qa.css'),'\n.qa-capture header,.qa-capture #result{display:none}.qa-capture main{padding:0}.qa-capture iframe{margin-inline:auto}\n');
console.log('V6 comparison variants are QA-only; release .assetsignore is unchanged.');
