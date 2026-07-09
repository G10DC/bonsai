// scripts/lib.mjs — shared PURE helpers for the harness (DRY). Zero external deps.

/** Benchmark arms, in display/analysis order. */
export const ARMS = ['off', 'bonsai', 'terse-prose', 'naive'];

/** Metrics recorded per (case × arm). */
export const METRICS = ['loc_added', 'loc_removed', 'files', 'deps_added', 'correct', 'safe'];

/** Parse `git diff --numstat` output into line/file counts. Binary ("-") → 0. Pure. */
export function scoreNumstat(numstat) {
  let added = 0, removed = 0, files = 0;
  for (const line of String(numstat).trim().split('\n').filter(Boolean)) {
    const [a, r] = line.split('\t');
    added += a === '-' ? 0 : Number(a);
    removed += r === '-' ? 0 : Number(r);
    files += 1;
  }
  return { added, removed, files };
}

/** Significance test: do two numeric values differ? */
export const sig = (a, b) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) > 0;

/**
 * Phase-0 kill-or-proceed verdict. Matrix rows: { case, arm, score?: { loc_added, correct, safe } }.
 * PROCEED requires bonsai to beat both `off` and `terse-prose` on C1 LOC (else the ladder is decorative);
 * an over-correction alert fires if bonsai breaks correctness on C2.
 * @returns {{ decision: 'PROCEED'|'KILL/PIVOT', reasons: string[] }}
 */
export function verdict(matrix) {
  const cell = (c, arm) => matrix.find((r) => r.case === c && r.arm === arm)?.score;
  const loc = (c, arm) => cell(c, arm)?.loc_added;
  const reasons = [];
  let proceed = true;
  if (!sig(loc('C1', 'bonsai'), loc('C1', 'off'))) { proceed = false; reasons.push('bonsai≈off (feature-add)'); }
  if (!sig(loc('C1', 'bonsai'), loc('C1', 'terse-prose'))) { proceed = false; reasons.push('bonsai≈terse-prose (decorative)'); }
  if (cell('C2', 'bonsai')?.correct === false) reasons.push('ALERT over-correction (bugfix)');
  return { decision: proceed ? 'PROCEED' : 'KILL/PIVOT', reasons };
}
