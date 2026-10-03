# KAFENE Product Requirements

Status: **ACTIVE DRAFT**

## Purpose and authority

This document defines the product requirements for KAFENE's first useful
release and separates current MVP scope from later work.

It is subordinate to:

- `PROJECT_RULES.md`;
- `docs/00-DECISIONS.md`;
- `docs/STATUS.md`;
- `docs/product/HOME-INTERACTION-MODEL.md` for homepage behavior.

The information-architecture research in
`docs/research/KAFENE-INFORMATION-ARCHITECTURE-RESEARCH.md` may inform later
taxonomy validation, but it is `RESEARCH INPUT`, not a product decision or a
canonical specification.

This PRD does not choose a frontend stack, CMS, or website content-storage
implementation. It does not accept or replace ADR-001.

## Product framing

### North star

KAFENE is a knowledge-first, community-backed platform. If someone has a
practical question about Cyprus, KAFENE should be the first place they think to
search or ask.

### Portable core and deployment configuration

The product core must remain domain-agnostic and portable across markets.
Cyprus is the first deployment, not a hard-coded boundary of the product.

The portable core may define reusable entities and mechanics such as:

- guides;
- journeys;
- collections / hubs;
- changes;
- news;
- discussions;
- localities;
- businesses;
- offers;
- leads;
- sponsorship / commercial placements;
- subscriptions;
- analytics events.

Deployment configuration owns market-specific values, including:

- country, state, city, and locality hierarchy;
- brand and presentation configuration;
- supported languages;
- guide, community, and business categories;
- currency and pricing;
- local sources and partners;
- regulatory and commercial constraints.

The core must not assume Cyprus, EN/RU, euro pricing, specific cities, or local
regulatory rules are universal product constants.

## Product surfaces

KAFENE consists of two separate, connected product surfaces.

### KAFENE website / knowledge layer

The website owns:

- homepage / live market dashboard;
- search and discovery;
- standalone guide pages;
- journeys;
- collections / hubs;
- verified change records;
- the structured guides index;
- city / locality entry points;
- editorial knowledge and its localization;
- future News and custom Ask KAFENE surfaces when separately authorized.

### KAFENE community / Discourse

Discourse owns:

- questions and discussions;
- replies and accepted / solved answers;
- profiles and notifications;
- community experience;
- moderation and permissions;
- forum search and multilingual semantic community retrieval.

Discourse is not the system of record for website/editorial knowledge. It
remains the system of record for forum/community content. Website editorial
content and forum community content may link to each other without becoming the
same content object or rendering surface.

### Cross-surface linkage

`topic_space_id` is the accepted linkage and deduplication key for homepage
behavior and the cross-surface relationships covered by the canonical
`docs/product/HOME-INTERACTION-MODEL.md`. Within that accepted scope it supports:

- linking guides, journeys, collections, changes, and relevant discussions;
- homepage cross-block and cross-surface deduplication;
- navigation from canonical knowledge to community experience;
- navigation from forum discussions to authoritative/current website content.

Broader use of `topic_space_id` as a domain-wide identity or integration key,
including its persistence and adapter design, remains an open architecture
decision. Within the accepted homepage scope, exact destination matching must
still work where a forum item has no `topic_space_id` mapping.

## Language model

### Website/editorial knowledge

Editorial knowledge uses a shared product entity and editorial selection with
RU/EN localization by default. A guide, journey, collection, or change is not
duplicated into independent RU and EN product trees merely because it has two
language representations.

Language-specific editorial items are allowed when the audience, legal route,
source evidence, or practical answer genuinely differs.

### Forum/community

EN and RU community trees remain separate in Discourse. Their topics, feeds,
and moderation contexts must not be silently merged.

Cross-language semantic retrieval may search or recommend content from the
other community tree. Results must retain their source language and link to the
underlying forum topic. Retrieval does not merge the community trees or turn
one language's discussion into canonical knowledge for the other.

## P0 — first useful release

P0 is the minimum coherent release that makes KAFENE useful for finding current
practical knowledge and accessing community experience. It must not depend on
deferred automation or a production answer-generation layer.

### Website homepage and discovery

`docs/product/HOME-INTERACTION-MODEL.md` is the authoritative interaction
contract for homepage blocks, selection, destinations, cold start, dedup,
fallbacks, language behavior, analytics, and graceful degradation. This PRD
does not duplicate those mechanics.

P0 must provide:

- a stable homepage with search as the primary entry point;
- a structured `/guides` index;
- standalone journey pages;
- collection / hub pages;
- configured city / locality entry points;
- a visible entry point to the full Discourse forum;
- website-to-forum and forum-to-website navigation where useful;
- `topic_space_id`-based linkage and dedup where mappings exist.

The homepage must continue to provide a useful editorial/search surface when
Discourse or other dynamic blocks are unavailable.

### Search

P0 must provide a usable KAFENE search entry point for website knowledge.
Community results may be integrated after the production website↔Discourse
boundary is defined in a separate ADR or integration contract. The exact search
implementation remains an open architecture decision.

