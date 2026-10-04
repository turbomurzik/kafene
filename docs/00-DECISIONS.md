# KAFENE Decisions

Status: **CANONICAL**

Only accepted project decisions belong here. Research hypotheses, future ideas and unresolved choices do not.

## DEC-001 — Product north star

**Decision:** KAFENE is a Cyprus-first, knowledge-first, community-backed platform. If someone has a practical question about Cyprus, KAFENE should be the first place they think to search or ask.

**Status:** ACCEPTED.

## DEC-002 — Discourse is the community/forum substrate, not the whole product

**Decision:** Retain self-hosted Discourse for community discussions, users, moderation, Q&A/forum mechanics and semantic community retrieval.

The public KAFENE knowledge website is not required to use Discourse as its CMS or page renderer.

**Evidence:**
- infrastructure spike: `110d08a352511ca80374d189098bd9da3e01f172`
- AI smoke test: `aec5dda3ca169124348fe542753dbe9831f3baba`
- 36-case retrieval evaluation: `a8981afd48385048409c8c78569182adc0e6fe09`

**Status:** ACCEPTED for the current product direction.

## DEC-003 — Website knowledge layer and forum are separate surfaces

**Decision:** Guides, collections/hubs, journeys, official-change entries and other editorial knowledge pages live on the KAFENE website. Forum discussions live in Discourse. The two surfaces link to each other when useful, but guides are not forum topics by default.

**Status:** ACCEPTED.

## DEC-004 — Native Discourse Ask AI is not the production Ask KAFENE layer

**Decision:** Do not use native Discourse Ask AI as the production answer layer for KAFENE.

The controlled freshness/authority test did not demonstrate reliable preference for canonical current content: canonical guides were cited in 0/3 cases.

Custom Ask KAFENE remains a later workstream.

**Evidence:** `067707b7e5e2dc669225a6563a5aaf3acb6ec0fe`.

**Status:** ACCEPTED.

## DEC-005 — "Changes" and "News" are different content concepts

**Decision:**
- **Changes** represent verified changes in official rules/procedures/sources and are primarily tied to canonical guides.
- **News** represents current events/reporting and is a separate content layer.

For MVP, either may be editorial/manual. Automated monitoring/aggregation pipelines are deferred and must be scoped separately before implementation.

**Status:** ACCEPTED at concept level; automation DEFERRED.

## DEC-006 — Documentation discipline

**Decision:** KAFENE uses `PROJECT_RULES.md` as the single canonical repository-governance source. `docs/STATUS.md` is the current-state dashboard; `docs/00-DECISIONS.md` records accepted product/architecture decisions; `docs/00-DOCS-INVENTORY.md` records durable document status; `docs/00-START-HERE.md` is onboarding only. Research is not canonical by default. New durable documents must be registered in the inventory, and existing current documents should be updated instead of creating parallel "latest" variants. `AGENTS.md` and `CLAUDE.md` are thin entry stubs and may not create competing governance.

**Status:** ACCEPTED.

## Open decisions — not yet accepted

- exact city-page module set and city filtering semantics beyond "not a separate forum taxonomy";
- production website/frontend technology;
- News aggregation pipeline;
- automated official-source Changes pipeline;
- custom Ask KAFENE architecture;
- deterministic authority/freshness reranking;
- Jev integration;
- final replacement/rewrite of ADR-001;
- exact Cyprus pricing/packages and regulated-category lead rules;
- exact multi-deployment administration model;
- exact Synthetic Community Bootstrap Layer persona/memory/orchestration architecture and organic-activity decay thresholds.


## DEC-007 — Portable domain-agnostic core

**Decision:** KAFENE must separate a portable product core from market-specific deployment configuration.

Portable core may define generic entities and mechanics such as guides, journeys, collections, changes, discussions, localities, businesses, offers, leads, sponsorship placements, subscriptions and analytics events.

Market-specific configuration contains country/state/city hierarchy, brand, languages, categories, currency, pricing, local sources, regulatory constraints and partner configuration.

Cyprus is the first deployment, not a hard-coded domain boundary of the core. A later deployment such as New York must be possible without redesigning the core entity model.

**Status:** ACCEPTED.

## DEC-008 — Monetization follows high-intent actions, not paywalled knowledge

**Decision:** KAFENE monetization should preserve the free knowledge/community acquisition loop and monetize high-intent next actions.

Accepted revenue families:
- paid business/expert profiles;
- clearly disclosed sponsorship placements;
- qualified lead routing where locally permitted;
- optional consumer Premium;
- affiliate/CPA where appropriate.

Programmatic display advertising is not the primary business model.

Portable commercial primitives to preserve in the architecture:
- `Business`;
- `Offer`;
- `Lead`;
- sponsorship/commercial placement;
- subscription;
- monetization analytics events.

Specific prices, package boundaries and regulated-category lead economics remain deployment-specific working assumptions, not universal core rules.

**Status:** ACCEPTED.


## DEC-009 — Canonical MVP Home Interaction Model

**Decision:** `docs/product/HOME-INTERACTION-MODEL.md` is accepted as the canonical MVP interaction model for the KAFENE homepage/dashboard.

It includes:
- block sources, selection, click targets, update and fallback behavior;
- page-wide degradation and day-zero floor;
- cross-block dedup using `topic_space_id`;
- deterministic cold-start behavior for forum activity;
- bootstrap threshold for usage-ranked Popular Guides;
- minimum analytics and degradation observability;
- RU/EN editorial localization model;
- portable/domain-agnostic deployment constraints.

Future changes that materially alter these semantics require an explicit decision update.

**Status:** ACCEPTED.


## DEC-010 — Synthetic Community Bootstrap Layer

**Decision:** KAFENE will use a temporary **Synthetic Community Bootstrap Layer** as an accepted cold-start mechanism for the Discourse community.

Synthetic participants may use the ordinary forum action surface, including creating topics, asking questions, replying, reacting/liking, quoting, following discussions, returning to older threads, editing/correcting their posts, disagreeing, changing views over time, and interacting with human or synthetic participants.

Synthetic accounts must carry a persistent visible provenance label in the user interface. For the Cyprus deployment the RU label is **ИИ-персонаж** and the EN equivalent is **AI persona**. The label must not be removable by the persona.

Synthetic actions are real platform actions and may contribute normally to Discourse activity counters. KAFENE must not separately invent counters or events that did not occur in the platform.

The layer is intended for controlled bootstrap, not as a permanent substitute for organic community. Its share of initiation/activity should decline as real participation becomes self-sustaining.

Exact persona state, memory, social graph, scheduling, orchestration, grounding, moderation, cost controls and decay thresholds require a separate research pass before implementation.

**Research input:** `docs/research/SYNTHETIC-COMMUNITY-BOOTSTRAP-LAYER.md`

**Status:** ACCEPTED at product-concept level; implementation RESEARCH REQUIRED.
