# Changelog

## 0.2.0 — 2026-07-09
- Hardened harness: extracted shared pure helpers into `scripts/lib.mjs` (`scoreNumstat`, `verdict`, `sig`, `ARMS`, `METRICS`); removed duplication across the runner and the scaffold.
- Modularized `ground.mjs`: core (`walkSources` / `findSymbol` / `findDep`) exported with JSDoc, thin CLI wrapper.
- Added unit + integration tests (`tests/`): tests passing, ~95% line coverage on the importable core.
- Added CI (`.github/workflows/ci.yml`: test + coverage + smoke + lint), `package.json`, `eslint.config.js`, `.gitignore`, `docs/ARCHITECTURE.md`.
- Simplified the benchmark to four standalone arms (`off` / `bonsai` / `terse-prose` / `naive`); removed external cross-references.
- Cleanup: removed generated working artifacts; the repository is standalone with zero runtime dependencies.

## 0.1.0 — 2026-07-09
- Initial skill: decision ladder (7 rungs), grounding (anti-hallucination, tool-gate `ground.mjs`), never-cut safety clause, zero-trace, graduated intensity (conservative / aggressive opt-in), opt-in turn-bounded activation, out-of-band-instructions guardrail.
- Phase-0 harness: dry-runnable scaffold (`benchmark.mjs`), real runner (`run.mjs`), case fixtures, correctness + safety checks.
