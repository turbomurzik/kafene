# ADR-001: Forum / Knowledge Core

Status: **PROPOSED — DO NOT ACCEPT BEFORE SPIKE**

Date: 2026-09-26

## Context

KAFENE needs:

- separate EN/RU community trees;
- discussions and Q&A;
- canonical/living guides;
- semantic Question Gate;
- cross-language retrieval;
- Ask KAFENE over first-party corpus;
- metadata and freshness state;
- strong SEO;
- minimal custom platform code.

Two serious candidates were researched: XenForo and Discourse.

The current research favors Discourse because the differentiating KAFENE capabilities align with official Discourse AI, embeddings, Ask AI, wiki/Doc Categories, Solved, REST API, webhooks and supported plugin extension points.

However, several central claims are implementation-sensitive and must be tested before platform lock-in.

## Candidate decision

Use **one self-hosted Discourse instance** as the forum and knowledge system of record.

Proposed shape:

```text
Discourse
  ├── EN content tree
  ├── RU content tree
  ├── Wiki / Guides
  ├── Solved Q&A
  ├── Discourse AI / embeddings / Ask AI
  └── users / moderation / revisions / SEO
          │
          ▼
kafene-bridge
          │
          ▼
kafene-orchestrator
  ├── source monitoring
  ├── deterministic diff
  ├── guide update proposals
  ├── cross-language orchestration
  ├── publication governance
  └── audit
```

## Why not accepted yet

The following require live validation:

1. category-scoped semantic retrieval;
2. EN/RU multilingual retrieval quality;
3. Ask AI authority/freshness behavior;
4. source links/citations;
5. guide/solved boosting without a second RAG stack;
6. stable plugin/API access for KAFENE metadata.

## Alternatives

### XenForo

Strengths:

- stronger classical forum structure;
- native thread types;
- native custom thread fields;
- mature forum UX.

Costs for KAFENE:

- no equivalent official semantic/RAG/Ask-AI stack;
- more custom retrieval infrastructure;
- likely more third-party dependencies for wiki/knowledge behavior.

### Custom forum

Rejected.

KAFENE should not spend engineering effort reproducing users, topics, moderation, permissions, notifications, revisions, search basics and forum administration.

## Acceptance condition

This ADR can become **ACCEPTED** only if `DISCOURSE-SPIKE-RESULTS.md` records PASS or an acceptable CONDITIONAL PASS.

If the result is FAIL, reopen XenForo evaluation rather than forcing Discourse.

## Consequences if accepted

- Discourse is the system of record for users and community/guide content.
- No direct DB writes from KAFENE services.
- No Discourse core patches.
- Custom UI uses supported Plugin API/outlets.
- KAFENE-specific governance/source data lives outside Discourse.
- A second vector index is prohibited in MVP unless the spike demonstrates a concrete native limitation.