Search must:

- link to underlying guide, journey, collection, change, or forum destinations;
- preserve the distinction between editorial knowledge and community content;
- remain available when optional homepage blocks fail;
- not present an AI-generated answer layer as if custom Ask KAFENE were live.

### Guides and editorial knowledge

Guides are standalone KAFENE website pages. A guide page must be able to show,
where applicable:

- the current practical answer or summary;
- requirements and eligibility context;
- ordered steps;
- costs and time expectations;
- official or otherwise appropriate sources;
- `last_verified` and verification state;
- relevant verified changes;
- related journeys or collections;
- a link to relevant community discussion.

Forum discussion provides lived experience and edge cases; it is not the body
of the guide.

The `/guides` route must work as a stable, structured editorial index even
before usage analytics are sufficient for popularity ranking. Guide grouping
and filtering may use deployment-configured domains, localities, procedure
types, case types, and language representations. It must not be required to
mirror the Discourse category tree.

Each published guide language representation should have a stable, indexable
URL. Direct localizations should support appropriate language relationships
such as `hreflang`. Search pages, transient summaries, and forum discussion
translations must not create uncontrolled duplicate indexable pages.

### Journeys and collections / hubs

Journeys organize multi-step user goals and may assemble guides, collections,
verified changes, and relevant forum discussions.

Collections / hubs organize an important topic without reducing it to one guide
or one forum thread. They may provide a current summary, related guides,
verified changes, source/freshness information, and community links.

Both are website/editorial entities with RU/EN localization by default.

### Changes and News

`Change` and `News` are different product concepts:

- a **Change** is a verified change to an official rule, procedure, source,
  requirement, form, tariff, or deadline, normally connected to affected
  guides;
- **News** is a separate current-events/reporting layer.

P0 may use manually created and editorially verified Change content. News is
not required for P0. Automated News ingestion and automated official-source
monitoring/diffing remain deferred.

### Community

P0 retains Discourse as the community/forum substrate. Production
website↔Discourse integration must be defined in a separate ADR or integration
contract.

The community surface must provide:

- separate EN and RU community trees;
- topics, replies, profiles, notifications, and moderation;
- Q&A / accepted or solved-answer mechanics where configured;
- stable links from the website to relevant discussions;
- stable links or affordances from discussions to relevant website knowledge
  where the mapping exists.

P0 must not depend on unsupported direct database coupling. The exact
API, webhook, cache, synchronization, and authentication design remains open
architecture work. Cross-language semantic retrieval is allowed without merging
community trees.

### Analytics and observability

Minimum event logging is part of P0. It must be sufficient to observe core
navigation and later improve ranking without requiring a heavy analytics
platform.

The canonical HOME INTERACTION MODEL owns the exact homepage events, properties,
bootstrap thresholds, and fallback observability, including degradation
logging. The broader event model should remain extensible for later
monetization events without requiring them all in P0.

### Monetization readiness

Free canonical knowledge and the basic community experience remain the
acquisition foundation. P0 must not paywall canonical guides.

The portable product model must leave room for these commercial primitives:

- `Business`;
- `Offer`;
- `Lead`;
- sponsorship / commercial placement;
- subscription;
- monetization analytics events.

P0 does not require a marketplace, booking engine, business self-service
portal, billing system, or full lead-routing workflow. Specific prices,
packages, currencies, and regulated-category lead/referral economics belong to
deployment configuration and later compliance decisions, not universal product
requirements.

Any commercial presentation introduced later must be disclosed and must not
change editorial truth or canonical knowledge ranking.

## P1 — immediately after first-release validation

P1 work is activated by evidence from the first useful release rather than by
assumption. Candidate P1 scope includes:

- refine homepage and guide ranking using observed analytics while preserving
  editorial control and deterministic fallback;
- validate and refine guide, community, locality, and intent taxonomy using
  real search/navigation data and separate user validation;
- strengthen manual editorial workflow, source registry, review ownership, and
  structured changelog without requiring automated monitoring;
- improve website/forum linkage coverage and cross-language community discovery;
- add a fail-open similar-content or Question Gate experience if supported
  interfaces and measured user need justify it;
- introduce limited business/expert verification, profiles, disclosures, or
  commercial CTA pilots after the relevant policy and compliance work;
- extend analytics for content coverage, discovery quality, and approved
  commercial experiments.

P1 does not automatically activate custom Ask KAFENE, automated News/Changes,
Jev, or production living-knowledge automation.

## P2 — later, separately authorized

Potential later work includes:

- custom Ask KAFENE with a separately accepted architecture and authority /
  freshness behavior;
- automated News ingestion, deduplication, and summarization;
- automated official-source monitoring, deterministic diff, and guide-update
  proposals;
- deterministic authority/freshness reranking and, only if justified by
  measured improvement, Jev experimentation;
- richer business directory, offers, qualified lead routing, sponsorship, and
  consumer Premium;
- self-service billing and business administration;
- multi-deployment administration tooling;
- advanced personalization;
- ACL-aware private retrieval only if a concrete use case exists;
- native applications only if the web/PWA experience proves insufficient.

