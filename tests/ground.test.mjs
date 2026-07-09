// Tests for the grounding gate core (scripts/ground.mjs) — unit (imported) + CLI (subprocess smoke).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { walkSources, findSymbol, findDep } from '../scripts/ground.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const fixture = join(root, 'scripts', 'fixtures', 'c2-user'); // has src/user.js exporting getUser
const ground = join(root, 'scripts', 'ground.mjs');

test('walkSources: lists source files, skips none here', () => {
  const files = walkSources(fixture);
  assert.ok(files.some((f) => f.replace(/\\/g, '/').endsWith('src/user.js')));
});

test('findSymbol: locates an exported identifier with line + text', () => {
  const hits = findSymbol(fixture, 'getUser');
  assert.ok(hits.length >= 1);
  assert.ok(hits.every((h) => h.file && h.line > 0 && typeof h.text === 'string'));
});

test('findSymbol: returns [] for a name that is absent', () => {
  assert.deepEqual(findSymbol(fixture, 'zzzNope'), []);
});

test('findDep: returns [] when the dep is not declared', () => {
  assert.deepEqual(findDep(fixture, 'lodash'), []);
});

test('CLI smoke: symbol FOUND → exit 0; NOT FOUND → exit 1', () => {
  const found = spawnSync('node', [ground, 'symbol', 'getUser'], { cwd: fixture, encoding: 'utf8' });
  assert.equal(found.status, 0);
  assert.match(found.stdout, /FOUND/);
  const missing = spawnSync('node', [ground, 'symbol', 'zzzNope'], { cwd: fixture, encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.match(missing.stdout, /NOT FOUND/);
});
