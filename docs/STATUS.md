# KAFENE Status

**Status:** CURRENT

This file is the current-state dashboard. It is not a diary and should be
updated only when project state materially changes.

## Current phase

**Product architecture consolidation before frontend implementation.**

The Discourse feasibility work has produced enough evidence to retain Discourse
as the community/forum substrate, but the earlier "Discourse as forum + guide
CMS + Ask AI knowledge core" model is no longer the accepted product shape.

## Accepted baseline

- KAFENE is Cyprus-first in deployment, but the product core is domain-agnostic and portable across markets.
- Market-specific country/state/city, languages, categories, currency, pricing and regulatory rules belong in deployment configuration.
- KAFENE is knowledge-first and community-backed.
- KAFENE website/knowledge layer and Discourse forum are separate connected
  surfaces.
- Guides, collections/hubs, journeys and official-change content belong on the
  KAFENE website.
- Forum discussions and community experience belong in Discourse.
- Multilingual Discourse semantic retrieval is validated.
- Native Discourse Ask AI is not accepted as production Ask KAFENE.
- "Changes" means verified official-rule/procedure/source changes.
- "News" is a separate current-events layer.
- Automated News/Changes pipelines are not current MVP blockers.
- Monetization preserves free canonical knowledge and is built around Business / Offer / Lead, sponsorship, subscriptions and affiliate/CPA where locally appropriate.
- A temporary Synthetic Community Bootstrap Layer is accepted for forum cold start; synthetic accounts must carry a persistent visible AI-persona label.

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

## Active documentation debt

The following are not current canonical architecture and require later
reconciliation:

- `docs/product/PRODUCT-REQUIREMENTS.md`
- `docs/architecture/ADR-001-FORUM-ENGINE.md`
- `docs/research/ENGINE-COMPARISON.md` (historical research input)

Do not treat them as higher authority than accepted decisions.

## Current active task

**Research the Synthetic Community Bootstrap Layer before implementation.**

The user explicitly changed priority from PRD reconciliation to the forum cold-start problem.

Current relevant docs:
- `docs/product/HOME-INTERACTION-MODEL.md` — CANONICAL, updated to permit labeled synthetic forum activity;
- `docs/research/SYNTHETIC-COMMUNITY-BOOTSTRAP-LAYER.md` — RESEARCH INPUT;
- `docs/product/MONETIZATION-MODEL.md` — ACTIVE DRAFT, unchanged.

The research pass must define persona continuity, memory, social graph, activity policy, orchestration, grounding, moderation, cost controls, and decay/retirement behavior before any production implementation.

## Deferred / not active

- automated News ingestion/deduplication/summarization;
- automated official-source Changes monitoring/diff pipeline;
- custom Ask KAFENE orchestration;
- deterministic authority/freshness reranking;
- Jev reranking;
- production-like living-knowledge automation;
- final city-specific services/business layer;
- ADR-001 acceptance in its current wording;
- Synthetic Community Bootstrap Layer implementation before completion of the research/spec pass.

## Open product decisions

- exact pricing/package assumptions in the monetization model;
- exact city landing/filter semantics and module set;
- production frontend/site technology;
- exact content-management model for standalone KAFENE guides;
- later Ask KAFENE architecture;
- exact synthetic persona state/memory model;
- synthetic population size and activity distribution;
- synthetic-to-human / synthetic-to-synthetic interaction policy;
- organic-activity thresholds for reducing or retiring synthetic participation.

## Next authorized step

Run the dedicated Synthetic Community Bootstrap Layer research pass and turn it into an implementation-ready specification and minimal Discourse spike plan.

Do **not** in the same task:
- implement the synthetic population in production;
- implement News automation;
- implement Changes monitoring;
- implement custom Ask KAFENE;
- revive Jev;
- accept ADR-001;
- expand the scope into a full frontend build.

After this research pass, return to PRD reconciliation unless the user changes priority again.
