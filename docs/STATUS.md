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
  as historical research inputs;
- ADR-001 принят как CANONICAL boundary contract между website и Discourse;
- P0 website↔Discourse integration contract принят как CANONICAL.
- ADR-002 принят как CANONICAL: Payload + Postgres являются CMS/content-storage
  stack для structured editorial knowledge.
- Payload/Postgres spike на закреплённом стеке завершён с результатом 6/6;
  UUID, relations, versions, localization и P0 per-locale publication semantics
  подтверждены.
- P0 initial content model не использует localized blocks.

## Активный архитектурный долг

ADR-001 принят и больше не является открытым долгом.

До frontend implementation остаются:

- frontend/runtime architecture decision;
- initial structured content schema/editorial workflow implementation design;
- exact search architecture across website and forum content;
- broader domain/integration semantics for `topic_space_id`;
- production IA mapping after separate validation.

Historical research documents remain preserved as research/evidence and are not
current architecture authority.

## Current active task

**Architecture closure.**

Current product documents:

- `docs/product/HOME-INTERACTION-MODEL.md` — CANONICAL
- `docs/product/PRODUCT-REQUIREMENTS.md` — ACTIVE DRAFT, reconciled current PRD
- `docs/product/MONETIZATION-MODEL.md` — ACTIVE DRAFT

ADR-001, P0 website↔Discourse integration contract и ADR-002 CMS/content-storage
приняты как CANONICAL.

Следующая активная архитектурная задача должна быть выбрана из оставшихся
frontend/runtime, search и IA mapping решений либо из initial content schema
design как bounded implementation-design task.

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

- production frontend/site technology;
- exact search architecture;
- exact city landing/filter semantics and module set;
- production IA mapping after validation;
- broader use/persistence semantics for `topic_space_id`;
- exact pricing/package assumptions in the monetization model;
- later Ask KAFENE architecture.

## Следующий разрешённый шаг

Выбрать и закрыть следующий минимальный архитектурный blocker перед frontend
implementation.

Допустимые кандидаты:

- frontend/runtime;
- initial content schema/editorial workflow design;
- search architecture;
- production IA mapping.

Задачу держать узкой и не смешивать несколько архитектурных решений в один
проход.

If the user explicitly changes priority, update this file accordingly.
