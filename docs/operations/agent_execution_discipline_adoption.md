# KAFENE adoption of Agent Execution Discipline v1.1

**Status:** OPERATIONS — LIVING-KNOWLEDGE LEVEL 2 ACTIVATION DEFERRED

## Authority

The pinned shared standard is:

- path: `docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.md`;
- version: `1.1`;
- SHA-256: `e79cad59a54f45d4dddc4335db543634563c9388b1310bc225b1e451eb6d2940`;
- upstream status: `Canonical internal standard`, dated 2026-09-26.

The adjacent `.sha256` file records the same byte identity. The pinned standard
is a vendor copy and must not be edited locally. KAFENE-specific applicability
is defined only by this adoption record.

For current product and architecture state, follow the repository hierarchy in
`PROJECT_RULES.md`:

1. `PROJECT_RULES.md`;
2. `docs/00-DECISIONS.md`;
3. `docs/STATUS.md`;
4. `docs/00-DOCS-INVENTORY.md`;
5. the current canonical product/architecture specification for the scoped work;
6. research and evidence records only as supporting material.

`README.md`, spike protocols/results, draft ADRs, code, fixtures, and older
operational prose do not independently define current product architecture.
This adoption record governs execution discipline only; it does not create or
override product decisions.

## Current project boundary

KAFENE is currently in **product architecture consolidation before frontend
implementation**.

The accepted baseline is that the KAFENE website/knowledge layer and Discourse
forum are separate connected product surfaces. Discourse is retained for
community/forum capabilities and multilingual semantic community retrieval;
standalone guides, journeys, collections/hubs, and verified Changes live on the
KAFENE website.

Native Discourse Ask AI is not the production Ask KAFENE answer layer. Automated
News, automated Changes monitoring, custom Ask KAFENE, Jev, and the final
replacement/rewrite of ADR-001 remain deferred or open unless explicitly
reactivated through the repository decision process.

Therefore this adoption must not be used to:

- finalize or implicitly accept ADR-001;
- treat a historical spike, README, research note, or draft ADR as current
  architecture authority;
- reintroduce Discourse as the website guide CMS or whole-product knowledge core;
- justify building a production orchestrator, monitoring pipeline, or
  publication workflow that is not currently authorized;
- treat research evidence as a product decision;
- auto-publish source-derived changes without recorded review authority.

## Execution-level classification

Use the shared levels proportionally:

- **Level 0** — one bounded code/doc/test change.
- **Level 1** — multi-step product/architecture research, feasibility work, or
  ordinary feature development.
- **Level 2** — the future living-knowledge workflow once it is explicitly
  authorized: source monitoring → deterministic diff → relevance/evidence
  assessment → proposed patch → review → publish.

The mere presence of monitoring, embeddings, AI, or a forum does not make all
KAFENE work Level 2. Level 2 applies to the repeated, stateful knowledge-update
workflow and other genuinely long-running/provenance-sensitive agent processes.

## Existing substrate reused

The shared discipline must reuse the project's accepted direction and current
governance rather than recreate them:

- `PROJECT_RULES.md`, `docs/00-DECISIONS.md`, `docs/STATUS.md`, and
  `docs/00-DOCS-INVENTORY.md` for repository/product state and authority;
- current canonical product/architecture specifications for the scoped task;
- Discourse as the accepted community/forum substrate, not as the whole product
  or website editorial CMS;
- supported integration boundaries as defined by the future
  website↔Discourse ADR/integration contract;
- research/spike evidence as supporting material, never as decision authority;
- tests and reproducible fixtures for mechanical validation;
- `scripts/task_sync.py` for Git synchronization and verified publication where
  applicable.

Do not create a second product-state or governance universe merely to satisfy
the shared standard.

## Living-knowledge Level 2 contract

If and when the living-knowledge engine is authorized, Level 2 should preserve
at minimum:

- source identity/snapshot plus retrieval and effective dates;
- claim-to-source bindings;
- deterministic source diff before semantic judgement;
- freshness and invalidation rules;
- durable update/proposal state and append-only attempts/retries;
- explicit promotion gates between detected change, relevant evidence,
  proposed patch, review, and publication;
- human/project authority for publication where required;
- audit trail for source, evidence, proposal, review, and published revision;
- checkpoint/resume behavior and stale-source rejection;
- budget/stop rules and observability where available.

A changed, missing, or contradictory source triggers re-evaluation. It does not
default to automatic publication.

## Implemented now

This repository has:

1. a byte-identical pinned copy of Agent Execution Discipline v1.1;
2. its recorded SHA-256;
3. this repository-specific adoption record;
4. short agent entrypoint pointers;
5. canonical repository governance and decision/status/inventory documents that
   define current authority.

No deferred product architecture, source-monitoring implementation, publication
policy, or production Level 2 workflow is accepted merely by this adoption.

## Deferred activation

Before claiming the living-knowledge Level 2 workflow is operational, KAFENE
must first explicitly authorize the relevant architecture and workflow, then
prospectively implement and validate the minimum applicable Level 2 controls on
that accepted substrate.

Recovery, stale-identity rejection, promotion-gate behavior, and publication
authority must be tested before that workflow is represented as production-ready.

## Validation boundary

This adoption is documentation/operations governance only. Engineering checks
must follow the current scoped task and accepted architecture, not historical
Discourse feasibility criteria by default.

Passing repository tests, spike checks, or fixture validation does not by itself
accept product architecture, activate deferred work, or authorize publication
automation.
