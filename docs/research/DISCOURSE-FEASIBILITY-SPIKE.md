# Discourse Feasibility Spike

Status: **planned / partially prepared**

## Purpose

Validate experimentally whether one self-hosted Discourse instance can serve as the KAFENE community + knowledge core without requiring a separate forum engine, CMS, or bespoke semantic/RAG platform.

The spike is intentionally narrow. It is not a production build.

## Decision to validate

Candidate:

- one self-hosted Discourse instance;
- EN and RU as separate content trees;
- wiki + Doc Categories for canonical guides;
- Solved for Q&A;
- Discourse AI for embeddings / semantic retrieval / Ask AI;
- one thin plugin, `kafene-bridge`;
- one external governance/integration service, `kafene-orchestrator`.

## Critical questions

The candidate architecture only passes if the following can be demonstrated on a live instance.

1. **Category-scoped semantic retrieval**
   - Can semantic retrieval be restricted reliably to a chosen EN or RU root/category?
   - Can guides and solved topics be targeted or boosted through supported interfaces?

2. **Cross-language retrieval**
   - Do multilingual embeddings match semantically equivalent EN/RU Cyprus questions?
   - Can EN -> RU and RU -> EN retrieval work without a separate vector database/reranker?

3. **Ask KAFENE substrate**
   - Does Ask AI cite/link the underlying Discourse content reliably?
   - Does it prefer current canonical guides over older/conflicting discussions?
   - Does it respect category visibility?

4. **Metadata**
   - Can KAFENE-required system metadata be stored and exposed through supported plugin/API mechanisms?
   - Required fields: `topic_space_id`, `last_verified`, `source_status`, `paired_topic_id`.

5. **Thin integration feasibility**
   - Question Gate panel in composer.
   - Check EN/RU action on topic pages.
   - Guide freshness/status display.
   - No core patching, DOM monkey-patching, or direct DB writes.

## Current official-platform facts used for the spike

As of 2026-09-26:

- Official self-hosting is Docker-based.
- Discourse now provides a one-command self-host installer for a fresh server.
- Ask AI uses keyword search plus semantic search when embeddings are enabled.
- Self-hosters must configure a working AI model / embedding definition.
- Discourse AI exposes multilingual-capable embedding presets/providers.

Official references:

- https://meta.discourse.org/t/self-hosting-discourse-just-got-a-whole-lot-easier/393915
- https://meta.discourse.org/t/search-better-in-your-community-with-ask-ai/411346
- https://meta.discourse.org/t/discourse-ai-embeddings/259603

## Test corpus

Target minimum:

- 50 EN community topics;
- 50 RU community topics;
- 10 EN canonical guides;
- 10 paired RU canonical guides;
- deliberately stale/conflicting discussion answers;
- at least 30 EN/RU evaluation queries.

Domains:

- immigration / residency;
- cars / transfer / MOT;
- property / rent;
- tax;
- healthcare;
- company formation;
- schools;
- utilities;
- local services.

The initial fixture corpus in this repository is synthetic and exists only to validate retrieval behavior. It is not launch content.

## Evaluation

### Cross-language retrieval

For each evaluation query record:

- query language;
- target language;
- expected paired topic/guide;
- top-1 result;
- top-3 hit;
- top-5 hit;
- reciprocal rank;
- notes on obvious misses.

Minimum metrics:

- Hit@1
- Hit@3
- Hit@5
- MRR

Do not treat lexical overlap as sufficient evidence. Include pairs with low word overlap.

### Authority and freshness

Create controlled conflicts:

- old discussion: obsolete process;
- newer guide: current process;
- optional solved Q&A: partially current answer.

Measure:

- which sources Ask AI used;
- whether the current guide was cited;
- whether stale advice was repeated;
- whether the answer indicated uncertainty/conflict.

### Category restriction

Test retrieval constrained to:

- EN root only;
- RU root only;
- Guides only;
- Q&A / solved only where supported.

### Metadata/API

Verify read/write round-trip for:

- `topic_space_id`;
- `last_verified`;
- `source_status`;
- `paired_topic_id`.

## Pass criteria

### PASS

Discourse is accepted as forum/knowledge core if:

- cross-language retrieval is good enough for a user-facing prototype;
- category scoping is reliable;
- Ask AI can ground answers in internal content with stable links;
- current guides can be favored over stale discussion content with configuration or a thin adapter;
- required metadata and UI hooks use supported extension points;
- no second semantic index is required for MVP.

### CONDITIONAL PASS

Acceptable if one small retrieval/reranking adapter or thin plugin is needed, but Discourse remains the semantic source of truth.

### FAIL

Fail if one or more are true:

- category-restricted semantic retrieval cannot be made reliable;
- multilingual retrieval quality is inadequate even with a suitable embedding model;
- authority/freshness cannot be controlled without a separate RAG/index stack;
- required UI integration depends on unstable/private internals;
- ACL behavior is unsafe or not testable.

## Explicit non-goals

Do not:

- build production hosting;
- design final UI;
- implement the full living-guide monitor;
- build business/expert monetization;
- build a custom vector platform before native Discourse AI is tested;
- write directly to Discourse/PostgreSQL;
- modify Discourse core.

## Output

Results go to:

`docs/research/DISCOURSE-SPIKE-RESULTS.md`

Only after evidence exists should:

`docs/architecture/ADR-001-FORUM-ENGINE.md`

be moved from Proposed to Accepted.
