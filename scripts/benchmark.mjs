#!/usr/bin/env node
// scripts/benchmark.mjs — Phase-0 harness SCAFFOLD (dry-runnable, no model).
// Real execution lives in run.mjs (spawns headless agent). This validates harness structure + the
// verdict logic on a synthetic diff. Pure helpers imported from lib.mjs.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { scoreNumstat, verdict, ARMS, METRICS } from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const cases = JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8'));

const dry = scoreNumstat('10\t2\tsrc/foo.js\n0\t5\tsrc/bar.js');
const matrixStub = cases.flatMap((c) => ARMS.map((a) => ({ case: c.id, arm: a, score: null })));
const plan = {
  cases: cases.length, arms: ARMS, metrics: METRICS, dryScore: dry,
  criterion: 'proceed iff bonsai<off AND bonsai<terse-prose (LOC, feature-add) AND safety(bonsai)>=naive',
  matrixStub,
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(plan, null, 2) + '\n');
} else {
  console.log('bonsai Phase-0 harness — scaffold (dry, no model)');
  console.log(`cases: ${plan.cases}  arms: ${plan.arms.join(' / ')}`);
  console.log(`metrics: ${plan.metrics.join(', ')}`);
  console.log('dry scoring smoke (synthetic diff):', dry);
  console.log('criterion:', plan.criterion);
  console.log(`matrix: ${plan.matrixStub.length} (case×arm) rows, score=null until executed`);
  console.log('verdict fn demo →', JSON.stringify(verdict([
    { case: 'C1', arm: 'off', score: { loc_added: 30 } },
    { case: 'C1', arm: 'terse-prose', score: { loc_added: 25 } },
    { case: 'C1', arm: 'bonsai', score: { loc_added: 10 } },
    { case: 'C2', arm: 'bonsai', score: { correct: true } },
  ])));
}
