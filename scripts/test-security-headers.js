const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
const ignore = fs.readFileSync(path.join(root, '.assetsignore'), 'utf8');

test('Workers static assets allowlist includes the reserved _headers file', () => {
  assert.match(ignore, /^!\/_headers\s*$/m);
  assert.match(headers, /^\/\*\s*$/m);
});

test('response security baseline is present without enforcing an untested CSP', () => {
  for (const name of ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.match(headers, new RegExp('^\\s+' + name + ':', 'm'));
  }
  assert.match(headers, /^\s+Content-Security-Policy-Report-Only:/m);
  assert.doesNotMatch(headers, /^\s+Content-Security-Policy:/m);
});
