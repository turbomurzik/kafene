# Jev Reranking Spike

Status: DEFERRED RESEARCH

## Hypothesis

Jev may be useful as a lightweight decision/reranking layer between Discourse semantic retrieval and generative LLM synthesis.

Potential uses:

- Question Gate reranking
- stale/current authority selection
- cross-language result filtering
- AI-user action decisions

Candidate architecture:

Discourse semantic retrieval
→ Jev relevance/authority decision
→ LLM synthesis

## Primary test case

Use the existing KAFENE retrieval evaluation where:

- `en2ru-cars-1`
- `ru-stale-cars` ranked #1
- expected current result ranked #2

Test whether Jev can move the current/authoritative result above the stale result without degrading the other correctly ranked cases.

## Research questions

1. Can Jev improve ranking quality over native Discourse semantic search?
2. Can it distinguish current canonical guides from stale discussions?
3. Can it reduce the number of retrieved items sent to the generative LLM?
4. What latency and cost does it add?
5. Does it outperform a simple deterministic authority/freshness scoring rule?

## Decision rule

Do not integrate Jev unless it demonstrates measurable improvement over:

- native Discourse ranking
- simple deterministic reranking

## Trigger

Run this spike only after the Discourse Ask AI freshness/authority test is complete.

If Discourse already handles authority/freshness sufficiently, Jev remains optional.
