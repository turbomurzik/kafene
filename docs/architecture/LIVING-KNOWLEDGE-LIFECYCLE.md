# Living Knowledge Lifecycle и initial Guide boundary

Статус: **ACTIVE DRAFT**

Дата: 2026-10-04

Связанные канонические решения:

- `docs/architecture/ADR-002-CMS-CONTENT-STORAGE.md` — CANONICAL;
- `docs/architecture/ADR-001-FORUM-ENGINE.md` — CANONICAL;
- `docs/architecture/WEBSITE-DISCOURSE-INTEGRATION-CONTRACT.md` — CANONICAL;
- `docs/product/HOME-INTERACTION-MODEL.md` — CANONICAL.

## 1. Цель

KAFENE должен быть living knowledge system, а не ручной CMS.

Целевая operational модель предполагает высокий уровень автоматизации:
порядка **90%+ routine editorial maintenance** должно выполняться системой
автоматически или полуавтоматически, с человеком в контуре только там, где
нужны judgment, legal/regulatory interpretation, conflict resolution или
high-risk approval.

Базовый lifecycle:

```text
official/external source
    -> fetch / observe
    -> normalize
    -> compare
    -> detect material change
    -> determine affected knowledge
    -> update / propose update
    -> verification decision
    -> publish canonical revision
    -> regenerate derived representations
```

Этот документ определяет domain boundaries и data lifecycle. Он не выбирает
конкретные crawler, scheduler, queue, LLM vendor или orchestration engine.

## 2. Основной принцип

**Canonical knowledge хранится один раз. Monitoring, AI generation и search
являются производными процессами вокруг canonical knowledge, а не параллельными
источниками истины.**

Внешний инструмент может:

- получить страницу;
- отрендерить JavaScript;
- извлечь PDF;
- вычислить diff;
- прислать webhook.

Но KAFENE должен владеть:

- Source identity;
- Source observations/history;
- provenance;
- dependency между source и canonical knowledge;
- decision, является ли изменение material;
- canonical Guide revisions;
- verification state;
- generated/derived artifact lineage.

Crawler/watcher должен быть заменяемым adapter.

## 3. Guide

### 3.1. Роль

`Guide` — канонический редакционный ответ KAFENE на практический вопрос.

Guide не является:

- forum thread;
- news article;
- raw source mirror;
- arbitrary page-builder document.

### 3.2. Identity

Минимальные invariants:

- `id` — canonical UUID;
- один Guide сохраняет один canonical ID для всех locales и revisions;
- slug/title/locale не являются identity;
- Guide связан с `TopicSpace`;
- locale scope и publication state различаются.

### 3.3. Localized editorial content

Рабочий initial набор localized content:

- title;
- summary;
- body;
- steps;
- requirements;
- costs;
- timing;
- warnings / important notes.

Это structured editorial content, а не arbitrary localized layout blocks.

Точная Payload field shape этих частей пока не заморожена.

### 3.4. Publication

Publication state независим по locale.

Допустимо:

- EN published, RU draft/missing;
- RU published, EN draft/missing.

Silent fallback запрещён.

### 3.5. Verification

Verification independent по locale.

Минимальная рабочая модель:

- unverified;
- verified;
- needs_review.

Также хранится `last_verified_at`.

`published` не означает `verified`.

Содержательная правка localized canonical content должна инвалидировать
verification только затронутой locale.

## 4. Source

`Source` — first-class domain entity, представляющая внешний источник,
на который опирается knowledge base.

Это не просто URL.

Минимальная концептуальная модель включает:

- canonical Source ID;
- human-readable name;
- canonical URL/endpoint;
- source type;
- publisher/authority;
- source locale(s), если применимо;
- deployment/geographic scope;
- active/inactive state;
- monitoring strategy;
- expected check interval / freshness policy;
- last checked timestamp;
- last successful check timestamp;
- last known material-change timestamp.

Точные поля не фиксируются этим draft.

## 5. Monitoring strategy

KAFENE должен использовать самый дешёвый надёжный механизм наблюдения,
подходящий конкретному Source.

Предпочтительный порядок:

1. push/webhook/native event;
2. official API;
3. RSS/Atom/feed;
4. HTTP conditional requests (`ETag`, `Last-Modified`);
5. direct HTML/document fetch;
6. selector/structured extraction;
7. rendered-browser fetch;
8. manual monitoring fallback.

Monitoring technology не является частью identity Source.

Один Source может сменить adapter без потери своей истории или связей.

## 6. SourceObservation

Каждая фактическая проверка Source, которая важна для audit/freshness,
представляется как `SourceObservation`.

