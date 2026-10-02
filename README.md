# KAFENE

Cyprus-first bilingual (EN/RU) community-backed living knowledge platform.

## Current stage

Product architecture consolidation after the Discourse feasibility PoC.

Start with:

- `docs/00-START-HERE.md`
- `docs/00-DECISIONS.md`
- `docs/00-DOCS-INVENTORY.md`

## Product north star

> If someone has a practical question about Cyprus, KAFENE should be the first place they think to search or ask.

## Current accepted shape

KAFENE is intentionally split into two connected surfaces.

### KAFENE website / knowledge layer

- homepage / live Cyprus dashboard;
- collections and journeys;
- standalone guides;
- official-source "What changed" entries;
- future News/city discovery;
- search;
- future custom Ask KAFENE.

### KAFENE community / Discourse

- discussions;
- questions and answers;
- user/community experience;
- moderation and profiles;
- multilingual semantic community retrieval.

The website and forum link to each other where useful, but the forum is not the CMS for KAFENE guides.

## Validated Discourse evidence

The live spike validated multilingual embeddings and cross-language semantic retrieval. The 36-case evaluation recorded combined Hit@1 0.9722, Hit@3 1.0000, Hit@5 1.0000 and MRR 0.9861.

Native Discourse Ask AI did not pass KAFENE's authority/freshness test and is not the production answer layer.

See `docs/research/DISCOURSE-SPIKE-RESULTS.md` for evidence and `docs/00-DECISIONS.md` for accepted conclusions.

## Current rule

Do not build a custom forum engine.

Do not assume research notes are current architecture. Follow the documentation hierarchy in `docs/00-START-HERE.md`.
