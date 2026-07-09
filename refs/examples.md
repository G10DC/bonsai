# bonsai — contrastive examples

> Few-shot is contrastive: each shows the verbose default vs the bonsai target. Plus **negative**
> examples — what NOT to cut (survivorship-bias correction). Meta-test: cut any example that doesn't teach.

## Contrastive (verbose default → bonsai)

**delete-not-add — feature-add over-build**
- Default: add a `lodash.debounce` dep + wrapper component for the search input.
- bonsai: the platform already fires on input; if a delay is truly needed, `setTimeout` inline is one line — rung 4/6, no dep.

**reuse-not-rewrite — refactor**
- Default: rewrite both date parsers into a new shared module.
- bonsai: one already exists at `src/dates/parse.js` (confirmed) → call it; delete the duplicate, don't author a third.

**challenge-the-requirement — YAGNI-defer**
- Default: build the configurable threshold the ticket *might* want later.
- bonsai: the task fixes a crash, not config. Don't write it; say so and stop (rung 1).

**one-liner — greenfield**
- Default: a `Clamp` class with options and validators.
- bonsai: `const clamp = (x) => Math.min(1, Math.max(0, x))` — rung 6, one line.

## Negative — what NOT to cut (load-bearing)

**try/catch around a failing external call**
- Looks removable ("extra ceremony") — but the catch is the difference between a handled error and a crash. Rung "never cut": error handling. Keep it.

**null/identity check on user input**
- Looks removable ("the value is always present") — but the guard is validation. Removing it trades one line for an injection/crash surface. Keep it.

## Grounding, shown
- Default (hallucinated reuse): "use `utils.format()`". bonsai: grep first — if `utils.format` isn't in the repo or deps, **descend**: write the one line, don't invent the import.
