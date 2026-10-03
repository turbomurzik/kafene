# KAFENE Status

**Status:** CANONICAL

This file is the current-state dashboard. It is not a diary and should be
updated only when project state materially changes.

## Current phase

**Architecture closure before frontend implementation.**

The Discourse feasibility work is complete. KAFENE retains Discourse as the
community/forum substrate, while the public website owns editorial knowledge
surfaces such as guides, journeys, collections/hubs, and verified Changes.

The earlier "Discourse as forum + guide CMS + Ask AI knowledge core" model is no
longer the accepted product shape.

## Accepted baseline

- KAFENE is Cyprus-first in deployment, but the product core is domain-agnostic
  and portable across markets.
- Market-specific country/state/city, languages, categories, currency, pricing,
  local sources, and regulatory rules belong in deployment configuration.
- KAFENE is knowledge-first and community-backed.
- KAFENE website/knowledge layer and Discourse forum are separate connected
  surfaces.
- Guides, collections/hubs, journeys, and official-change content belong on the
  KAFENE website.
- Forum discussions and community experience belong in Discourse.
- Multilingual Discourse semantic retrieval is validated.
- Native Discourse Ask AI is not accepted as production Ask KAFENE.
- "Changes" means verified official-rule/procedure/source changes.
- "News" is a separate current-events layer.
- Automated News/Changes pipelines are not current MVP blockers.
- Monetization preserves free canonical knowledge and is built around Business /
  Offer / Lead, sponsorship, subscriptions, and affiliate/CPA where locally
  appropriate.
- The reconciled product requirements define the current first-useful-release
  scope but remain an ACTIVE DRAFT until explicitly promoted.

See `docs/00-DECISIONS.md` for exact accepted decisions.

## Completed

- Discourse infrastructure/provisioning spike.
- multilingual semantic-search smoke test.
- 36-case EN/RU cross-language retrieval evaluation.
- native Ask AI authority/freshness test.
- Discourse spike evidence reconciliation.
- documentation governance baseline:
  - `PROJECT_RULES.md`
  - `docs/00-START-HERE.md`
  - `docs/00-DECISIONS.md`
  - `docs/00-DOCS-INVENTORY.md`
  - documentation/execution discipline standards.
- IA research reconciled and registered as RESEARCH INPUT.
- `docs/product/PRODUCT-REQUIREMENTS.md` reconciled against the accepted
  website/forum split, portable-core decisions, and canonical HOME interaction
  model.
- operational execution-discipline adoption reconciled with current governance.
- historical Discourse spike and engine-comparison documents marked explicitly
  as historical research inputs.

## Active documentation / architecture debt

The following still require architecture closure or later reconciliation:

- `docs/architecture/ADR-001-FORUM-ENGINE.md` — stale in part and must be
  rewritten or superseded before acceptance.
- production website↔Discourse integration contract / ADR.
- frontend/runtime architecture decision.
- website CMS/content-storage and editorial workflow decision.
- exact search architecture across website and forum content.
- broader domain/integration semantics for `topic_space_id`.
- production IA mapping after separate validation.

Historical research documents remain preserved as research/evidence and are not
current architecture authority.

## Current active task

**Architecture closure.**

Current product documents:

- `docs/product/HOME-INTERACTION-MODEL.md` — CANONICAL
- `docs/product/PRODUCT-REQUIREMENTS.md` — ACTIVE DRAFT, reconciled current PRD
- `docs/product/MONETIZATION-MODEL.md` — ACTIVE DRAFT

The next work should close the stale forum-engine ADR and define the
website↔Discourse architecture boundary before frontend implementation.

## Deferred / not active

- automated News ingestion/deduplication/summarization;
- automated official-source Changes monitoring/diff pipeline;
- custom Ask KAFENE orchestration;
- deterministic authority/freshness reranking;
- Jev reranking;
- production-like living-knowledge automation;
- final city-specific services/business layer;
- exact Cyprus pricing/package implementation;
- multi-deployment administration UI.

## Open product / architecture decisions

- final replacement/rewrite of ADR-001;
- production website↔Discourse integration contract;
- production frontend/site technology;
- exact content-management model for standalone KAFENE guides;
- exact search architecture;
- exact city landing/filter semantics and module set;
- production IA mapping after validation;
- broader use/persistence semantics for `topic_space_id`;
- exact pricing/package assumptions in the monetization model;
- later Ask KAFENE architecture.

## Next authorized step

Rewrite or supersede `docs/architecture/ADR-001-FORUM-ENGINE.md` so it reflects
the accepted website/forum separation and no longer proposes Discourse as the
whole-product knowledge core.

Keep that task bounded. Do **not** in the same task:

- choose the frontend stack;
- choose the CMS/content-storage implementation;
- implement website↔Discourse integration;
- implement News or Changes automation;
- implement custom Ask KAFENE;
- revive Jev;
- expand the scope into a frontend build.

If the user explicitly changes priority, update this file accordingly.
