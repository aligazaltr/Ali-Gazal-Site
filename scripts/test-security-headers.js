const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
const ignore = fs.readFileSync(path.join(root, '.assetsignore'), 'utf8');

test('Wrangler reads _headers as deployment metadata without publishing it as an asset', () => {
  assert.doesNotMatch(ignore, /^!\/_headers\s*$/m);
  assert.ok(fs.existsSync(path.join(root, '_headers')));
  assert.match(headers, /^\/\*\s*$/m);
});

test('response security policy enforces local scripts without an unsafe script escape', () => {
  for (const name of ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.match(headers, new RegExp('^\\s+' + name + ':', 'm'));
  }
  const csp = headers.match(/^\s+Content-Security-Policy: (.+)$/m)?.[1];
  assert.ok(csp);
  assert.match(csp, /script-src 'self';/);
  assert.match(csp, /script-src-attr 'none';/);
  assert.match(csp, /frame-ancestors 'self';/);
  assert.doesNotMatch(csp, /unsafe-eval|script-src[^;]*unsafe-inline/);
  assert.doesNotMatch(headers, /Content-Security-Policy-Report-Only:|Strict-Transport-Security:/);
  assert.ok(headers.split('\n').every(line => line.length <= 2000));
});