P2 items are not authorized merely because they appear in this document.

## Ask KAFENE boundary

Native Discourse Ask AI is not the production Ask KAFENE answer layer. The live
spike did not demonstrate the required canonical-over-stale authority behavior.

Custom Ask KAFENE is deferred. It is not a P0 requirement, must not be presented
as available in the MVP UI, and requires a separate architecture decision
before implementation.

Ordinary search and community semantic retrieval must remain useful without it.

## Explicit non-goals for the first useful release

Do not make P0 depend on or expand P0 into:

- a custom forum engine;
- Discourse as a website guide CMS or knowledge system of record;
- a Discourse core fork or direct forum-database writes;
- custom Ask KAFENE;
- native Discourse Ask AI as the KAFENE answer layer;
- automated News ingestion or summarization;
- automated Changes monitoring, source diffing, or guide patching;
- Jev or another reranking experiment;
- a P0 dependency on a second vector database;
- autonomous content generation or publication;
- a marketplace or booking engine;
- self-service billing;
- a full CRM or business portal;
- native mobile applications;
- multi-market administration UI;
- a social follower feed;
- a production-like living-knowledge automation workflow.

The website requires a content-storage/editorial implementation, but this PRD
does not choose one and does not prohibit a separate CMS or another suitable
website content model.

Whether a later capability requires a second vector database remains a separate
architecture decision.

## Architecture and product constraints

1. Preserve the accepted website/forum separation.
2. Keep the portable core separate from deployment configuration.
3. Record the production website↔Discourse integration boundary in a separate
   ADR or integration contract.
4. Do not make P0 depend on unsupported direct database coupling. Exact API,
   webhook, cache, synchronization, and authentication design remains open
   architecture work.
5. Preserve source provenance, freshness state, revision history, and language
   identity where applicable.
6. Treat source freshness, editorial authority, and community experience as
   distinct signals.
7. Prefer deterministic behavior for selection, deduplication, fallbacks, and
   mechanical transformations.
8. Use AI only where a separately authorized semantic capability requires it;
   P0 must have non-AI fallbacks.
9. Keep custom code and operational surface area proportionate to current
   requirements.
10. Do not make deferred automation a hidden dependency of the first release.

## First useful release readiness criteria

### Ready to begin implementation

Implementation of a concrete scope may begin when:

- the scoped work follows this P0 boundary and the canonical HOME INTERACTION
  MODEL;
- if that scope depends on frontend/runtime or website content storage, the
  corresponding architecture decision has been recorded; independent
  documentation, integration-planning, and spike tasks are not blocked by those
  choices;
- initial deployment configuration identifies supported languages, localities,
  and content categories without hard-coding them into the portable core;
- if that scope implements production website↔Discourse integration, its ADR or
  integration contract defines the required boundary; exploratory planning and
  spike work are not blocked by that contract;
- deferred capabilities are not prerequisites for the implementation plan.

### Ready to complete the first useful release

The first useful release is ready only when:

- the separate website/knowledge and Discourse/community surfaces are
  implemented and visibly connected;
- canonical guide, journey, and collection/hub pages render as website content;
- `/guides` provides a usable structured index;
- search reaches useful website knowledge destinations and preserves content
  provenance/type;
- the production Discourse integration defined by its ADR or integration
  contract provides community entry points and the required forum-driven
  surfaces;
- `topic_space_id` linkage works for mapped cross-surface content and homepage
  deduplication;
- homepage behavior conforms to the canonical HOME INTERACTION MODEL;
- minimum event logging and homepage fallback/degradation observability work;
- the product degrades gracefully when Discourse or optional dynamic sources
  are unavailable;
- RU/EN editorial localization and separate EN/RU forum-tree behavior conform
  to the accepted language model;
- published guides can expose sources, `last_verified`, requirements/steps,
  relevant changes, and related community discussion where applicable;
- the release does not depend on custom Ask KAFENE, automated News, automated
  Changes monitoring, Jev, or other deferred automation.

Passing these product criteria does not by itself select or validate a specific
frontend stack, CMS, or later automation architecture.

## Open architecture and product questions

The following remain open and are not decided by this PRD:

- production frontend/site technology;
- website CMS / content-storage and editorial workflow implementation;
- production website↔Discourse integration contract, including exact API,
  webhook, cache, synchronization, and authentication design;
- exact search architecture across website and forum content;
- broader domain/integration use and persistence semantics for `topic_space_id`;
- exact city/locality landing modules and filtering semantics;
- production mapping of the IA research into website navigation and Discourse
  categories/tags after separate validation;
- final replacement/rewrite of ADR-001;
- custom Ask KAFENE architecture;
- automated News and Changes architectures;
- authority/freshness reranking approach;
- whether any later capability requires a second vector database;
- exact multi-deployment administration model;
- commercial disclosure UI, Cyprus pricing/packages, and regulated-category
  lead/referral rules.

Until separately decided, these questions must not be filled by inference from
research notes, draft monetization assumptions, or implementation convenience.
