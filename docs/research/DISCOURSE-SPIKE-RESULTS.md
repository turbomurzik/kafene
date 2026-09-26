# Discourse Spike Results

Status: **NOT RUN**

This document must contain measured behavior from a live Discourse instance. Do not convert assumptions or documentation claims into test results.

## A. Environment

- Date:
- Discourse version / commit:
- Release channel:
- discourse-ai version / commit:
- Solved version:
- Doc Categories version:
- Database:
- Embedding provider/model:
- LLM provider/model:
- Host / CPU / RAM:
- Test URL:
- Public/private corpus restrictions:

## B. Enabled features

- [ ] EN root category
- [ ] RU root category
- [ ] Guides categories
- [ ] Q&A / Solved
- [ ] Wiki posts
- [ ] Doc Categories
- [ ] Discourse AI
- [ ] Embeddings
- [ ] Semantic search
- [ ] Ask AI
- [ ] API keys
- [ ] Webhooks
- [ ] Prototype custom fields

## C. Corpus loaded

| Type | EN | RU |
|---|---:|---:|
| Community topics | 0 | 0 |
| Guides | 0 | 0 |
| Solved Q&A | 0 | 0 |
| Deliberately stale/conflicting items | 0 | 0 |

Fixture commit:

## D. Category-scoped retrieval

Record the exact supported interface used.

| Test | Expected scope | Result | Pass |
|---|---|---|---|
| EN-only semantic retrieval | EN root | | |
| RU-only semantic retrieval | RU root | | |
| Guide-only retrieval | Guides | | |
| Solved-only retrieval | Q&A/Solved | | |

Notes:

## E. Cross-language retrieval

Dataset: `spike/discourse/evaluation/cross_language_cases.jsonl`

| Metric | EN -> RU | RU -> EN | Combined |
|---|---:|---:|---:|
| Hit@1 | | | |
| Hit@3 | | | |
| Hit@5 | | | |
| MRR | | | |

Observed failure clusters:

## F. Ask AI authority/freshness

For every controlled conflict record:

- query;
- canonical/current guide;
- stale/conflicting topic;
- answer;
- citations/links;
- whether stale content leaked into answer;
- whether current content was preferred;
- configuration/agent used.

Summary:

## G. Citation and link behavior

- Stable links to underlying topics:
- Source visibility in answer:
- Citation omissions:
- Broken/ambiguous links:
- Result:

## H. Metadata/API round-trip

| Field | Write | Read | Visible where intended | Supported API/plugin path |
|---|---|---|---|---|
| topic_space_id | | | | |
| last_verified | | | | |
| source_status | | | | |
| paired_topic_id | | | | |

## I. Thin-plugin feasibility

### Question Gate

- supported composer outlet/hook:
- supported server validation path:
- private/internal dependency:
- result:

### Check EN/RU

- topic-page outlet:
- retrieval adapter:
- result:

### Guide status

- display outlet:
- metadata source:
- result:

## J. Failure cases

List reproducible failures only.

## K. Upgrade / maintenance risk

- internal APIs touched:
- experimental features required:
- version pinning required:
- likely regression areas:
- smoke tests needed:

## L. Custom code still required

After the spike:

1.
2.
3.

## M. Decision

One of:

- **PASS**
- **CONDITIONAL PASS**
- **FAIL**

Rationale:

## Evidence log

Include exact commands, API calls, config excerpts and screenshots/links where useful.
