# KAFENE

Cyprus-first bilingual (EN/RU) community + living knowledge platform.

## Current stage

Architecture validation / feasibility spike.

The immediate decision is whether **Discourse** can serve as the community and knowledge core without forcing KAFENE to build and maintain a separate forum/CMS/RAG stack.

## Product north star

> If someone has a practical question about Cyprus, KAFENE should be the first place they think to ask or search.

KAFENE is intended to combine:

- community discussions;
- Q&A and accepted solutions;
- canonical / living guides;
- bilingual EN/RU knowledge transfer;
- source monitoring and freshness;
- semantic question routing;
- Ask KAFENE over the platform's own corpus.

## Current candidate architecture

```text
Discourse
  ├─ EN community tree
  ├─ RU community tree
  ├─ Q&A / Solved
  ├─ Wiki + Doc Categories
  ├─ Discourse AI / embeddings / Ask AI
  └─ moderation / users / revisions / SEO
          │
          │ supported APIs + plugin interfaces
          ▼
kafene-bridge
          │
          ▼
kafene-orchestrator
  ├─ source monitoring
  ├─ deterministic diff
  ├─ update proposals
  ├─ cross-language orchestration
  ├─ AI publication governance
  └─ audit trail
```

This architecture is **not yet accepted**. It must pass the Discourse feasibility spike first.

## Repository map

- `docs/research/DISCOURSE-FEASIBILITY-SPIKE.md` — exact spike scope and pass/fail criteria.
- `docs/research/DISCOURSE-SPIKE-RESULTS.md` — evidence/results template.
- `docs/architecture/ADR-001-FORUM-ENGINE.md` — engine decision record; intentionally not finalized yet.
- `spike/discourse/` — reproducible spike assets, fixtures and evaluation material.

## Current rule

Do not build KAFENE as a custom forum.

Prefer supported platform capabilities, official plugins, APIs, plugin outlets and thin integration. Any custom component must justify its maintenance burden.

## Status

Repository initialized for the Discourse feasibility spike.
