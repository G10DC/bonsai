# bonsai — architecture

Zero external runtime dependencies; Node built-ins only. ESM throughout.

## Harness pipeline (Phase-0 validation)

```mermaid
flowchart TD
  I["cases.json<br/>(task fixtures)"] --> R["run.mjs<br/>(orchestrator)"]
  R --> A{"for each arm<br/>off · bonsai · terse-prose · naive"}
  A --> CL["headless agent<br/>(per-arm prompt)"]
  CL -->|edits| FIX["fixture git repo<br/>(copy → init → commit)"]
  FIX --> GD["git diff --numstat"]
  GD --> SC["scoreNumstat<br/>(lib.mjs — pure)"]
  FIX --> CK["correctness + safety<br/>(node checks, no shell)"]
  SC --> V["verdict<br/>(lib.mjs — pure)"]
  CK --> V
  V --> OUT["results.json →<br/>kill-or-proceed"]
```

## Module dependency graph

```mermaid
graph LR
  lib["lib.mjs<br/>pure helpers<br/>scoreNumstat · verdict · sig"]
  lib --> benchmark["benchmark.mjs<br/>dry scaffold + verdict demo"]
  lib --> run["run.mjs<br/>real runner"]
  run --> agent[("headless agent")]
  ground["ground.mjs<br/>walkSources · findSymbol · findDep"]
  guardrail["guardrail.mjs"] --> run
  SKILL["SKILL.md"] -.references.-> ground
  T1["tests/lib.test.mjs"] --> lib
  T2["tests/ground.test.mjs"] --> ground
```

## Layering (dependencies point down)
- **Pure core** (`lib.mjs`): no fs / spawn / network — fully unit-tested.
- **Grounding gate** (`ground.mjs`): importable core + thin CLI.
- **Orchestration** (`run.mjs`, `benchmark.mjs`, `guardrail.mjs`): spawn the agent / git / node; exercised by harness runs and dry smokes.
- **Fixtures** (`scripts/fixtures/*`): throwaway case inputs.

## Test surface
- **Unit** (`tests/lib.test.mjs`): `scoreNumstat`, `sig`, `verdict` (PROCEED / KILL / over-correction).
- **Unit + CLI smoke** (`tests/ground.test.mjs`): `walkSources` / `findSymbol` / `findDep`.
- Coverage (node built-in): ~95% lines on the importable core.
