# KAFENE Project Rules

**Status:** ACTIVE — canonical repository governance.

This is the single source of truth for how humans and AI agents work in this
repository. `AGENTS.md` and `CLAUDE.md` are entry-point stubs only and may
not create competing instructions.

## 1. Source-of-truth hierarchy

When artifacts disagree, use this order:

1. `PROJECT_RULES.md` — repository governance.
2. `docs/00-DECISIONS.md` — accepted product/architecture decisions.
3. `docs/STATUS.md` — current phase, active task and authorized next step.
4. `docs/00-DOCS-INVENTORY.md` — document registry/status.
5. Current canonical product/architecture specification for the scoped work.
6. `docs/research/*` and evidence records — supporting material only.
7. Code, configs, tests, generated outputs and temporary prototypes.

A lower-level artifact may not silently override a higher-level decision.

## 2. Mandatory startup protocol

Before substantive product, architecture or durable documentation work, read:

1. `PROJECT_RULES.md`
2. `docs/STATUS.md`
3. `docs/00-DECISIONS.md`
4. `docs/00-DOCS-INVENTORY.md`
5. only the current document(s) relevant to the scoped task

Do not infer project state from README prose, a research note or chat history
alone.

For authorized coding tasks, follow `docs/operations/git-handoff.md` and the
pinned Agent Execution Discipline.

## 3. Documentation discipline

KAFENE adopts
`docs/standards/DOCUMENTATION_DISCIPLINE_v1.0.md` through
`docs/operations/documentation_discipline_adoption.md`.

That standard is subordinate to this file. It cannot independently authorize
product work or create a competing governance layer.

Core rules:

- one durable question should have one current authoritative document;
- update an existing current document instead of creating a parallel "latest";
- research is not a decision;
- evidence is not a decision;
- every durable document must be registered in the inventory;
- a completed research/spike must be promoted into a decision/current document,
  explicitly deferred, or superseded;
- conflicts must be surfaced, not silently reconciled.

## 4. Document states

Use the repository inventory statuses:

- `CANONICAL`
- `ACTIVE DRAFT`
- `EVIDENCE`
- `RESEARCH INPUT`
- `DEFERRED`
- `SUPERSEDED`
- `OPERATIONS`
- `STANDARD`

A newer file or commit is not automatically more authoritative.

## 5. Decision discipline

Accepted product/architecture decisions belong in
`docs/00-DECISIONS.md`.

That log records the current accepted baseline and may only be changed through an
explicit decision update. Research conclusions do not become project truth until
promoted there or into a designated canonical specification.

## 6. Current-state discipline

`docs/STATUS.md` is the current-state dashboard, not a diary.

Update it only when project state materially changes, for example:

- phase changes;
- a blocker opens/closes;
- an accepted baseline changes;
- the active task changes;
- the next authorized step changes.

It should always answer:

- where are we now;
- what is accepted;
- what is active;
- what is deferred;
- what may be done next.

## 7. Research and evidence boundary

`docs/research/*` contains research inputs, spike protocols and evidence.

Research may discover facts or recommend a direction, but it cannot silently
change product architecture.

Measured evidence must distinguish:

- tested;
- not tested;
- failed;
- unknown/inferred.

Never fill an unrun section with assumptions to make a document look complete.

## 8. Product baseline

Current accepted baseline:

- KAFENE is Cyprus-first in deployment, but its product core is domain-agnostic and portable across markets;
- the core must separate reusable product entities/mechanics from deployment-specific country/state/city, language, currency, category, brand, pricing and regulatory configuration;
- KAFENE is knowledge-first and community-backed;
- the KAFENE website/knowledge layer and Discourse forum are separate connected
  product surfaces;
- Discourse is retained for community/forum capabilities and multilingual
  semantic community retrieval;
- standalone guides/collections/journeys live on the KAFENE website, not in
  Discourse by default;
- native Discourse Ask AI is not the production Ask KAFENE answer layer;
- News and Changes are distinct concepts;
- automated News, automated Changes, custom Ask KAFENE and Jev are deferred from
  the current MVP implementation path unless explicitly reactivated;
- monetization preserves free canonical knowledge and is designed around high-intent commercial actions using portable primitives such as Business, Offer and Lead.

Exact accepted decisions remain authoritative in `docs/00-DECISIONS.md`.

## 9. Scope control

Do not widen a task merely because an adjacent problem is visible.

When a new issue is discovered:

- record it in the appropriate current doc/status if necessary;
- do not implement it unless the active task authorizes it;
- prefer one bounded task at a time.

Do not introduce new services, schemas, pipelines, databases or dependencies
without a concrete current requirement.

## 10. Repository hygiene

- Keep commits small and single-purpose.
- Do not mix unrelated product, architecture and cleanup work.
- Do not create duplicate governance systems.
- Do not delete stale docs merely to tidy the tree; supersede first, archive in a
  dedicated cleanup later.
- Preserve evidence and commit references supporting accepted decisions.

## 11. Execution discipline

Pinned standard:

`docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.md`

KAFENE adoption:

`docs/operations/agent_execution_discipline_adoption.md`

Ordinary bounded work remains Level 0/1. Level 2 is reserved for an explicitly
authorized long-running/repeated/provenance-sensitive workflow.

The presence of the standard does not authorize Level 2 work by itself.

## 12. Completion claims

Do not claim a task is complete unless the relevant checks were actually run and
the repository state supports the claim.

For documentation work, at minimum verify:

- decision/status consistency;
- inventory consistency;
- no stale document was silently promoted;
- no untested claim is presented as evidence.

## 13. Agent behavior

Agents must:

- preserve accepted terminology and boundaries;
- distinguish fact, evidence, inference, recommendation and decision;
- state uncertainty instead of inventing missing state;
- avoid unrelated cleanup;
- stop and surface conflicts with higher-authority documents;
- keep `AGENTS.md` and `CLAUDE.md` as thin pointers, not parallel governance.
