# KAFENE Documentation Start Here

Status: **CANONICAL ONBOARDING**

This is the human-readable documentation entrypoint. Repository governance itself
is defined by `PROJECT_RULES.md`.

## Required reading order

For substantive product, architecture or durable documentation work:

1. `PROJECT_RULES.md`
2. `docs/STATUS.md`
3. `docs/00-DECISIONS.md`
4. `docs/00-DOCS-INVENTORY.md`
5. the current document(s) for the scoped task
6. research/evidence only when relevant

A lower-level document may not silently override a higher-level one.

## Control documents

- `PROJECT_RULES.md` — canonical repository governance.
- `docs/STATUS.md` — current phase, active task and next authorized step.
- `docs/00-DECISIONS.md` — accepted product/architecture decisions.
- `docs/00-DOCS-INVENTORY.md` — registry and status of durable docs.
- `docs/standards/DOCUMENTATION_DISCIPLINE_v1.0.md` — subordinate documentation standard.
- `docs/operations/documentation_discipline_adoption.md` — KAFENE applicability record.

## Core documentation rule

One durable question should have one current authoritative document.

Do not create a new document when an existing current document can be updated.
Do not treat research, evidence, recency or a newer filename as a decision.

Every durable document must be registered in the inventory.

## Current project state

Do not duplicate current-state prose here.

Read `docs/STATUS.md` for:
- current phase;
- accepted baseline;
- completed work;
- deferred work;
- active task;
- next authorized step.

## Current caution

The inventory currently marks several older documents as drafts/research inputs,
including the PRD and ADR-001. Their presence does not make their stale
Discourse-as-knowledge-core assumptions current architecture.

## Contributor rule

If unsure where a change belongs, do not create a parallel structure. Check
`PROJECT_RULES.md`, the inventory and the current owning document first.
