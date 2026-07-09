# bonsai — roadmap

> Status (2026-07-09): v0.2.0. The skill and harness are built; the skill itself is **not yet empirically validated**. The only real blocker is a validation campaign on an over-build-prone model.

## T1 — BLOCKER: validation
- [~] Run the harness for real — done at small scale: no measurable delta on the available model (already terse/minimal). Remaining: n≥4, multiple models, harder over-build cases.
- [ ] Multiple models — include a verbose / over-build-prone model where the skill can actually reduce code.
- [ ] Multiple stacks / languages (not only JS).
- [ ] Quantitative over-correction metric (load-bearing lines cut, not only a correctness boolean).
- [ ] Kill-or-proceed gate with pre-registered metrics (avoid overclaiming).

## T2 — harness
- [x] Headless runner, per-case correctness + safety checks, dependency diff, results persistence.
- [ ] Aggregated statistics (median + variance over n; deterministic seeding).

## T3 — skill completeness
- [x] Grounding tool-gate (`scripts/ground.mjs`) wired into the skill.
- [x] Graduated intensity (`aggressive` opt-in) documented.
- [ ] Activation precision / recall measured on real sessions.

## T4 — distribution & trust
- [~] Installable structure ready; install command documented (not auto-installed).
- [x] Trust model documented (`TRUST.md`).
- [ ] Pinned / provenanced install path; registry-compatible packaging.

## T5 — robustness
- [~] Adversarial guardrail cases + runner present (safety held; not yet a discriminating baseline).
- [x] Versioning in place.

## T6 — governance
- [x] Risk register and roadmap maintained; results reported honestly (skill = hypothesis under test).

---
**Priority: T1.** Until the skill shows a measurable, correct code-reduction delta on a model that over-builds, it remains an unvalidated hypothesis.
