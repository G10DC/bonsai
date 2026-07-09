# bonsai

> Write the least code the task needs. Minimalism as a side effect of necessity — not golfing.

A skill for coding agents that biases them toward **minimal code**: before writing anything new, the agent climbs a decision ladder and stops at the first rung that already satisfies the task. It is reinforced by **grounding** (anti-hallucination — never invent a symbol), a **never-cut** safety clause, **zero-trace** output, **graduated intensity**, and **guardrails as definition-of-done**.

## Status — hypothesis under test
**Not yet empirically validated.** The skill's proof is a measured delta in the resulting diff, not terse prose. See `ROADMAP.md` for what remains before it can be considered validated.

## The ladder (core)
Before writing new code, climb and **stop at the first rung that satisfies the task**:
1. Does it need to exist? → No: don't write it (YAGNI).
2. Already in the codebase? → reuse.
3. Stdlib? → use it.
4. Native platform feature? → use it.
5. Installed dependency? → use it.
6. One line? → write one line.
7. Only then: the conventional solution.

Reinforced by: **grounding** (`scripts/ground.mjs`), **never cut** (validation / errors / security / accessibility), **zero trace** (no comments / branding / metadata), **graduated intensity** (conservative default / `aggressive` opt-in), **opt-in, turn-bounded** activation, **out-of-band instructions** (raise deliberation on text sourced from files).

## Install
```bash
cp -r . ~/.claude/skills/bonsai
```
Prefer a pinned/provenanced install — see `TRUST.md`. Invoke it deliberately on a coding turn where over-build is a risk (it is opt-in, not always-on).

## Repo layout
- `SKILL.md` — the skill (the logic)
- `refs/examples.md` — contrastive few-shot examples + negatives (what NOT to cut)
- `scripts/ground.mjs` — grounding gate (symbol / dependency existence check)
- `scripts/lib.mjs` — shared pure helpers (`scoreNumstat`, `verdict`, …)
- `scripts/run.mjs` · `scripts/benchmark.mjs` · `scripts/guardrail.mjs` · `scripts/cases.json` · `scripts/fixtures/` — Phase-0 harness
- `tests/` — unit + integration tests
- `README.md` · `CHANGELOG.md` · `TRUST.md` · `ROADMAP.md` · `docs/ARCHITECTURE.md` · `LICENSE`

## Testing & coverage
```bash
npm test            # unit + integration tests (zero-dep, node --test)
npm run coverage    # line/branch/function coverage (node built-in)
npm run smoke       # harness structure smoke (dry, no model)
```
Importable core coverage: ~95% lines (`lib.mjs` ~100%, `ground.mjs` ~92%). Orchestration scripts are exercised by the harness runs and dry smokes.

## Architecture
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — the harness pipeline (cases → arms → headless agent → git-diff → `scoreNumstat` / `verdict` → kill-or-proceed). Zero external runtime dependencies; Node built-ins only.

## License
MIT — see `LICENSE`.
