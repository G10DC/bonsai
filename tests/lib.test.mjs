// Unit tests for the shared pure helpers (scripts/lib.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreNumstat, sig, verdict, ARMS, METRICS } from '../scripts/lib.mjs';

test('scoreNumstat: parses added/removed/files from numstat', () => {
  assert.deepEqual(scoreNumstat('10\t2\tsrc/a.js\n0\t5\tsrc/b.js'), { added: 10, removed: 7, files: 2 });
});
test('scoreNumstat: binary ("-") → 0; empty → zeros', () => {
  assert.deepEqual(scoreNumstat('-\t-\tbin'), { added: 0, removed: 0, files: 1 });
  assert.deepEqual(scoreNumstat(''), { added: 0, removed: 0, files: 0 });
});
test('sig: true only when both numeric and unequal', () => {
  assert.equal(sig(10, 2), true);
  assert.equal(sig(5, 5), false);
  assert.equal(sig(undefined, 5), false);
});
test('verdict: PROCEED when bonsai beats off & terse-prose', () => {
  const v = verdict([
    { case: 'C1', arm: 'off', score: { loc_added: 30 } },
    { case: 'C1', arm: 'terse-prose', score: { loc_added: 25 } },
    { case: 'C1', arm: 'bonsai', score: { loc_added: 10 } },
    { case: 'C2', arm: 'bonsai', score: { correct: true } },
  ]);
  assert.equal(v.decision, 'PROCEED');
  assert.equal(v.reasons.length, 0);
});
test('verdict: KILL/PIVOT when bonsai≈off (no delta)', () => {
  const v = verdict([
    { case: 'C1', arm: 'off', score: { loc_added: 10 } },
    { case: 'C1', arm: 'bonsai', score: { loc_added: 10 } },
    { case: 'C1', arm: 'terse-prose', score: { loc_added: 25 } },
  ]);
  assert.equal(v.decision, 'KILL/PIVOT');
});
test('verdict: KILL/PIVOT when bonsai≈terse-prose (ladder decorative)', () => {
  const v = verdict([
    { case: 'C1', arm: 'off', score: { loc_added: 30 } },
    { case: 'C1', arm: 'terse-prose', score: { loc_added: 10 } },
    { case: 'C1', arm: 'bonsai', score: { loc_added: 10 } },
  ]);
  assert.equal(v.decision, 'KILL/PIVOT');
});
test('verdict: over-correction alert when bonsai breaks C2 correctness', () => {
  const v = verdict([
    { case: 'C1', arm: 'off', score: { loc_added: 30 } },
    { case: 'C1', arm: 'terse-prose', score: { loc_added: 25 } },
    { case: 'C1', arm: 'bonsai', score: { loc_added: 10 } },
    { case: 'C2', arm: 'bonsai', score: { correct: false } },
  ]);
  assert.ok(v.reasons.some((r) => r.includes('over-correction')));
});
test('ARMS + METRICS surface', () => {
  assert.equal(ARMS[0], 'off');
  assert.ok(ARMS.includes('bonsai'));
  assert.ok(METRICS.includes('safe'));
});
