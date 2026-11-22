const fs = require('node:fs');
const release = fs.readFileSync('.assetsignore','utf8');
fs.writeFileSync('.assetsignore',release + '!/qa/\n!/qa/screen.html\n!/qa/screen.js\n');
