#!/usr/bin/env node
// bonsai Phase-0 real runner (T2). Spawns headless `claude -p` per (case×arm) on a fixture repo,
// scores `git diff --numstat`, runs a per-case correctness + safety check, deps diff, writes
// .bench/results.json + a table. Real execution of the kill-or-proceed gate (T1).
// Usage: node run.mjs [--cases C1,C2] [--arms off,bonsai] [--n 1] [--dry]
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { scoreNumstat } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const cases = JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8'));

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const wantCases = (opt('cases', '') ).split(',').filter(Boolean);
const wantArms = opt('arms', 'off,bonsai').split(',').filter(Boolean);
const N = Number(opt('n', '1'));
const dry = argv.includes('--dry');

const SK = readFileSync(join(root, 'SKILL.md'), 'utf8');
const ARM_PROMPT = {
  off: 'You are a helpful coding agent. Make the requested change to the repository files.',
  bonsai: SK,
  'terse-prose': 'You are a coding agent. Be extremely terse; write only essential code, no commentary.',
  naive: 'Apply YAGNI and one-liners. Write the least code possible.',
};

const git = (work, args) => spawnSync('git', args, { cwd: work, encoding: 'utf8' });
// run a JS check script directly via node (no shell) — avoids Windows cmd.exe mangling `&&` inside -e
const check = (script, work) => spawnSync('node', ['-e', script], { cwd: work, encoding: 'utf8' }).status === 0;

function countDeps(work) {
  const p = join(work, 'package.json');
  if (!existsSync(p)) return 0;
  try {
    const j = JSON.parse(readFileSync(p, 'utf8'));
    return Object.keys(j.dependencies || {}).length + Object.keys(j.devDependencies || {}).length;
  } catch { return 0; }
}

function runArm(c, arm) {
  const work = join(root, '.bench', `${c.id}__${arm.replace(/[+]/g, '-')}`);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });
  cpSync(join(here, 'fixtures', c.fixture), work, { recursive: true });
  git(work, ['init', '-q']);
  git(work, ['add', '-A']);
  git(work, ['-c', 'user.email=b@b.co', '-c', 'user.name=bench', 'commit', '-qm', 'base']);
  const depsBefore = countDeps(work);

  if (!dry) {
    const r = spawnSync('claude', ['-p', '--append-system-prompt', ARM_PROMPT[arm], '--dangerously-skip-permissions', c.task],
      { cwd: work, encoding: 'utf8', timeout: 240000 });
    if (r.error || r.status !== 0) {
      return { case: c.id, arm, error: String((r.stderr || r.stdout || r.error || 'claude failed')).slice(0, 400) };
    }
  }
  git(work, ['add', '-A']);
  const sc = scoreNumstat(git(work, ['diff', '--cached', '--numstat']).stdout);
  const depsAfter = countDeps(work);
  const correct = check(c.correct, work);
  const safe = c.safe ? check(c.safe, work) : true;
  return {
    case: c.id, kind: c.kind, arm,
    loc_added: sc.added, loc_removed: sc.removed, files: sc.files,
    deps_added: Math.max(0, depsAfter - depsBefore), deps_zero: depsAfter === 0,
    correct, safe,
  };
}

const sel = cases.filter((c) => !wantCases.length || wantCases.includes(c.id));
const results = [];
for (const c of sel) {
  for (const arm of wantArms) {
    for (let i = 0; i < N; i++) {
      process.stderr.write(`▶ ${c.id} / ${arm} (#${i + 1})…\n`);
      const r = runArm(c, arm);
      results.push(r);
      process.stderr.write(`  → loc+${r.loc_added ?? '?'} -${r.loc_removed ?? '?'} correct=${r.correct} safe=${r.safe}${r.deps_zero === false ? ' DEPS!' : ''}${r.error ? ' ERR' : ''}\n`);
    }
  }
}
mkdirSync(join(root, '.bench'), { recursive: true });
writeFileSync(join(root, '.bench', 'results.json'), JSON.stringify(results, null, 2));

const cols = ['case', 'arm', 'loc_added', 'loc_removed', 'files', 'deps_added', 'correct', 'safe'];
console.log(cols.join('\t'));
for (const r of results) console.log(cols.map((k) => (r[k] ?? (r.error ? 'ERR' : ''))).join('\t'));
