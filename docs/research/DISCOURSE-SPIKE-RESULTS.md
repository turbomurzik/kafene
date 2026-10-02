# Discourse Spike Results

Status: **EVIDENCE COMPLETE FOR CURRENT DECISION SCOPE**

This document records measured behavior from the live Discourse spike. It is an
evidence record, not the canonical product/architecture decision.

The original spike protocol included additional metadata, plugin and guide-CMS
checks. Those were not completed before KAFENE moved to a separate
website/knowledge layer plus Discourse community model. They are therefore
marked not run rather than inferred.

Accepted conclusions are recorded in `docs/00-DECISIONS.md`.

## A. Environment

- Date: 2026-10-02
- Discourse version / commit: `2026.10.0-latest` / `67bc74d0d83f8037ec538c1299b8d8cb59211319`
- Release channel: `latest`
- discourse-ai version / commit: bundled with the core checkout at `67bc74d0d83f8037ec538c1299b8d8cb59211319`
- Solved: bundled with the core checkout; not configured or tested
- Doc Categories: not installed
- Database: PostgreSQL `18.6` (`Debian 18.6-1.pgdg13+2`)
- Embedding provider/model: self-hosted Hugging Face Text Embeddings Inference
  (TEI) `cpu-1.9`; `intfloat/multilingual-e5-large` revision
  `3d7cfbdacd47fdda877c5cd8a79fbcc4f2a574f3`
- Discourse embedding definition: `KAFENE multilingual-e5-large`;
  `1024` dimensions; cosine distance
- LLM provider/model used for Ask AI test: Google Vertex AI /
  `google/gemini-3.8-flash` (`Gemini 3.8 Flash (Vertex)`, model id `1`)
- Host: disposable Google Compute Engine VM `kafene-discourse-spike` in
  `europe-west1-b`
- VM: `e2-standard-2`, 2 vCPU, 8 GB RAM, 30 GB `pd-balanced` disk
- OS / kernel: Ubuntu `24.04.5 LTS`; Linux `7.0.0-1011-gcp`
- Docker: Docker Engine Community `29.8.2`
- Installation: official `discourse/discourse_docker` installer, generated
  `app.yml`, then `launcher rebuild app`; no custom Compose stack
- Hostname: `kafene-34-156-242-215.sslip.io` (`34.156.242.215`)
- Test URL: https://kafene-34-156-242-215.sslip.io/
- HTTPS: valid Let's Encrypt certificate; HTTP redirects with `301`; HTTPS
  returns `200`; curl certificate verification result `0`
- SMTP: not configured; installer option `DISCOURSE_SKIP_EMAIL_SETUP=1`
- Backup: full backup created successfully with supported `discourse backup`
  command
- Restore: not tested
- Test content: synthetic only; eight-topic smoke corpus plus the 122-topic
  evaluation fixture corpus

## B. Enabled / tested features

- [x] Base web UI over HTTPS
- [x] Administrator password login and admin dashboard access
- [x] Active normal test user
- [x] Smoke category, topic and reply
- [x] EN evaluation category/root scope
- [x] RU evaluation category/root scope
- [x] Discourse AI
- [x] Embeddings
- [x] Full-page semantic search
- [x] Ask AI enabled and tested
- [x] API keys
- [ ] Guides categories as a production content model
- [ ] Q&A / Solved
- [ ] Wiki posts
- [ ] Doc Categories
- [ ] Webhooks
- [ ] Prototype KAFENE custom fields

## C. Corpus loaded

- Eight-topic EN/RU manual smoke corpus used for initial semantic validation.
- Full fixture corpus: **122 synthetic topics**.
- Embeddings were confirmed for all **122/122** fixture topics before the
  full evaluation.
- Cross-language evaluation cases: **36** total:
  - 18 EN -> RU
  - 18 RU -> EN

Evaluation-results commit:
`a8981afd48385048409c8c78569182adc0e6fe09`

## D. Category-scoped retrieval

The supported category syntax `#kafene-ru` / `#kafene-en` was used with the
registered discourse-ai `ai:search` plugin API backing the validated full-page
`/search` UI.

| Test | Result |
|---|---|
| EN-target semantic retrieval constrained to EN scope | PASS in evaluation runs |
| RU-target semantic retrieval constrained to RU scope | PASS in evaluation runs |
| Guide-only retrieval | NOT RUN |
| Solved-only retrieval | NOT RUN |

The later product decision to keep guides on the KAFENE website means
Guide/Solved-only retrieval is not a blocker for the current architecture.

## E. Cross-language retrieval

Dataset: `spike/discourse/evaluation/cross_language_cases.jsonl`

| Metric | EN -> RU | RU -> EN | Combined |
|---|---:|---:|---:|
| Hit@1 | 0.9444 (17/18) | 1.0000 (18/18) | 0.9722 (35/36) |
| Hit@3 | 1.0000 (18/18) | 1.0000 (18/18) | 1.0000 (36/36) |
| Hit@5 | 1.0000 (18/18) | 1.0000 (18/18) | 1.0000 (36/36) |
| MRR | 0.9722 | 1.0000 | 0.9861 |

### Observed failure pattern

- All 36 cases completed over the 122-topic fixture corpus.
- All 122 topics had embeddings before evaluation.
- Fifty semantic results per case were exported to the JSONL format consumed by
  `spike/discourse/scripts/run_eval.py`.
