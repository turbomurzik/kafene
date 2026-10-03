# KAFENE Documentation Discipline v1.0

Status: **STANDARD**

## Purpose

Prevent documentation drift, duplicate "latest" files, stale architecture claims
and research notes silently becoming product truth.

This standard applies to durable project documentation in the KAFENE repository.

`PROJECT_RULES.md` is the higher-authority repository governance source. This standard is subordinate to it and may not create competing governance or authorize product work independently.

## 1. Canonical source

GitHub is the canonical source of truth for KAFENE project documentation.

Chat output, local notes, exported files and temporary prototypes are not
canonical until they are committed to the repository and registered in
`docs/00-DOCS-INVENTORY.md`.

## 2. Required control documents

The documentation control surface consists of:

1. `PROJECT_RULES.md`
2. `docs/STATUS.md`
3. `docs/00-DECISIONS.md`
4. `docs/00-DOCS-INVENTORY.md`
5. `docs/00-START-HERE.md` as onboarding

These files define governance, current state, accepted decisions, document status and onboarding.

## 3. One-question / one-current-document rule

Each durable product, architecture or operational question should have one
current authoritative document.

Do not create:
- `*-v2-final.md`
- `*-new.md`
- `*-updated.md`
- parallel architecture notes
- a second "current" document for the same question

when the existing current document can be updated.

A new document is justified only when it has a distinct durable scope.

## 4. Required statuses

Every durable document must be registered in the inventory with exactly one
status:

- **CANONICAL** — accepted source of truth for its scope.
- **ACTIVE DRAFT** — current work, not yet authoritative.
- **EVIDENCE** — measured/tested factual record.
- **RESEARCH INPUT** — analysis that informs decisions but is not itself a decision.
- **DEFERRED** — intentionally postponed work.
- **SUPERSEDED** — replaced and retained only for history.
- **OPERATIONS** — operational procedure/instructions.
- **STANDARD** — governing standard.

Do not infer authority from file date, commit date, filename or recency.

## 5. Research closure rule

A completed research/spike workstream must end in at least one of:

1. update to a canonical/current product or architecture document;
2. accepted/rejected decision in `docs/00-DECISIONS.md`;
3. explicit DEFERRED or SUPERSEDED status.

A completed research document must not remain as an ambiguous "latest" source.

## 6. Decision rule

Research, evidence and recommendations are not decisions.

Accepted decisions belong in `docs/00-DECISIONS.md`.

A decision entry should include:
- decision;
- status;
- evidence/reference when relevant;
- important consequences or boundary;
- unresolved follow-up only when necessary.

Do not copy long research bodies into the decision log.

## 7. Evidence rule

Measured results belong in evidence documents.

Evidence must distinguish:
- tested;
- not tested;
- failed;
- inferred/unknown.

Do not fill unrun sections with assumptions to make a document look complete.

## 8. Conflict rule

If two documents conflict:

1. stop;
2. check the source-of-truth hierarchy;
3. identify which document is stale;
4. update the inventory/status;
5. do not silently synthesize a third interpretation.

## 9. New-document gate

Before creating a durable document, check:

1. Does an existing current document already own this question?
2. Can the existing document be updated instead?
3. Is the new scope genuinely distinct?
4. What status will the new file have?
5. Will it be registered in the inventory in the same change?

If these questions are not answered, do not create the file.

## 10. Same-change rule

Any durable documentation change that:
- creates a new document;
- changes canonical status;
- supersedes a document;
- changes the accepted source of truth;

must update `docs/00-DOCS-INVENTORY.md` in the same change.

If a product/architecture decision changes, update
`docs/00-DECISIONS.md` in the same change.

## 11. Archive rule

Do not delete stale documentation merely to tidy the tree.

First:
1. replace it with a current source;
2. mark it SUPERSEDED;
3. update references;
4. then archive/remove only in a dedicated cleanup.

## 12. Agent rule

Agents must read:

1. `PROJECT_RULES.md`
2. `docs/STATUS.md`
3. `docs/00-DECISIONS.md`
4. `docs/00-DOCS-INVENTORY.md`

before durable product/architecture documentation work.

Agents must not create new governance or parallel documentation structures.

## 13. Minimum-discipline principle

This standard exists to reduce documentation overhead, not increase it.

Prefer:
- fewer documents;
- clearer ownership;
- explicit status;
- short decisions;
- evidence separated from conclusions.

Do not create process documents unless they prevent a real recurring failure.
