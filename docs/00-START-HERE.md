# KAFENE Documentation Start Here

Status: **CANONICAL**

This file defines how to read KAFENE documentation.

## Source-of-truth order

For project work, read in this order:

1. `docs/00-START-HERE.md`
2. `docs/00-DECISIONS.md`
3. `docs/00-DOCS-INVENTORY.md`
4. the current document for the specific workstream
5. evidence/research documents only as supporting material

If two documents conflict, do not silently reconcile them. Follow the higher source in this hierarchy and flag the conflict.

## Documentation rule

One question should have one current authoritative document.

Do not create a new document when an existing current document can be updated.
Do not make a research note canonical merely because it is newer.

Every durable document must be registered in `docs/00-DOCS-INVENTORY.md` with one of these statuses:

- **CANONICAL**
- **ACTIVE DRAFT**
- **EVIDENCE**
- **RESEARCH INPUT**
- **DEFERRED**
- **SUPERSEDED**
- **OPERATIONS**
- **STANDARD**

When a research/spike workstream ends, it must do at least one of:

1. update a current canonical document;
2. create/update a decision in `docs/00-DECISIONS.md`;
3. be marked DEFERRED or SUPERSEDED in the inventory.

It must not remain an ambiguous "latest" document.

## Current project state

KAFENE is moving from feasibility research into product construction.

Current accepted direction:

- the public KAFENE website/knowledge layer and the community forum are separate product surfaces;
- Discourse is retained as the forum/community substrate;
- multilingual semantic retrieval on Discourse has been validated;
- native Discourse Ask AI is not accepted as the production Ask KAFENE answer layer;
- guides, collections, journeys and official-change content are intended to live on KAFENE website pages, with contextual links to forum discussions;
- custom Ask KAFENE, automated News, automated Changes and Jev reranking are not current MVP implementation blockers.

See `docs/00-DECISIONS.md` for exact decisions and evidence references.

## Current documents to treat cautiously

- `docs/product/PRODUCT-REQUIREMENTS.md` is an ACTIVE DRAFT and still contains assumptions from the earlier "Discourse as knowledge core" model.
- `docs/architecture/ADR-001-FORUM-ENGINE.md` is PROPOSED and stale in part. Do not accept it in its current wording.
- `docs/research/ENGINE-COMPARISON.md` is historical research input.
- `docs/research/DISCOURSE-FEASIBILITY-SPIKE.md` is the historical test protocol; measured results live in `DISCOURSE-SPIKE-RESULTS.md`.

## Agent rule

Before adding a new durable documentation file, check the inventory and update an existing current document if possible. If a new file is genuinely necessary, register it in the inventory in the same change.
