# KAFENE adoption of Agent Execution Discipline v1.1

**Status:** ADOPTED GOVERNANCE BASELINE — LIVING-KNOWLEDGE LEVEL 2 ACTIVATION DEFERRED

## Authority

The pinned shared standard is:

- path: `docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.md`;
- version: `1.1`;
- SHA-256: `e79cad59a54f45d4dddc4335db543634563c9388b1310bc225b1e451eb6d2940`;
- upstream status: `Canonical internal standard`, dated 2026-09-26.

The adjacent `.sha256` file records the same byte identity. The pinned standard
is a vendor copy and must not be edited locally. KAFENE-specific applicability
is defined only by this adoption record.

`README.md`, the Discourse feasibility spike, and the architecture decision
records remain authoritative for product/architecture state. This adoption does
not accept the candidate architecture or authorize implementation beyond the
already defined spike boundary.

## Current project boundary

KAFENE is currently in architecture validation / feasibility spike.

The candidate Discourse + bridge + orchestrator architecture is explicitly not
yet accepted. Therefore this adoption must not be used to:

- finalize ADR-001;
- justify building a custom forum/CMS/RAG stack;
- introduce a production orchestrator before the feasibility decision;
- treat a spike result as production authority;
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

The shared discipline must reuse the project's existing direction:

- Discourse as the candidate community/knowledge core rather than a duplicate
  custom forum stack;
- supported APIs/plugins as the preferred integration surface;
- the feasibility spike and ADR process for architecture authority;
- tests and reproducible spike fixtures for mechanical validation;
- `scripts/task_sync.py` for Git synchronization and verified publication.

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

This repository now has:

1. a byte-identical pinned copy of Agent Execution Discipline v1.1;
2. its recorded SHA-256;
3. this repository-specific adoption record;
4. short agent entrypoint pointers.

No product architecture, forum engine decision, source-monitoring implementation,
publication policy, or production workflow is accepted by this adoption.

## Deferred activation

Before claiming the living-knowledge Level 2 workflow is operational, KAFENE
must first complete the relevant architecture decision and then prospectively
implement/validate the minimum applicable Level 2 controls on the accepted
substrate.

Recovery, stale-identity rejection, promotion-gate behavior, and publication
authority must be tested before that workflow is represented as production-ready.

## Validation boundary

This adoption is documentation/governance only. Normal repository tests and the
existing Discourse feasibility criteria remain the relevant engineering checks.
Passing them does not itself accept the architecture or authorize publication
automation.
