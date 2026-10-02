# KAFENE Discourse Spike

This directory contains the reproducible assets for the forum-engine feasibility test.

The completed infrastructure-task-1 provisioning record is in
[`PROVISIONING.md`](PROVISIONING.md). It documents the live disposable host,
official installation path, smoke tests, versions, and deferred scope without
including credentials.

## What is prepared here

- synthetic EN/RU fixture corpus;
- cross-language evaluation cases;
- fixture loader skeleton;
- evaluation script skeleton;
- live-test checklist.

## What is deliberately not vendored

Discourse itself.

For a self-hosted live spike, use the official Discourse Docker installation path. Current official guidance states that supported self-hosting is Docker-based.

Fresh-server installer:

```bash
wget -qO- https://raw.githubusercontent.com/discourse/discourse_docker/main/install-discourse | sudo bash
```

Reference:

https://meta.discourse.org/t/self-hosting-discourse-just-got-a-whole-lot-easier/393915

Do not run this installer blindly on a machine containing other services. The spike should use a disposable VM/VPS or isolated test host.

## Required configuration

On the test Discourse instance:

1. create EN and RU root categories;
2. create Guides and Q&A subcategories under each language;
3. enable/install supported official components required by the spike;
4. configure Discourse AI;
5. configure an embedding definition;
6. enable semantic search;
7. enable Ask AI;
8. create an API key for fixture loading;
9. record exact versions in `DISCOURSE-SPIKE-RESULTS.md`.

Ask AI currently uses keyword + semantic search when embeddings are enabled.

Reference:

https://meta.discourse.org/t/search-better-in-your-community-with-ask-ai/411346

Embeddings reference:

https://meta.discourse.org/t/discourse-ai-embeddings/259603

## Environment variables for scripts

```bash
export DISCOURSE_BASE_URL="https://your-spike-host"
export DISCOURSE_API_KEY="..."
export DISCOURSE_API_USERNAME="system"
```

Additional category IDs are supplied through the fixture mapping file once the instance is created.

## Planned workflow

```text
1. provision disposable Discourse
2. enable AI / embeddings / Ask AI
3. create EN/RU category tree
4. load fixtures
5. wait for embeddings/indexing
6. run cross-language retrieval evaluation
7. run Ask AI authority/freshness cases
8. record metadata/plugin findings
9. complete DISCOURSE-SPIKE-RESULTS.md
10. decide ADR-001
```

## Safety / reproducibility rules

- no direct PostgreSQL writes;
- no Discourse core edits;
- no browser automation if supported API exists;
- no production credentials;
- no real user data;
- fixtures only;
- record exact version/commit before interpreting results.
