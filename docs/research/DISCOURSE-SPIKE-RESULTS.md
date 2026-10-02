# Discourse Spike Results

Status: **NOT RUN**

This document must contain measured behavior from a live Discourse instance. Do not convert assumptions or documentation claims into test results.

## A. Environment

- Date: 2026-10-02
- Discourse version / commit: `2026.10.0-latest` / `67bc74d0d83f8037ec538c1299b8d8cb59211319`
- Release channel: `latest`
- discourse-ai version / commit: bundled with the core checkout at `67bc74d0d83f8037ec538c1299b8d8cb59211319`; embeddings and full-page semantic search configured
- Solved version: bundled with the core checkout at `67bc74d0d83f8037ec538c1299b8d8cb59211319`; not configured or tested
- Doc Categories version: not installed
- Database: PostgreSQL `18.6` (`Debian 18.6-1.pgdg13+2`)
- Embedding provider/model: self-hosted Hugging Face Text Embeddings Inference (TEI) `cpu-1.9`; `intfloat/multilingual-e5-large` revision `3d7cfbdacd47fdda877c5cd8a79fbcc4f2a574f3`; Discourse embedding definition `KAFENE multilingual-e5-large` (`1024` dimensions, cosine distance)
- LLM provider/model: not configured
- Host / CPU / RAM: disposable Google Compute Engine VM `kafene-discourse-spike` in `europe-west1-b`; `e2-standard-2`, 2 vCPU, 8 GB RAM, 30 GB `pd-balanced` disk
- OS / kernel: Ubuntu `24.04.5 LTS`; Linux `7.0.0-1011-gcp`
- Docker version: Docker Engine Community `29.8.2` (client and server)
- Installation method: official `discourse/discourse_docker` one-line installer, generated `app.yml`, then `launcher rebuild app`; no custom Compose stack
- Hostname: `kafene-34-156-242-215.sslip.io` (`34.156.242.215`)
- Test URL: https://kafene-34-156-242-215.sslip.io/
- HTTPS status: enabled with a valid Let's Encrypt certificate; HTTP redirects with `301`; HTTPS returns `200`; curl certificate verification result `0`
- SMTP status: not configured; installer option `DISCOURSE_SKIP_EMAIL_SETUP=1`
- Backup / restore status: full backup created successfully with the supported `discourse backup` command (`discourse-2026-10-02-103528-v20261001073226.tar.gz`, 2,919,636 bytes); restore not tested
- Public/private corpus restrictions: no KAFENE fixture corpus loaded; only synthetic provisioning records and the eight-topic EN/RU AI smoke corpus exist

## B. Enabled features

- [x] Base web UI over HTTPS
- [x] Administrator password login and admin dashboard access
- [x] Active normal test user
- [x] Smoke category, topic and reply
- [ ] EN root category
- [ ] RU root category
- [ ] Guides categories
- [ ] Q&A / Solved
- [ ] Wiki posts
- [ ] Doc Categories
- [x] Discourse AI
- [x] Embeddings
- [x] Semantic search
- [ ] Ask AI
- [x] API keys
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
| Hit@1 | 0.9444 (17/18) | 1.0000 (18/18) | 0.9722 (35/36) |
| Hit@3 | 1.0000 (18/18) | 1.0000 (18/18) | 1.0000 (36/36) |
| Hit@5 | 1.0000 (18/18) | 1.0000 (18/18) | 1.0000 (36/36) |
| MRR | 0.9722 | 1.0000 | 0.9861 |

Observed failure clusters:

- Full 36-case run completed: 18 EN -> RU and 18 RU -> EN cases over the 122-topic
  fixture corpus. All 122 topics had embeddings before evaluation.
- Each query used the registered discourse-ai `ai:search` plugin API that backs
  the validated full-page `/search` UI. The supported category syntax
  `#kafene-ru` or `#kafene-en` constrained results to the case's target language.
  Fifty semantic results per case were exported to the JSONL format consumed by
  `spike/discourse/scripts/run_eval.py`.
- `run_eval.py` reported no missing expected topic in the exported result sets.
  The only non-Hit@1 case was `en2ru-cars-1`: the deliberately stale control
  `ru-stale-cars` ranked first and expected `ru-cars-q1` ranked second. This is
  an authority/freshness failure signal for later testing, not a top-3 or top-5
  cross-language retrieval miss.

Earlier task-2 controlled smoke test:

| Direction | Full-page AI Search query | Expected cross-language target | Target rank | Designed lexical negative control | Control rank | Result |
|---|---|---|---:|---|---:|---|
| EN -> RU | `What documents are needed so my foreign wife can live with me under family reunification?` | `ВНЖ для мужа или жены по семейным основаниям` | 2 | `Перенос реестра разрешений и электричества между базами` | 6 | PASS: RU target outranked RU control |
| RU -> EN | `Как новому арендатору оформить договор на электроэнергию и счета на себя после переезда?` | `Put a home's power bill in the new tenant's name` | 2 | `Permit registry transfer during an electricity database migration` | 5 | PASS: EN target outranked EN control; it also outranked the RU control at rank 3 |