Концептуальные данные:

- observation ID;
- source ID;
- checked_at;
- fetch status;
- HTTP status, если применимо;
- `etag`;
- `last_modified`;
- raw-content hash;
- normalized-content hash;
- snapshot/artifact reference, если сохраняется;
- previous observation reference;
- monitor/connector version;
- change detected: yes/no/unknown.

Observation фиксирует факт проверки.

Observation **не означает**, что изменение правила доказано.

## 7. Normalization и hashing

До вызова semantic/AI analysis система должна выполнять deterministic
normalization и comparison.

Рекомендуется разделять:

- raw hash;
- normalized-content hash.

Это позволяет игнорировать несущественный noise:

- timestamps;
- session tokens;
- analytics markup;
- layout-only changes;
- unstable generated attributes.

Если normalized content не изменился, pipeline должен завершаться без LLM.

## 8. SourceDependency

Простой `Guide.sources[]` недостаточен для fully automated maintenance.

Нужна semantic dependency, показывающая, **что именно Source подтверждает
в конкретном Guide**.

Рабочая сущность: `SourceDependency`.

Она связывает:

- canonical knowledge entity/revision;
- Source;
- dependency type / supported claim area.

Рабочие типы:

- eligibility;
- requirements;
- procedure;
- cost;
- timing;
- legal_basis;
- contact;
- general.

Дополнительно могут понадобиться:

- locale applicability;
- criticality;
- source anchor/selector/reference;
- human note.

Точный enum и cardinality пока не фиксируются.

Главная цель:

> при изменении Source система должна уметь определить, какие части каких
> canonical knowledge entities потенциально затронуты.

## 9. DetectedChange

`DetectedChange` — технический/аналитический candidate, появляющийся после
deterministic comparison и, при необходимости, semantic classification.

Он отвечает на вопрос:

> "Источник изменился. Может ли это быть значимо для KAFENE?"

DetectedChange может содержать:

- source ID;
- previous/current observation IDs;
- deterministic diff;
- normalized changed fragments;
- classifier result;
- affected SourceDependencies;
- affected Guides/claims;
- confidence;
- proposed change type;
- proposed patch;
- review requirement.

DetectedChange не является canonical `Change`.

## 10. Change

`Change` — canonical verified domain fact о meaningful изменении правил,
процедур, официальных требований или иного knowledge state.

Пример:

> "С 1 января application fee изменился с EUR X на EUR Y."

Один Source diff не должен автоматически становиться Change.

Путь:

```text
SourceObservation
    -> DetectedChange
        -> noise / irrelevant -> close
        -> uncertain -> review
        -> material -> Change
```

Change может ссылаться на:

- supporting Source/observations;
- affected Guide(s);
- effective date;
- affected locale(s)/scope;
- superseded prior state.

## 11. Canonical revision

Каждое meaningful изменение Guide должно порождать новую revision через
штатный Payload versioning/revision mechanism.

Автоматизированные процессы должны уметь ссылаться не только на Guide ID, но и
на конкретную canonical source revision, из которой был произведён downstream
artifact.

Конкретная technical revision identifier shape остаётся implementation detail.

## 12. DerivedContent / GeneratedArtifact

KAFENE должен поддерживать reusable модель AI-/system-generated derivative
representations, а не разрастаться набором независимых `ai_*` полей.

Рабочее имя: `DerivedContent` или `GeneratedArtifact`.

Типичные outputs:

- summary;
- short answer;
- homepage/card text;
- search snippet;
- SEO description;
- FAQ candidate;
- translation draft;
- newsletter/social draft;
- later other machine-generated projections.

Минимальный lineage:

- parent canonical entity ID;
- parent revision;
- locale;
- artifact type;
- generated_at;
- pipeline/generator version;
- optional model metadata;
- review state;
- stale/current state.

Изменение parent revision должно либо:

- автоматически инвалидировать derived artifact;
- либо ставить его на regeneration.

AI-generated artifact не является independent source of truth.

Machine-generated translation сама по себе не становится published/verified.

## 13. Derived-from-verified semantics

Нужно различать:

- human/editorially verified canonical content;
- artifact, автоматически произведённый из конкретной verified revision.

Рабочий принцип:

> derived artifact может наследовать provenance от verified canonical revision,
> но не становится самостоятельным canonical verified fact.

Нужна ли отдельная formal state вроде `derived_from_verified`, остаётся
вопросом schema review.

## 14. Monitoring state и editorial verification — разные измерения

Не следует объединять всё в один большой status enum.

### Editorial verification

Например:

