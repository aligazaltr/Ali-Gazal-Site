#!/usr/bin/env node
/* One production origin; static metadata stays readable without JavaScript. */
const fs = require('node:fs');
const path = require('node:path');
const site = require('../site-data.js');
const archive = require('../archive-data.js');
const root = path.resolve(__dirname, '..');
const pages = Object.freeze({
  'index.html': '/', 'machiavelli.html': '/machiavelli',
  'rehberler.html': '/rehberler', 'dusunce-arsivi.html': '/dusunce-arsivi',
  'hakkimda.html': '/hakkimda', 'kontrol-bende-mi.html': '/kontrol-bende-mi', 'irade-terbiyesi.html': '/irade-terbiyesi'
});
const escape = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function renderMetadata(html, file, data = site) {
  if (!pages[file]) return html;
  const origin = new URL(data.canonicalOrigin);
  if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Invalid production origin');
  const url = origin.origin + pages[file];
  html = html.replace(/(<link\b[^>]*rel="canonical"[^>]*href=")[^"]+/, `$1${url}`)
    .replace(/(<meta\b[^>]*property="og:url"[^>]*content=")[^"]+/, `$1${url}`)
    .replace(/(<a\b[^>]*data-share-url[^>]*href=")[^"]+/, `$1${url}`);
  // The homepage already features this cover; social previews use the same asset.
  if (file === 'index.html') {
    const cover = data.projects.machiavelli.video.thumbnail;
    const image = origin.origin + '/' + cover.src;
    const fields = [
      ['property','og:image',image], ['property','og:image:secure_url',image],
      ['property','og:image:type','image/jpeg'], ['property','og:image:width',cover.width],
      ['property','og:image:height',cover.height], ['property','og:image:alt',cover.alt],
      ['name','twitter:image',image], ['name','twitter:image:alt',cover.alt]
    ];
    html = html.replace(/(<meta name="twitter:card" content=")[^"]+/, '$1summary_large_image');
    for (const [attribute, name, value] of fields) {
      const pattern = new RegExp(`<meta\\b[^>]*${attribute}="${name}"[^>]*>`);
      const tag = `<meta ${attribute}="${name}" content="${escape(value)}">`;
      html = pattern.test(html) ? html.replace(pattern, () => tag) : html.replace('  <link rel="icon"', `  ${tag}\n  <link rel="icon"`);
    }
  }
  return html;
}
function renderRobots(data = site) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${data.canonicalOrigin}/sitemap.xml\n`;
}
function renderSitemap(data = site, thoughts = archive) {
  const dates = thoughts.entries.map(entry => entry.publishedAt).filter(Boolean).sort();
  const lastmod = file => file === 'rehberler.html' ? Object.values(data.projects).map(project => project.lastUpdated).filter(Boolean).sort().at(-1) : file === 'kontrol-bende-mi.html' ? data.projects['kontrol-bende-mi'].lastUpdated : file === 'irade-terbiyesi.html' ? data.projects['irade-terbiyesi'].lastUpdated
    : file === 'dusunce-arsivi.html' ? dates.at(-1) : data.projects.machiavelli.lastUpdated;
  const row = (file, pathname) => `  <url><loc>${data.canonicalOrigin}${pathname}</loc><lastmod>${lastmod(file)}</lastmod></url>`;
  const rows = Object.entries(pages).filter(([file]) => file !== 'dusunce-arsivi.html').map(([file,p])=>row(file,p));
  const archiveRow = dates.length ? `\n${row('dusunce-arsivi.html','/dusunce-arsivi')}\n` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n  <!-- archive:sitemap:start -->${archiveRow}<!-- archive:sitemap:end -->\n</urlset>\n`;
}
function changes() {
  const outputs = Object.entries(pages).map(([file])=>[file,renderMetadata(fs.readFileSync(path.join(root,file),'utf8'),file)]);
  outputs.push(['robots.txt',renderRobots()],['sitemap.xml',renderSitemap()]);
  return outputs.flatMap(([file,next])=>fs.readFileSync(path.join(root,file),'utf8') === next ? [] : [{file,next}]);
}
if (require.main === module) {
  const updates = changes();
  if (process.argv.includes('--check') && updates.length) {
    console.error(`SEO çıktıları güncel değil: ${updates.map(row=>row.file).join(', ')}. node scripts/sync-seo.js çalıştır.`);
    process.exitCode=1;
  } else {
    if (!process.argv.includes('--check')) updates.forEach(({file,next})=>fs.writeFileSync(path.join(root,file),next));
    console.log('✓ Canonical, sosyal paylaşım, robots ve sitemap merkezî alan adıyla eşleşiyor.');
  }
}
module.exports = {pages,renderMetadata,renderRobots,renderSitemap,changes};
