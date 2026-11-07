const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { youtubeUrl, validVideo, publishedUrl } = require('../video-links.js');
const { renderHtml } = require('./sync-site.js');
const { renderMachiavelliScene } = require('./render-machiavelli-scene.js');
const { releaseFixture } = require('./release-fixture.js');
const data = require('../site-data.js');
test('a video destination requires a genuine video-shaped HTTPS URL and a nonempty title', () => {
  for (const url of ['https://www.youtube.com/watch?v=TESTFIXTURE', 'https://youtu.be/TESTFIXTURE', 'https://m.youtube.com/watch?v=TESTFIXTURE&t=15']) {
    assert.ok(validVideo({title:'Test',url}));
    assert.equal(publishedUrl({published:true,title:'Test',url}),new URL(url).href);
    assert.equal(publishedUrl({published:false,title:'Test',url}),'');
    assert.equal(publishedUrl({published:'true',title:'Test',url}),'');
    assert.equal(publishedUrl({published:true,title:' ',url}),'');
  }
});
test('video links reject channels, redirect paths, credentials, alternate ports and lookalike hosts', () => {
  for (const url of ['', 'javascript:alert(1)', 'http://youtu.be/TESTFIXTURE', 'https://youtube.com.evil.example/watch?v=TESTFIXTURE', 'https://www.youtube.com/@aligazaltr', 'https://www.youtube.com/redirect?v=TESTFIXTURE', 'https://www.youtube.com/watch?v=short', 'https://www.youtube.com:8443/watch?v=TESTFIXTURE', 'https://user:password@www.youtube.com/watch?v=TESTFIXTURE', 'https://youtu.be/TESTFIXTURE/extra']) {
    assert.equal(youtubeUrl(url),'',url);
    assert.equal(publishedUrl({published:true,title:'Test',url}),'',url);
  }
});
test('the published scene has a native named cover link and keeps the separate research route', () => {
  const fixture=releaseFixture(),html=renderMachiavelliScene(fixture.projects.machiavelli);
  assert.match(html,/<a class="mc-film-link" data-published-cover href="https:\/\/www.youtube.com\/watch\?v=TESTFIXTURE" target="_blank" rel="noopener noreferrer"/);
  assert.match(html,/aria-label="YouTube’da izle: Yerel test &amp; &lt;başlık&gt; \$&amp; \(yeni sekmede\)"/);
  assert.match(html,/href="#deney-asamasi"/);
  const link=html.match(/<a class="mc-film-link"[\s\S]*?<\/a>/)[0];
  assert.equal((link.match(/<a\b/g)||[]).length,1);
  assert.match(link,/<img/);assert.match(link,/YouTube’da izle ↗/);
});
test('publication and withdrawal keep static home/scene links coherent without JavaScript', () => {
  const released=releaseFixture();
  for (const file of ['index.html','machiavelli.html']) {
    const source=fs.readFileSync(require('node:path').resolve(__dirname,'..',file),'utf8');
    const published=renderHtml(source,released);
    assert.match(published,/href="https:\/\/www.youtube.com\/watch\?v=TESTFIXTURE"/);
    assert.equal(renderHtml(published,released),published);
    const withdrawn=renderHtml(published,data);
    assert.doesNotMatch(withdrawn,/href="https:\/\/(?:www\.)?(?:youtube.com\/watch|youtu.be\/)/);
    assert.doesNotMatch(withdrawn,/data-published-cover/);
    assert.match(withdrawn,/href="(?:machiavelli.html|#deney-asamasi)"/);
  }
});
test('malformed published data fails the static build instead of shipping an unsafe cover', () => {
  const fixture=JSON.parse(JSON.stringify(releaseFixture()));
  fixture.projects.machiavelli.video.url='https://user@www.youtube.com/watch?v=TESTFIXTURE';
  assert.throws(()=>renderHtml(fs.readFileSync(require.resolve('../machiavelli.html'),'utf8'),fixture),/yayın için/);
  assert.doesNotMatch(renderMachiavelliScene(fixture.projects.machiavelli),/data-published-cover/);
});

test('published home has an explicit watch action and withdrawal removes it',()=>{
 const source=fs.readFileSync(require.resolve('../index.html'),'utf8');
 const html=renderHtml(source,releaseFixture());
 assert.match(html,/Videoyu YouTube’da izle/);assert.match(html,/class="dossier-link" href="machiavelli.html"/);
 assert.doesNotMatch(renderHtml(html,data),/Videoyu YouTube’da izle/);
 assert.equal(data.projects.machiavelli.video.published,false);assert.equal(data.projects.machiavelli.video.url,'');
});
