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

**Decision:** KAFENE uses a source-of-truth hierarchy with `00-START-HERE.md`, `00-DECISIONS.md` and `00-DOCS-INVENTORY.md`. Research is not canonical by default. New durable documents must be registered in the inventory, and existing current documents should be updated instead of creating parallel "latest" variants.

**Status:** ACCEPTED.

## Open decisions — not yet accepted

- exact HOME INTERACTION MODEL for MVP;
- exact city-page module set and city filtering semantics beyond "not a separate forum taxonomy";
- production website/frontend technology;
- News aggregation pipeline;
- automated official-source Changes pipeline;
- custom Ask KAFENE architecture;
- deterministic authority/freshness reranking;
- Jev integration;
- final replacement/rewrite of ADR-001.
