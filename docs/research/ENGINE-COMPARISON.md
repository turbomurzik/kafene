# Engine comparison — research synthesis

Status: **research input, pending live validation**

Date of underlying research: 2026-09-26.

## Current result

The research favors **one self-hosted Discourse instance** over XenForo for KAFENE.

This is not because Discourse is universally a better forum. The advantage is concentrated in the KAFENE-specific differentiators:

- official embeddings / semantic search;
- Ask AI;
- AI agents;
- wiki revisions;
- official Doc Categories;
- Solved;
- REST API / webhooks;
- supported plugin outlets.

The proposed minimum architecture is:

- Discourse as user/community/guide system of record;
- one thin `kafene-bridge` plugin;
- one external `kafene-orchestrator` for source monitoring, deterministic diff, AI governance and audit.

## Where XenForo is stronger

XenForo remains attractive for:

- classical forum structure;
- deep node trees;
- native question/article thread types;
- native custom thread fields.

It becomes more attractive if KAFENE turns into a mostly classical forum and reduces the importance of Ask KAFENE, cross-language semantic retrieval and living-knowledge automation.

## Why Discourse currently leads

The research estimates substantially less custom semantic infrastructure because Discourse already provides the official AI/retrieval substrate.

The key thesis is:

> KAFENE should spend custom engineering on Cyprus-specific knowledge orchestration, not on recreating forum/RAG plumbing that the platform can already provide.

## Claims that must not be accepted without the spike

1. Semantic retrieval can be reliably constrained by language/category.
2. Multilingual embeddings are good enough for real EN/RU Cyprus queries.
3. Ask AI can favor current canonical guides over stale discussion.
4. Ask AI can produce stable source links/citations.
5. Authority boosting can be achieved without a bespoke external reranker.
6. Required custom fields can round-trip through supported plugin/API interfaces.
7. Question Gate and Check EN/RU can be implemented as thin supported integrations.

## Decision rule

- PASS -> accept Discourse in ADR-001.
- CONDITIONAL PASS -> accept only if listed custom work stays thin and maintainable.
- FAIL -> reopen XenForo rather than forcing a custom Discourse RAG stack.

See `DISCOURSE-FEASIBILITY-SPIKE.md` for the test protocol.
