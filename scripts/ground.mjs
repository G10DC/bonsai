// scripts/ground.mjs — bonsai grounding gate (T3 tool-mediated check).
// Resistant to recursive guardrail erosion: a runnable check the agent calls before relying on a
// reuse/stdlib/dependency rung. Core functions are exported for unit testing; the CLI is a thin wrapper.
//
//   node ground.mjs symbol <name>   → search the repo for an identifier
//   node ground.mjs dep <name>      → check manifests for a dependency
// Exit 0 = FOUND (rung grounded); Exit 1 = NOT FOUND (descend the ladder, do not invent).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const EXTS = /\.(js|mjs|cjs|ts|tsx|jsx|py|go|rs|java|rb|php)$/;
const SKIP = /^(node_modules|\.git|\.bench|dist|build|\.next)$/;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Walk source files under `dir`, skipping generated/vendor directories.
 * @param {string} dir
 * @param {string[]} [acc]
 * @returns {string[]} absolute file paths
 */
export function walkSources(dir, acc = []) {
  let ents = [];
  try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of ents) {
    if (SKIP.test(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walkSources(p, acc);
    else if (EXTS.test(e.name)) acc.push(p);
  }
  return acc;
}

/**
 * Find occurrences of identifier `name` (word-boundary match) across `root`.
 * @returns {{ file: string, line: number, text: string }[]}
 */
export function findSymbol(root, name) {
  const re = new RegExp(`\\b${escapeRe(name)}\\b`);
  const hits = [];
  for (const f of walkSources(root)) {
    const lines = readFileSync(f, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) hits.push({ file: f, line: i + 1, text: lines[i].trim() });
    }
  }
  return hits;
}

/**
 * Check whether dependency `name` is declared in a manifest under `root`
 * (package.json deps blocks, requirements.txt, pyproject.toml).
 * @returns {string[]} locations, e.g. ['package.json:dependencies']
 */
export function findDep(root, name) {
  const where = [];
  try {
    const j = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    for (const k of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (j[k] && j[k][name]) where.push(`package.json:${k}`);
    }
  } catch { /* no/invalid package.json */ }
  for (const f of ['requirements.txt', 'pyproject.toml']) {
    try { if (readFileSync(join(root, f), 'utf8').includes(name)) where.push(f); } catch { /* absent */ }
  }
  return where;
}

// --- CLI (thin wrapper over the importable core) ---
if (process.argv[1] && process.argv[1].endsWith('ground.mjs')) {
  const [mode, name] = process.argv.slice(2);
  if (!mode || !name) { console.error('usage: ground.mjs symbol|dep <name>'); process.exit(2); }
  const root = process.cwd();
  if (mode === 'symbol') {
    const hits = findSymbol(root, name);
    if (!hits.length) { console.log(`NOT FOUND: symbol "${name}" not in this repo — descend the ladder, do not invent.`); process.exit(1); }
    for (const h of hits) console.log(`${h.file}:${h.line}: ${h.text}`);
    console.log(`FOUND: ${hits.length} occurrence(s) of "${name}".`); process.exit(0);
  }
  if (mode === 'dep') {
    const where = findDep(root, name);
    if (!where.length) { console.log(`NOT FOUND: dep "${name}" not in any manifest — descend the ladder, do not invent.`); process.exit(1); }
    console.log(`FOUND: dep "${name}" in ${where.join(', ')}.`); process.exit(0);
  }
  console.error('unknown mode: ' + mode); process.exit(2);
}
