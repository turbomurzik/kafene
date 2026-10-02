# Discourse Spike Results

Status: **NOT RUN**

This document must contain measured behavior from a live Discourse instance. Do not convert assumptions or documentation claims into test results.

## A. Environment

- Date: 2026-10-02
- Discourse version / commit: `2026.10.0-latest` / `67bc74d0d83f8037ec538c1299b8d8cb59211319`
- Release channel: `latest`
- discourse-ai version / commit: bundled with the core checkout at `67bc74d0d83f8037ec538c1299b8d8cb59211319`; not configured
- Solved version: bundled with the core checkout at `67bc74d0d83f8037ec538c1299b8d8cb59211319`; not configured or tested
- Doc Categories version: not installed
- Database: PostgreSQL `18.6` (`Debian 18.6-1.pgdg13+2`)
- Embedding provider/model: not configured
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
- Public/private corpus restrictions: no KAFENE fixture corpus loaded; only synthetic provisioning smoke-test records exist

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
- [ ] Discourse AI
- [ ] Embeddings
- [ ] Semantic search
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
