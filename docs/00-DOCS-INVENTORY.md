# KAFENE Documentation Inventory

Status: **CANONICAL**

This inventory is the registry of durable project documentation. A file being newer does not make it authoritative.

| Document | Status | Role / authority |
|---|---|---|
| `PROJECT_RULES.md` | CANONICAL | Governance: single source of truth for repository governance and source-of-truth hierarchy. |
| `README.md` | CANONICAL | Entrypoint: short repository overview; subordinate to `PROJECT_RULES.md`. |
| `AGENTS.md` | OPERATIONS | Agent entry instructions. |
| `CLAUDE.md` | OPERATIONS | Claude entry instructions. |
| `docs/00-START-HERE.md` | CANONICAL | Onboarding: human-readable starting point; subordinate to `PROJECT_RULES.md`. |
| `docs/STATUS.md` | CANONICAL | Current-state dashboard: current phase, active task, deferred work, and next authorized step; not a diary. |
| `docs/00-DECISIONS.md` | CANONICAL | Accepted product/architecture decisions. |
| `docs/00-DOCS-INVENTORY.md` | CANONICAL | Registry and formal status of durable docs. |
| `docs/product/HOME-INTERACTION-MODEL.md` | CANONICAL | Accepted MVP homepage/dashboard interaction mechanics, including dedup, cold-start, degradation, and analytics rules. |
| `docs/product/MONETIZATION-MODEL.md` | ACTIVE DRAFT | Domain-agnostic monetization model; architectural principles accepted, pricing/packages remain working assumptions. |
| `docs/product/PRODUCT-REQUIREMENTS.md` | ACTIVE DRAFT | Reconciled current PRD for the first useful release; not yet explicitly promoted to CANONICAL. |
| `docs/research/DISCOURSE-FEASIBILITY-SPIKE.md` | RESEARCH INPUT | Historical completed spike protocol. Old candidate architecture and pass criteria are not current product architecture. |
| `docs/research/DISCOURSE-SPIKE-RESULTS.md` | EVIDENCE | Measured live Discourse/AI results. Factual evidence, not a product decision by itself; reconciled to the completed spike evidence. |
| `docs/research/ENGINE-COMPARISON.md` | RESEARCH INPUT | Historical pre-spike Discourse vs XenForo comparison; live evidence and accepted decisions take precedence. |
| `docs/research/JEV-RERANKING-SPIKE.md` | DEFERRED | Future reranking research hypothesis. Not current architecture. |
| `docs/research/KAFENE-INFORMATION-ARCHITECTURE-RESEARCH.md` | RESEARCH INPUT | Research into IA, categories, tags, and EN/RU structure; not canonical until separate validation. |
| `docs/architecture/ADR-001-FORUM-ENGINE.md` | CANONICAL | Принятый boundary contract между KAFENE website/content layer и Discourse community/forum substrate. |
| `docs/architecture/WEBSITE-DISCOURSE-INTEGRATION-CONTRACT.md` | CANONICAL | Принятый P0 production contract для read-only server-side получения публичных Discourse community metadata, access boundary, cache/freshness и graceful degradation. |
| `docs/architecture/ADR-002-CMS-CONTENT-STORAGE.md` | ACTIVE DRAFT | Выбор Payload + Postgres и инварианты structured editorial knowledge model; stable ID и locale publication/fallback остаются blockers до канонизации. |
| `docs/operations/agent_execution_discipline_adoption.md` | OPERATIONS | KAFENE adoption boundary for the pinned execution standard, reconciled to current governance. |
| `docs/operations/git-handoff.md` | OPERATIONS | Git/worktree handoff procedure. |
| `docs/operations/documentation_discipline_adoption.md` | OPERATIONS | KAFENE adoption of the documentation discipline standard. |
| `docs/standards/DOCUMENTATION_DISCIPLINE_v1.0.md` | STANDARD | KAFENE documentation source-of-truth, status, and anti-duplication rules. |
| `docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.md` | STANDARD | Pinned shared execution standard. |
| `docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.sha256` | STANDARD | Integrity hash for pinned standard. |

## Formal status vocabulary

Formal statuses in this inventory are limited to the values defined by
`PROJECT_RULES.md`:

- `CANONICAL`
- `ACTIVE DRAFT`
- `EVIDENCE`
- `RESEARCH INPUT`
- `DEFERRED`
- `SUPERSEDED`
- `OPERATIONS`
- `STANDARD`

Role qualifiers such as governance, entrypoint, onboarding, or current-state
dashboard belong in the **Role / authority** column, not in the formal status
field.

## Current canonical set

For repository/product governance, the current control set is deliberately small:

1. `PROJECT_RULES.md`
2. `docs/STATUS.md`
3. `docs/00-DECISIONS.md`
4. `docs/00-DOCS-INVENTORY.md`
5. `docs/product/HOME-INTERACTION-MODEL.md` for homepage/dashboard behavior
6. `docs/architecture/ADR-001-FORUM-ENGINE.md` for the website↔Discourse boundary
7. `docs/architecture/WEBSITE-DISCOURSE-INTEGRATION-CONTRACT.md` for the P0 production integration contract

The reconciled PRD is the current ACTIVE DRAFT product contract for the first
useful release, but it is not yet CANONICAL. ADR-001 now canonically defines the
system boundary between website and Discourse. The P0 production website↔Discourse integration contract is now CANONICAL.
There is not yet a frontend architecture, CMS/content storage architecture,
or Ask KAFENE architecture.

## Cleanup / closure candidates

No files are deleted by this cleanup pass.

The following need later rewrite, supersession, validation, or explicit promotion:

- `docs/product/PRODUCT-REQUIREMENTS.md` — explicit canonical promotion decision, if accepted
- `docs/research/KAFENE-INFORMATION-ARCHITECTURE-RESEARCH.md` — validation before any canonical IA promotion

Historical research/evidence files should remain preserved unless a separate
archive/cleanup task explicitly authorizes moving them.