- unverified;
- verified;
- needs_review.

### Monitoring/freshness

Отдельно:

- source healthy / unchanged;
- source changed;
- source check failed;
- source stale;
- change pending review.

Это позволяет корректно представить ситуацию:

> Guide verified 3 дня назад, но сегодня monitoring обнаружил изменение одного
> из supporting sources, поэтому content требует review.

## 15. Freshness policy

Каждый Source должен иметь monitoring/freshness policy.

Например:

- expected check interval;
- max allowed staleness;
- criticality/risk tier.

Разные Source не обязаны проверяться одинаково часто.

Пример:

- критический immigration rule — ежедневно;
- муниципальная информационная страница — еженедельно;
- стабильный исторический reference — значительно реже.

Точные интервалы являются deployment/operations policy, не архитектурным
инвариантом.

## 16. Automation tiers

Цель — автоматизировать routine maintenance, а не требовать human approval
для каждого байта.

Рабочая risk-tier модель:

### Tier A — auto

Допустимы полностью автоматические операции, если deterministic constraints
достаточны.

Примеры:

- regeneration summary/snippet/SEO;
- translation draft;
- dead-link replacement при однозначном official redirect;
- deterministic metadata update;
- low-risk structured normalization.

### Tier B — auto + post-review / bounded auto-apply

Для простых официальных изменений при высоком confidence.

Примеры:

- fee;
- deadline;
- form version;
- office/contact details;
- opening hours.

Точные критерии auto-apply требуют отдельного policy.

### Tier C — human gate

Обязателен review для высокорисковых изменений.

Примеры:

- eligibility;
- legal interpretation;
- immigration rights;
- tax consequences;
- healthcare entitlement;
- conflicting official sources;
- ambiguous effective date.

Конкретная classification policy ещё не канонизирована.

## 17. Connector/monitor adapters

KAFENE не должен строить domain model вокруг конкретного watcher.

Потенциальные реализации могут включать:

- HTTP conditional fetch;
- API/RSS/WebSub integrations;
- changedetection-style watcher;
- Crawlee/custom connector;
- browser-rendering service;
- document/PDF normalizer;
- external SaaS monitor.

Adapter обязан нормализовать результат в KAFENE-owned observation boundary.

## 18. Что должно оставаться KAFENE-owned

Независимо от выбранных external/open-source tools, KAFENE должен владеть:

- Source registry;
- Source identity;
- monitoring policy;
- SourceObservation history;
- SourceDependency graph;
- DetectedChange lifecycle;
- canonical Change;
- canonical Guide revision;
- verification/freshness state;
- DerivedContent lineage;
- audit/provenance.

Это позволяет заменить crawler/LLM/orchestrator без потери knowledge history.

## 19. Что этим draft намеренно НЕ выбирается

Пока не фиксируются:

- конкретный watcher/crawler vendor;
- changedetection.io как production dependency;
- Firecrawl;
- Browserless;
- Crawlee;
- Docling;
- queue technology;
- scheduler;
- Temporal/Dagster;
- exact LLM;
- embeddings/vector DB;
- exact diff algorithm;
- snapshot retention period;
- exact SourceDependency enum;
- exact auto-apply thresholds;
- exact Guide field shapes;
- exact Source field shapes;
- exact DerivedContent storage strategy.

## 20. Вопросы для review

Перед канонизацией нужно проверить:

1. Не смешиваем ли мы domain, workflow и infrastructure boundaries?
2. Нужна ли `SourceObservation` как first-class persisted entity для каждого
   meaningful check или часть checks должна храниться дешевле как operational log?
3. Достаточна ли `SourceDependency` для claim-level impact analysis, или нужна
   отдельная canonical Claim/Fact entity уже в P0?
4. Следует ли `DetectedChange` быть persisted domain entity или workflow/event
   object?
5. Где проходит правильная граница между `DetectedChange` и canonical `Change`?
6. Стоит ли моделировать `DerivedContent` как reusable entity уже сейчас?
7. Как лучше выразить provenance от canonical revision к generated artifact?
8. Нужна ли отдельная state `derived_from_verified`?
9. Какие Guide fields следует делать structured first-class data, а какие
   оставить rich text?
10. Как моделировать geographic applicability без hidden semantics
    вроде "пустой locality list = весь deployment"?
11. Не создаёт ли locale-level publication + locale-level verification
    неразрешимую проблему с общей canonical entity?
12. Какие решения здесь создадут самые дорогие миграции позже, если ошибиться?
13. Что обязательно нужно зафиксировать до implementation, а что лучше оставить
    mutable до первого реального source-monitoring spike?
