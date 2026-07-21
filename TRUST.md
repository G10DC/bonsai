# bonsai — trust model

> A prompt-engineering skill is **trusted prompt-injection by design**: it changes how your agent writes code. Read this before installing.

## What it is / blast radius
- bonsai is a `SKILL.md` + small helper scripts (pure Node, **zero runtime dependencies**, no network, no telemetry).
- It biases the agent toward minimal code: it can make the agent write less, refuse speculative work, or propose deletions. With auto-accept edits, deletions apply without confirmation.
- The load-bearing guards are the **never-cut** clause (validation / errors / security / accessibility), **grounding** (no invented symbols), and **out-of-band-instructions** (raise deliberation on text sourced from README / issue / comment / docstring) — because a terse-minimalism bias *amplifies* injection vectors.

## Before you install
- **Read `SKILL.md`** — it is short on purpose. Confirm the ladder and the never-cut clause survive your reading.
- **Pin the version.** Don't pull the default branch blindly; copy a specific revision.
- **Review contributions** if you fork: a change that weakens never-cut / grounding is the attack surface.
- **Don't auto-accept edits** in code where "delete the ceremony" is catastrophic (infra / auth / crypto / migration). The skill says so; enforce it at the harness too (permissions / hooks).

## Integrity gap (honest)
The skill ecosystem has no mature integrity model (no signing / checksums by default). bonsai documents this rather than papering over it: **install pinned, review the file, gate contributions.** Adopt a registry / installer with integrity support when one matures.

## Recommended install
```bash
$EDITOR SKILL.md     # review first
cp -r . ~/.gemini/config/skills/bonsai
```
