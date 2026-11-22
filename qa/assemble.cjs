const fs = require('node:fs');
const release = fs.readFileSync('.assetsignore', 'utf8');
const qaAssets = ['qa/screen.html', 'qa/screen.js', ...fs.readdirSync('qa/reference').map(name => 'qa/reference/' + name)];
fs.writeFileSync('.assetsignore', release + '!/qa/\n!/qa/reference/\n' + qaAssets.map(name => '!/' + name).join('\n') + '\n');
