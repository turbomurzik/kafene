# Engine comparison — research synthesis

Status: **RESEARCH INPUT — historical pre-spike comparison**

Date of underlying research: 2026-09-26.

> Historical context: this document captures the pre-spike Discourse vs XenForo
> research synthesis. Live validation has since been completed. Where this
> document conflicts with measured spike evidence or accepted decisions, the
> evidence and `docs/00-DECISIONS.md` take precedence. This file is preserved as
> research history, not as current architecture authority.

## Historical result

At the time of the research, the analysis favored **one self-hosted Discourse instance** over XenForo for KAFENE.

This was not because Discourse was assumed to be universally a better forum. The perceived advantage was concentrated in the KAFENE-specific differentiators:

- official embeddings / semantic search;
- Ask AI;
- AI agents;
- wiki revisions;
- official Doc Categories;
- Solved;
- REST API / webhooks;
- supported plugin outlets.

The proposed minimum architecture at that stage was:

- Discourse as user/community/guide system of record;
- one thin `kafene-bridge` plugin;
- one external `kafene-orchestrator` for source monitoring, deterministic diff, AI governance and audit.

That proposal is historical. The current accepted product shape separates the
KAFENE website/knowledge layer from Discourse community/forum capabilities.

## Where XenForo was considered stronger

XenForo remained attractive for:

- classical forum structure;
- deep node trees;
- native question/article thread types;
- native custom thread fields.

It would have become more attractive if KAFENE had turned into a mostly classical forum and reduced the importance of Ask KAFENE, cross-language semantic retrieval and living-knowledge automation.

## Why Discourse led the pre-spike research

The research estimated substantially less custom semantic infrastructure because Discourse already provided an official AI/retrieval substrate.

The key thesis at the time was:

> KAFENE should spend custom engineering on Cyprus-specific knowledge orchestration, not on recreating forum/RAG plumbing that the platform can already provide.

## Claims that required live validation

The following were pre-spike claims to test, not accepted facts:

1. Semantic retrieval can be reliably constrained by language/category.
2. Multilingual embeddings are good enough for real EN/RU Cyprus queries.
3. Ask AI can favor current canonical guides over stale discussion.
4. Ask AI can produce stable source links/citations.
5. Authority boosting can be achieved without a bespoke external reranker.
6. Required custom fields can round-trip through supported plugin/API interfaces.
7. Question Gate and Check EN/RU can be implemented as thin supported integrations.

Live validation has since been completed. See
`docs/research/DISCOURSE-SPIKE-RESULTS.md` for measured evidence and
`docs/00-DECISIONS.md` for the accepted product consequences.

## Historical decision rule

The pre-spike decision rule was:

- PASS -> accept Discourse in ADR-001.
- CONDITIONAL PASS -> accept only if listed custom work stays thin and maintainable.
- FAIL -> reopen XenForo rather than forcing a custom Discourse RAG stack.

This rule is historical and no longer governs current architecture decisions.

See `DISCOURSE-FEASIBILITY-SPIKE.md` for the historical test protocol.
