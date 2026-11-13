const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const data = require('../site-data.js');
const { pages, renderMetadata, renderRobots, renderSitemap, changes } = require('./sync-seo.js');
const root = path.resolve(__dirname,'..');
test('verified production domain is consistent across crawlable outputs',()=>{
  assert.equal(data.canonicalOrigin,'https://aligazal.com');
  assert.deepEqual(changes(),[]);
  for (const [file,route] of Object.entries(pages)) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.ok(html.includes(`rel="canonical" href="${data.canonicalOrigin}${route}"`));
    assert.ok(html.includes(`property="og:url" content="${data.canonicalOrigin}${route}"`));
    assert.doesNotMatch(html,/ali-gazal-site\.aliicerikmedya\.workers\.dev/);
    assert.equal(renderMetadata(html,file),html);
  }
  assert.doesNotMatch(renderRobots()+renderSitemap(),/workers\.dev|undefined|null|marcus-aurelius|404/);
  assert.equal((renderSitemap().match(/<loc>/g)||[]).length,7);
});
test('metadata can migrate again without touching page bodies',()=>{
  const fixture=structuredClone(data);fixture.canonicalOrigin='https://next.example';
  for (const [file,route] of Object.entries(pages)) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    const rendered=renderMetadata(html,file,fixture);
    assert.ok(rendered.includes(`rel="canonical" href="https://next.example${route}"`));
    const body=value=>value.split('<body')[1].replace(/data-share-url href="[^"]+"/g,'data-share-url href="[canonical]"');
    assert.equal(body(rendered),body(html));
  }
});
test('home social preview and Machiavelli use the unchanged final cover',()=>{
  for (const file of ['index.html','machiavelli.html']) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    assert.ok(html.includes(`property="og:image" content="https://aligazal.com/${data.projects.machiavelli.video.thumbnail.src}"`) || html.includes(`content="https://aligazal.com/${data.projects.machiavelli.video.thumbnail.src}"`));
    assert.match(html,/name="twitter:card" content="summary_large_image"/);
  }
  assert.equal(data.projects.machiavelli.video.published,false);
  assert.equal(data.projects.machiavelli.video.url,'');
});
test('only JSON-LD can occur inline; no inline handlers or external active resources',()=>{
  for (const file of fs.readdirSync(root).filter(file=>file.endsWith('.html'))) {
    const html=fs.readFileSync(path.join(root,file),'utf8');
    for (const [,attributes,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (!/\bsrc=/.test(attributes)) {assert.match(attributes,/type="application\/ld\+json"/);JSON.parse(body);}
      else assert.doesNotMatch(attributes,/src="(?:https?:)?\/\//);
    }
    assert.doesNotMatch(html,/\son(?:click|load|error|submit)\s*=/i);
  }
});

test('release assets contain every HTML dependency and exclude undeclared files',()=>{
  const rules=fs.readFileSync(path.join(root,'.assetsignore'),'utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
  assert.equal(rules[0],'*');
  const allowed=new Set(rules.slice(1).map(rule=>{assert.match(rule,/^!\/[a-z0-9_.-]+$/i);return rule.slice(2);}));
  for(const file of fs.readdirSync(root).filter(file=>file.endsWith('.html'))){
    assert.ok(allowed.has(file),`HTML excluded: ${file}`);
    const html=fs.readFileSync(path.join(root,file),'utf8');
    for(const [,reference] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)){
      if(/^(?:https?:|mailto:|tel:|data:|#)/.test(reference))continue;
      const target=reference.split(/[?#]/)[0].replace(/^\//,'');
      if(target)assert.ok(allowed.has(target),`${file} dependency excluded: ${target}`);
    }
  }
  for(const file of ['wrangler.jsonc','.git/config','README.txt','content/archive.json','docs/report.html','_headers','_launch-qa.html','_launch-qa.js','debug.css','private-photo.png','script.js.map'])assert.equal(allowed.has(file),false,file);
  for(const file of ['machiavelli-portrait-640.webp','machiavelli-portrait-960.webp','robots.txt','sitemap.xml'])assert.ok(allowed.has(file),file);
});