The supported full-page `/search` UI automatically enabled checked `Related
results` after ordinary search found no exact matches. All 15 displayed results
were marked `Related search result found using AI`. In both directions the
same-language pair ranked first and the requested cross-language pair ranked
second. These observations verify arbitrary-query semantic AI Search rather
than the separate Related Topics feature.

## F. Ask AI authority/freshness

Live test configuration: full-page Ask AI request path
`POST /discourse-ai/discoveries/reply`, authenticated as `user2`; built-in
`Ask AI Synthesis` agent (`-41`); Google Vertex AI
`google/gemini-3.8-flash` (`Gemini 3.8 Flash (Vertex)`, LLM model id `1`).
`ai_bot_enabled` and `ai_ask_ai_enabled` were both enabled. The existing
`intfloat/multilingual-e5-large` embedding definition was not changed. Exactly
three requests were submitted; no failed/no-answer case was retried.

### Cars — MIXED

- Query: `Как сейчас правильно купить и переоформить подержанную машину на
  Кипре? Используй актуальную информацию сообщества и укажи источник.`
- Controlled pair: current
  [`ru-guide-used-car-transfer`](https://kafene-34-156-242-215.sslip.io/t/topic/121/1)
  versus stale
  [`ru-stale-cars`](https://kafene-34-156-242-215.sslip.io/t/mot/141/1).
- Ask AI outcome: `answered`. Exact answer: `Для переоформления подержанного
  автомобиля на Кипре новый владелец должен зарегистрировать его на себя в
  дорожном ведомстве. Покупатель и продавец совместно подают подписанный договор
  купли-продажи, свидетельство о регистрации транспортного средства, документы,
  удостоверяющие личность, а также действующий страховой полис. Кроме того,
  необходимо оплатить установленный сбор за смену владельца. После завершения
  процедуры покупатель официально вносится в реестр как новый владелец машины.`
- Sources used: [Переоформление автомобиля с пробегом на
  покупателя](https://kafene-34-156-242-215.sslip.io/t/topic/18/1) and
  [Changing the registered keeper after buying a second-hand
  car](https://kafene-34-156-242-215.sslip.io/t/changing-the-registered-keeper-after-buying-a-second-hand-car/12/1)
  (`source_post_ids` `18` and `14`). These are the earlier smoke-test semantic
  target topics, not either member of the controlled pair.
- Source preference: neither controlled source was selected. The canonical
  guide therefore was not preferred or cited.
- Stale leakage: no observed leakage; `ru-stale-cars` was not a source and its
  stale-control wording was not repeated.

### Immigration — FAIL

- Query: `What is the current process for registering residence in Cyprus?
  Please use the latest guidance from this community and cite the source.`
- Controlled pair: current
  [`en-guide-residency-registration`](https://kafene-34-156-242-215.sslip.io/t/registering-residence-in-cyprus/118/1)
  versus stale
  [`en-stale-immigration`](https://kafene-34-156-242-215.sslip.io/t/old-advice-about-immigration-and-residency/138/1).
- Ask AI outcome: `no_answer`; no answer text or source links were returned.
  The canonical post was present in the candidate set, but Ask AI selected no
  source (`source_post_ids` was empty).
- Source preference: none. Current canonical content was not cited.
- Stale leakage: none observed because no answer was produced and the stale
  topic was not selected as a source.

### Tax — FAIL

- Query: `Каковы актуальные правила налогового резидентства на Кипре? Используй
  самый свежий материал сообщества и приведи источник.`
- Controlled pair: current
  [`ru-guide-tax-residency`](https://kafene-34-156-242-215.sslip.io/t/topic/125/1)
  versus stale
  [`ru-stale-tax`](https://kafene-34-156-242-215.sslip.io/t/topic/145/1).
- Ask AI outcome: `failed` at the `synthesis` stage; no answer text or source
  links were returned (`source_post_ids` was empty).
- Source preference: none. Current canonical content was not cited.
- Stale leakage: none observed because no answer was produced and the stale
  topic was not selected as a source.

Summary: **FAIL**. The test found no direct stale-content leakage, but Ask AI
cited the current canonical guide in `0/3` cases: one answer used alternate
smoke topics, one case returned no answer, and one failed during synthesis.
This does not demonstrate a reliable canonical-over-stale authority preference.

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

- Embedding presence was checked through the installed discourse-ai schema
  interface for smoke topic IDs `12`, `14`, `16`, `17`, `18`, `19`, `20`, and
  `21`. Every topic returned an embedding row with `model_id=1` and
  `strategy_id=1`; vector values were not printed.
- Search interface: documented full-page Discourse search UI at `/search`, with
  the discourse-ai `Related results` switch automatically checked. No private
  HTTP endpoint, direct PostgreSQL access, or Discourse patch was used for the
  retrieval observations.
