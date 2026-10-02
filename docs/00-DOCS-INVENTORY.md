# KAFENE Documentation Inventory

Status: **CANONICAL**

This inventory is the registry of durable project documentation. A file being newer does not make it authoritative.

| Document | Status | Role / authority |
|---|---|---|
| `README.md` | CANONICAL ENTRYPOINT | Short repository overview; subordinate to the docs hierarchy. |
| `AGENTS.md` | OPERATIONS | Agent entry instructions. |
| `CLAUDE.md` | OPERATIONS | Claude entry instructions. |
| `docs/00-START-HERE.md` | CANONICAL | Documentation hierarchy and reading order. |
| `docs/00-DECISIONS.md` | CANONICAL | Accepted product/architecture decisions. |
| `docs/00-DOCS-INVENTORY.md` | CANONICAL | Registry and status of durable docs. |
| `docs/product/PRODUCT-REQUIREMENTS.md` | ACTIVE DRAFT | Needs reconciliation with separate website/forum architecture before becoming canonical. |
| `docs/research/DISCOURSE-FEASIBILITY-SPIKE.md` | RESEARCH INPUT | Historical spike protocol. Its old candidate architecture is not current product architecture. |
| `docs/research/DISCOURSE-SPIKE-RESULTS.md` | EVIDENCE | Measured live Discourse/AI results. Factual evidence, not a product decision by itself. Note: some header/template fields are stale and require a reconciliation pass. |
| `docs/research/ENGINE-COMPARISON.md` | RESEARCH INPUT | Pre-spike Discourse vs XenForo research; live evidence takes precedence where available. |
| `docs/research/JEV-RERANKING-SPIKE.md` | DEFERRED | Future reranking research hypothesis. Not current architecture. |
| `docs/architecture/ADR-001-FORUM-ENGINE.md` | ACTIVE DRAFT | Proposed ADR, stale in part after website/forum separation; must be rewritten before acceptance. |
| `docs/operations/agent_execution_discipline_adoption.md` | OPERATIONS | KAFENE adoption boundary for the pinned execution standard. |
| `docs/operations/git-handoff.md` | OPERATIONS | Git/worktree handoff procedure. |
| `docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.md` | STANDARD | Pinned shared execution standard. |
| `docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.sha256` | STANDARD | Integrity hash for pinned standard. |

## Current canonical set

For product/architecture decisions, the current canonical set is deliberately small:

1. `docs/00-START-HERE.md`
2. `docs/00-DECISIONS.md`
3. `docs/00-DOCS-INVENTORY.md`

There is not yet a canonical HOME INTERACTION MODEL, final PRD, final frontend architecture or final Ask KAFENE architecture. Do not invent one by treating a research note as accepted.

## Cleanup candidates

No files are deleted by this cleanup pass.

The following need later reconciliation, rewrite or retirement:

- `docs/product/PRODUCT-REQUIREMENTS.md`
- `docs/architecture/ADR-001-FORUM-ENGINE.md`
- `docs/research/ENGINE-COMPARISON.md`
- stale header/template fields in `docs/research/DISCOURSE-SPIKE-RESULTS.md`

Move files to an archive only after their replacement is canonical.