- `run_eval.py` reported no missing expected topic in the exported result sets.
- The only non-Hit@1 case was `en2ru-cars-1`:
  - deliberately stale control `ru-stale-cars` ranked first;
  - expected `ru-cars-q1` ranked second.
- This is an authority/freshness signal, not a cross-language top-3/top-5 miss.

### Earlier controlled smoke test

| Direction | Expected cross-language target | Target rank | Designed negative control | Control rank | Result |
|---|---|---:|---|---:|---|
| EN -> RU | `ВНЖ для мужа или жены по семейным основаниям` | 2 | `Перенос реестра разрешений и электричества между базами` | 6 | PASS |
| RU -> EN | `Put a home's power bill in the new tenant's name` | 2 | `Permit registry transfer during an electricity database migration` | 5 | PASS |

The full-page `/search` UI automatically enabled checked `Related results`
after ordinary search found no exact matches. All displayed results were marked
as AI-related search results.

## F. Ask AI authority/freshness

Live test configuration:

- request path: `POST /discourse-ai/discoveries/reply`
- authenticated user: `user2`
- built-in agent: `Ask AI Synthesis` (`-41`)
- LLM: Google Vertex AI `google/gemini-3.8-flash`
- `ai_bot_enabled=true`
- `ai_ask_ai_enabled=true`
- embedding definition unchanged from the retrieval tests
- exactly three controlled requests submitted
- failed/no-answer cases were not retried

### Cars — MIXED

Controlled pair:

- current: `ru-guide-used-car-transfer`
- stale: `ru-stale-cars`

Observed:

- Ask AI answered.
- It used two earlier smoke-test semantic topics instead of either member of the
  controlled canonical/stale pair.
- Canonical guide cited: **no**
- Stale controlled topic used: **no**
- Direct stale leakage observed: **no**

### Immigration — FAIL

Controlled pair:

- current: `en-guide-residency-registration`
- stale: `en-stale-immigration`

Observed:

- Ask AI returned `no_answer`.
- The canonical post was present in the candidate set.
- No source was selected.
- Canonical guide cited: **no**
- Direct stale leakage observed: **no**

### Tax — FAIL

Controlled pair:

- current: `ru-guide-tax-residency`
- stale: `ru-stale-tax`

Observed:

- Ask AI failed at the `synthesis` stage.
- No answer text or source links were returned.
- Canonical guide cited: **no**
- Direct stale leakage observed: **no**

### Ask AI result

**FAIL for KAFENE authority/freshness requirements.**

The test found no direct stale-content leakage, but the current canonical guide
was cited in **0/3** cases. Native Ask AI therefore did not demonstrate reliable
canonical-over-stale source preference.

Ask-AI-results commit:
`067707b7e5e2dc669225a6563a5aaf3acb6ec0fe`

## G. Citation / source behavior

Measured only in the three Ask AI authority/freshness cases:

- Cars: stable source links were returned, but to alternate smoke topics rather
  than the controlled canonical guide.
- Immigration: no answer and no source links.
- Tax: synthesis failure and no source links.

No broader citation benchmark was run.

## H. Metadata/API round-trip

**NOT RUN.**

The original spike planned round-trip checks for:

- `topic_space_id`
- `last_verified`
- `source_status`
- `paired_topic_id`

These were not completed before the product architecture changed. Do not infer
support or failure from this file.

## I. Thin-plugin feasibility

**NOT RUN.**

The original protocol proposed checks for:

- Question Gate composer integration;
- Check EN/RU topic-page action;
- guide freshness/status display.

These were not completed and are not evidence-backed in this document.

## J. Reproducible failures / limitations

1. `en2ru-cars-1`: stale semantic result outranked the expected current result
   at rank 1.
2. Native Ask AI did not cite the current canonical guide in any of the three
   controlled authority/freshness cases.
3. One Ask AI case returned `no_answer`.
4. One Ask AI case failed at synthesis.
5. Restore was not tested.
6. Solved, Doc Categories, wiki guide behavior, metadata round-trip and thin
   plugin hooks were not tested.

## K. Current evidence-backed outcome

The evidence supports these conclusions:

- Discourse infrastructure: **validated for the spike**.
- Multilingual embeddings: **validated**.
- EN/RU semantic retrieval: **validated**.
- Category/language scoping used in the evaluation: **validated**.
- Native Discourse Ask AI as KAFENE's production answer layer: **rejected by the
  authority/freshness test**.
- Original "Discourse as forum + guide CMS + Ask AI knowledge core" candidate:
  no longer the current product architecture.

This evidence file does **not** accept the old ADR wording.

Current accepted product conclusions are in `docs/00-DECISIONS.md`.

## Evidence log

- Provisioning commit:
  `110d08a352511ca80374d189098bd9da3e01f172`
- AI smoke-results commit:
  `aec5dda3ca169124348fe542753dbe9831f3baba`
- Full retrieval-evaluation commit:
  `a8981afd48385048409c8c78569182adc0e6fe09`
- Ask AI freshness-test commit:
  `067707b7e5e2dc669225a6563a5aaf3acb6ec0fe`
- Embedding presence was checked for the eight smoke topic IDs `12`, `14`,
  `16`, `17`, `18`, `19`, `20`, `21`; each returned an embedding row
  with `model_id=1` and `strategy_id=1`.
- Search validation used the full-page Discourse `/search` UI and the registered
  discourse-ai semantic-search path. No Discourse core patch or direct
  PostgreSQL write was used for the retrieval observations.
