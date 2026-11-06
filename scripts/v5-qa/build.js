/* Build an isolated audit output; never run this against the project root. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {renderHtml}=require('../sync-site.js');
const {releaseFixture}=require('../release-fixture.js');
const root=path.resolve(__dirname,'../..');
const base='1701231db40ab44bb125917dd4617018a5ebc899';
const git=file=>cp.execFileSync('git',['show',base+':'+file],{cwd:root});
const releaseFiles=s=>s.split('\n').filter(s=>s.startsWith('!/')).map(s=>s.slice(2));
const instrument=s=>s.replace('<head>','<head>\n  <script src="/_launch-prelude.js"></script>');
function build(destination){
 const dir=path.resolve(destination);
 if(dir===root||dir.startsWith(root+path.sep))throw Error('QA output must stay outside the product checkout');
 fs.mkdirSync(dir,{recursive:true});
 const allowed=[];
 function write(file,bytes){const target=path.join(dir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);allowed.push(file);}
 for(const file of releaseFiles(fs.readFileSync(path.join(root,'.assetsignore'),'utf8'))){
  const bytes=fs.readFileSync(path.join(root,file));
  let output=file.endsWith('.html')?instrument(bytes.toString()):bytes;
  if(file==='machiavelli-scene.js')output=bytes.toString().replace('function fallback() {','function fallback() { scene.dataset.qaFallback=JSON.stringify({height:innerHeight,reduced:reduced.matches,complete:image.complete,naturalWidth:image.naturalWidth,portraitWidth:portrait.offsetWidth,filmWidth:film.offsetWidth});');
  write(file,output);
 }
 for(const file of releaseFiles(git('.assetsignore').toString())){
  const bytes=git(file);
  write('baseline/'+file,file.endsWith('.html')?instrument(bytes.toString()):bytes);
 }
 for(const [source,target] of [['index.html','_launch-qa.html'],['qa.js','_launch-qa.js'],['qa.css','_launch-qa.css'],['prelude.js','_launch-prelude.js']])write(target,fs.readFileSync(path.join(__dirname,source)));
 const fixture=releaseFixture();
 write('_v5-released-data.js','/* TEST ONLY: never merge or deploy as production site-data. */\nwindow.AG_SITE_DATA='+JSON.stringify(fixture)+';\n');
 for(const [source,target] of [['machiavelli.html','_v5-published.html'],['index.html','_v5-published-home.html']]){
  let html=renderHtml(fs.readFileSync(path.join(root,source),'utf8'),fixture);
  html=instrument(html).replace('src="site-data.js"','src="_v5-released-data.js"').replace('<title','<meta name="robots" content="noindex,nofollow">\n  <title').replace(/(<body[^>]*>)/,'$1\n<p id="v5-fixture-note" role="note" style="padding:1rem;margin:0;background:#ff912f;color:#241207;font:700 14px/1.5 system-ui">TEST SENARYOSU · Gerçek video yayımlanmış değildir. Video bağlantısı bu testte yakalanır; YouTube’a gidilmez.</p>');
  write(target,html);
 }
 fs.writeFileSync(path.join(dir,'_headers'),fs.readFileSync(path.join(root,'_headers')));
 fs.writeFileSync(path.join(dir,'.assetsignore'),['# QA ONLY — never merge this manifest.','*','!/baseline/',...allowed.map(p=>'!/'+p),''].join('\n'));
 fs.writeFileSync(path.join(dir,'wrangler.jsonc'),JSON.stringify({name:'ali-gazal-site',compatibility_date:'2026-09-21',build:{command:'node --check _launch-qa.js && node --check _launch-prelude.js'},assets:{directory:'./',html_handling:'auto-trailing-slash',not_found_handling:'404-page'}},null,2)+'\n');
 console.log(JSON.stringify({destination:dir,baseline:base,assets:allowed.length,fixtureVideoPublishedInProduct:require('../../site-data.js').projects.machiavelli.video.published}));
 return allowed;
}
if(require.main===module)build(process.argv[2]||'/tmp/ag-v5-audit-output');
module.exports={build};
