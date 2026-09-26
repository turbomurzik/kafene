# KAFENE Product Requirements v0.1

Status: **DRAFT**

## North star

If someone has a practical question about Cyprus, KAFENE should be the first place they think to search or ask.

The product is knowledge-first, community-backed.

## P0 — required for first useful release

### Community
- Separate English and Russian content trees.
- Topics, replies, profiles, notifications, moderation and search.
- Q&A with accepted/solved answers.
- Mobile-first web experience.

### Canonical knowledge
- Canonical/living guides for high-value Cyprus intents.
- Guide freshness/status visible to users.
- Revision history.
- Official/source references.
- Community discussion attached to the guide rather than duplicated as separate SEO pages.

### Discovery
- Strong internal search.
- Question Gate before new-topic publication.
- Similar existing guides, solved questions and discussions shown before creating duplicates.
- Gate must fail open if AI/retrieval is unavailable.

### Cross-language knowledge transfer
- RU topic: Check EN side.
- EN topic: Check RU side.
- Retrieval must search the opposite language tree without merging the two communities.
- Results must link to the underlying source topics.

### Ask KAFENE
- Answers practical Cyprus questions from KAFENE's own corpus.
- Prefer canonical/current material to stale discussion.
- Route users to the underlying guide/topic.
- Not a general-purpose chatbot.

### Metadata
Minimum system metadata:
- language;
- domain/category;
- city where relevant;
- procedure/case type where relevant;
- topic_space_id;
- paired_topic_id for direct EN/RU guide pairs;
- last_verified;
- source_status.

### SEO
- One stable indexable URL per canonical language-specific guide.
- Self-canonical URLs.
- EN/RU paired guides eligible for hreflang.
- Ask/search/transient AI summary pages not indexable.
- Avoid mass-indexing machine translations of user discussions.

## P1 — immediately after core validation

- Source registry.
- Deterministic source snapshots/diffs.
- AI-assisted guide update proposals.
- Human approval for sensitive or material changes.
- Structured changelog.
- Cross-language summary caching.
- Business/expert groups and verification primitives.
- Analytics for Question Gate and Cyprus Question Coverage.

## P2 — later

- Qualified lead routing.
- Paid business/expert products.
- Rich business profiles.
- Advanced editorial workflow if wiki/topic model becomes insufficient.
- ACL-aware private RAG only if a real use case appears.
- Native apps only if PWA proves insufficient.

## Explicit non-goals for MVP

Do not build:
- a custom forum engine;
- a separate CMS unless proven necessary;
- a second vector database before native Discourse retrieval is tested;
- a marketplace;
- a booking engine;
- a social follower feed;
- native mobile apps.

## Architecture principles

1. Deterministic core first; AI only at semantic decision points.
2. Supported APIs and plugin extension points only.
3. No direct writes into forum DB.
4. No core forks.
5. Preserve provenance and revisions.
6. Treat source freshness and community experience as separate signals.
7. Measure custom-code surface area as a first-class product constraint.

## Current blocking decision

ADR-001 remains Proposed until the Discourse feasibility spike is run.
