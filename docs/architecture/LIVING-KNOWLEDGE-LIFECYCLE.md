# Living Knowledge Lifecycle и архитектура поддержания актуальности

Статус: **ACTIVE DRAFT**

Дата: 2026-10-04

Связанные канонические решения:

- `docs/architecture/ADR-001-FORUM-ENGINE.md` — CANONICAL;
- `docs/architecture/WEBSITE-DISCOURSE-INTEGRATION-CONTRACT.md` — CANONICAL;
- `docs/architecture/ADR-002-CMS-CONTENT-STORAGE.md` — CANONICAL;
- `docs/product/HOME-INTERACTION-MODEL.md` — CANONICAL.

## 1. Назначение

KAFENE должен быть living knowledge system, а не обычным сайтом с вручную
обновляемыми статьями.

Целевая operational-модель предполагает автоматизацию порядка **90%+ рутинной
работы** по поддержанию knowledge base:

источник
→ проверка
→ обнаружение изменения
→ определение затронутого знания
→ подготовка изменения
→ проверка/approval там, где она нужна
→ обновление canonical knowledge
→ пересборка производных представлений.

Цель автоматизации не означает автономную публикацию любых изменений.

Для фактов с повышенным риском система должна максимально автоматизировать
поиск, анализ и подготовку исправления, оставляя человеку только decision gate.

Основной принцип:

> KAFENE автоматически делает всё, что может быть сделано детерминированно и
> проверяемо, но LLM не получает права самостоятельно понижать риск изменения
> или превращать неподтверждённое внешнее изменение в опубликованный
> canonical fact.

## 2. Три архитектурных слоя

Living-knowledge pipeline разделяется на три слоя.

### 2.1. Editorial domain

Editorial domain хранится в Payload + Postgres согласно ADR-002.

К нему относятся:

- Guide;
- GuideSection;
- Source;
- SourceDependency;
- Change;
- VerificationRecord;
- Locality;
- editorial content;
- publication state;
- applicability;
- ссылки на evidence при необходимости.

Payload остаётся write boundary для editorial knowledge.

Прямые записи в Payload-generated content tables в обход Payload API запрещены.

### 2.2. Evidence / monitoring layer

Monitoring telemetry и технические evidence-records не являются editorial
content и не должны храниться в Payload только ради соблюдения общей модели CMS.

Для них используется отдельная persistence boundary, например отдельная
Postgres schema/database плюс object storage.

К evidence/operations layer относятся:

- результаты проверок источников;
- SourceObservation;
- snapshots;
- normalization metadata;
- deterministic diffs;
- operational change work items;
- triage events;
- monitoring failures;
- processing/audit metadata.

Raw snapshots при сохранении должны быть immutable и content-addressed,
например по cryptographic content hash.

Editorial domain может ссылаться на evidence records по устойчивым ID.

### 2.3. Workflow / orchestration

Workflow layer управляет процессами:

- scheduling;
- fetch;
- normalization;
- hashing;
- diff;
- risk evaluation;
- AI analysis;
- human gates;
- update proposals;
- publication;
- regeneration.

Workflow не является source of truth для editorial knowledge.

Конкретные scheduler, queue, orchestration engine и LLM этим документом
не выбираются.

## 3. Базовый lifecycle

Целевая схема:

```text
Source
→ Source check
→ fail-closed fetch/anchor validation
→ normalize
→ hash
→ deterministic diff
→ compare against last verified source state
→ определить затронутые SourceDependency
→ применить deterministic risk floor
→ при необходимости AI analysis
→ operational change work item
→ noise / dismiss / review / verified material change
→ Change
→ изменение canonical Guide
→ VerificationRecord
→ publication
→ regeneration generated representations
```

## 4. Source

Source — first-class editorial entity, представляющая внешний источник,
на который опирается knowledge base.

Source не является просто URL.

Концептуально Source должен уметь хранить:

- id;
- название;
- canonical URL или endpoint;
- publisher / authority;
- тип источника;
- язык или языки;
- jurisdiction органа;
- geographic/deployment scope;
- active/inactive state;
- monitoring strategy;
- freshness policy;
- expected check interval;
- max allowed staleness;
- last_checked_at;
- last_successful_check_at;
- monitoring health.

Точный набор полей определяется initial schema design.

## 5. Jurisdiction, geography и audience разделены

Нельзя смешивать:

1. jurisdiction источника;
2. geographic applicability знания;
3. audience applicability.

Пример:

- источник выпущен национальным ведомством;
- правило действует только в части территории;
- правило применяется только к определённой категории резидентов.

Это три разных измерения.

## 6. Locality

Locality должна быть иерархической сущностью.

Пример общей модели:

deployment / country
→ region / district
→ municipality
→ locality

Конкретная hierarchy является deployment configuration.

Applicability не должна кодироваться скрытым правилом:

"пустой список городов = вся страна".

Следует поддержать явную семантику:

- applies_to;
- excludes.

Ancestor matching должен позволять правилу, действующему на верхнем уровне,
применяться к вложенным Locality, если нет явного исключения.

Особые jurisdiction cases конкретного deployment не должны быть hard-coded
в portable core.

## 7. Monitoring strategy

Для каждого Source выбирается самый дешёвый надёжный механизм наблюдения.

Предпочтительный порядок:

1. push / webhook / native event;
2. official API;
3. RSS / Atom / feed;
4. HTTP conditional request:
   - ETag;
   - Last-Modified;
5. direct HTML/document fetch;
6. selector-based extraction;
7. rendered browser;
8. manual fallback.

Monitoring adapter заменяем.

Source identity и knowledge history не должны зависеть от конкретного crawler
или watcher.

## 8. Дешёвый слой до AI

LLM не должен вызываться на каждую плановую проверку Source.

До AI система должна использовать максимально дешёвые deterministic checks:

- HTTP metadata;
- content hash;
- normalized-content hash;
- anchor/fragment hash;
- deterministic text/structure diff.

Если релевантный normalized content подтверждён как доступный и не изменился,
processing прекращается без LLM.

Отсутствие доказанного изменения не равно доказательству отсутствия изменения:
fail-closed cases описаны отдельно ниже.

Это является обязательным cost-control invariant.

## 9. Fail-closed monitoring

Monitoring обязан различать как минимум четыре состояния:

1. релевантный content успешно получен и не изменился;
2. релевантный content успешно получен и изменился;
3. релевантный content невозможно надёжно получить/сопоставить;
4. Source не проверялся успешно дольше допустимого freshness window.

Случаи 3 и 4 **никогда не интерпретируются как "unchanged"**.

К fail-closed conditions относятся как минимум:

- source-side anchor больше не найден;
- DOM/document structure изменилась так, что anchor не разрешается;
- Source исчез;
- Source возвращает redirect, который не подтверждён как допустимый canonical move;
- Source возвращает soft-404 или заглушку вместо ожидаемого content;
- fetch/parse/normalization стабильно падают;
- `last_successful_check_at` старше `max_allowed_staleness`;
- content shape становится несовместимым с текущим normalization/anchor profile.

Такие случаи создают отдельный high-risk operational finding и требуют
human gate либо заранее определённого recovery workflow.

LLM не может закрыть fail-closed finding как "изменений нет".

## 10. Normalization profile

Нормализация должна иметь версию.

Каждый evidence record, который зависит от normalized representation, должен
указывать:

- `normalization_profile_version`.

Причина:

изменение алгоритма нормализации не должно выглядеть как реальное изменение
внешнего источника.

Normalization может удалять, например:

- timestamps;
- analytics markup;
- session tokens;
- generated IDs;
- menus;
- navigation noise;
- динамические баннеры;
- другой нерелевантный layout noise.

Конкретные правила normalization не замораживаются до monitoring spike.

## 11. SourceObservation

SourceObservation — immutable evidence record о содержательном состоянии Source
в определённый момент.

Не каждая успешная unchanged-проверка обязана создавать полноценный
SourceObservation.

Для unchanged checks достаточно обновлять monitoring freshness, например:

- last_checked_at;
- last_successful_check_at;
- health/status.

Полная SourceObservation создаётся как минимум:

- при изменении релевантного content hash;
- при новом baseline;
- при специально запрошенной audit snapshot;
- при fail-closed incident, если есть сохраняемый evidence;
- в других случаях, определённых retention policy.

SourceObservation концептуально содержит:

- observation_id;
- source_id;
- observed_at;
- fetch status;
- HTTP metadata, если применимо;
- raw_content_hash;
- normalized_content_hash;
- normalization_profile_version;
- snapshot reference;
- previous relevant observation;
- connector/adapter version.

Observation фиксирует evidence.

Observation не означает, что правило или canonical knowledge изменились.

## 12. Raw snapshots

Raw snapshot, если он сохраняется:

- immutable;
- content-addressed;
- хранится вне Payload;
- может переиспользоваться несколькими observations при одинаковом содержимом;
- не изменяется задним числом.

Retention policy определяется отдельно, но действует важный инвариант:

> evidence, на которое ссылается опубликованный Change или VerificationRecord,
> не должно физически исчезать из-за обычной retention policy.

Если storage lifecycle требует очистки, должна сохраняться как минимум
неразрушаемая evidence tombstone/reference с content hash и audit metadata,
достаточная для доказуемого lineage.

Object storage provider этим документом не выбирается.

## 13. SourceDependency

SourceDependency связывает canonical knowledge с доказательной базой.

Простой relation:

Guide → Source

недостаточен.

Dependency должна позволять ответить:

> "Что именно этот источник подтверждает и какая часть Guide зависит
> от какой части источника?"

## 14. Двустороннее якорение SourceDependency

SourceDependency должна содержать как минимум два смысловых ориентира.

### Source-side anchor

Какая область Source является релевантной.

Это может быть:

- DOM/selector region;
- heading path;
- table/row;
- document section;
- text fragment;
- semantic anchor;
- fragment fingerprint;
- комбинация нескольких способов.

Точный anchor format НЕ замораживается до empirical spike.

Но замораживаются требования к контракту:

- anchor имеет собственный stable identity;
- anchor имеет `anchor_spec_version`;
- хранится human-readable quote/excerpt или equivalent evidence fragment,
  к которому anchor был привязан;
- хранится hash релевантной области Source;
- должна быть возможность отличить "fragment changed" от "anchor lost".

### Knowledge-side target

Какая часть canonical knowledge зависит от Source.

Например:

- GuideSection;
- KeyFact;
- applicability rule;
- effective interval;
- иной typed target.

## 15. Verified source baseline

Для impact analysis недостаточно сравнивать только previous observation с current.

SourceDependency должна хранить или однозначно адресовать baseline релевантной
области Source, с которой было синхронизировано последнее подтверждённое
canonical knowledge state.

Минимально требуется:

- `last_verified_source_fragment_hash`;
- `anchor_spec_version`;
- ссылка на evidence/observation, использованную при verification;
- human-readable excerpt/quote для audit/re-anchoring.

Вопрос:

> "Guide всё ещё согласован с Source?"

должен решаться сравнением текущего anchor/fragment hash с verified baseline,
а не только соседних observations.

Это предотвращает накопление незамеченного drift после ошибочно dismissed
finding или долгого review queue.

## 16. Aspect SourceDependency

Dependency может дополнительно классифицировать поддерживаемый aspect.

Рабочие примеры:

- eligibility;
- requirements;
- procedure;
- cost;
- timing;
- legal_basis;
- contact;
- applicability;
- general.

Конкретная taxonomy остаётся изменяемой до monitoring spike.

## 17. Impact analysis

Изменение Source не должно автоматически считаться изменением всех Guides,
которые на него ссылаются.

Impact определяется прежде всего пересечением:

changed source region
×
SourceDependency source anchor
×
knowledge-side target.

Изменение menu/footer/banner вне зависимой области не должно поднимать
связанные Guides на review.

При этом потеря anchor сама по себе является high-risk finding, а не отсутствием
impact.

## 18. Operational change work item

После релевантного diff или fail-closed condition создаётся persistent
operational work item.

Это НЕ editorial domain entity и НЕ canonical Change.

Он нужен для audit:

- что изменилось;
- какие observations сравнивались;
- какой verified baseline использовался;
- какие dependencies затронуты;
- почему изменение было проигнорировано;
- почему оно было передано человеку;
- какой результат triage.

Неизменяемая evidence-часть должна включать:

- previous/current observation либо current observation + verified baseline;
- deterministic diff;
- затронутые dependencies;
- fail-closed reason, если применимо.

Workflow state развивается через append-only events:

- detected;
- classified;
- dismissed;
- escalated;
- reviewed;
- linked_to_change;
- closed.

Точное имя operational record не фиксируется.

Рабочие варианты:

- DetectedChange;
- ChangeCandidate;
- MonitoringFinding.

Она остаётся operational, а не editorial entity.

## 19. Deterministic risk floor

LLM не имеет права понижать минимальный риск, установленный deterministic rules.

Если deterministic rule говорит "human gate", LLM не может заменить его
на automatic publication.

LLM может:

- повысить риск;
- объяснить изменение;
- классифицировать;
- предложить affected fields;
- подготовить patch;
- собрать evidence;
- оценить ambiguity.

Но не может отменить deterministic minimum.

## 20. Минимальные high-risk triggers

До накопления empirical evidence к human gate должны как минимум вести
изменения, затрагивающие:

- eligibility;
- legal basis;
- права/обязанности;
- immigration status;
- taxation consequences;
- healthcare entitlement;
- conflicting official sources;
- неоднозначную effective date.

Также deterministic rules должны отдельно реагировать как минимум на изменение:

- чисел;
- денежных сумм;
- процентных ставок;
- дат;
- сроков;
- перечислений обязательных документов,

если они находятся внутри релевантного SourceDependency anchor.

К high-risk findings также относятся fail-closed monitoring incidents из §9.

Конкретная risk taxonomy уточняется после spike.

## 21. Недоверенное содержимое источников

Любой внешний Source, включая официальную web page, PDF, document или API field,
считается **данными, а не инструкциями для модели**.

LLM, анализирующая Source, не должна получать полномочия:

- исполнять инструкции из Source;
- менять risk policy;
- писать непосредственно в published editorial content;
- обходить Payload write boundary;
- инициировать side effects вне разрешённого workflow.

Результат LLM на этом этапе — только structured analysis / draft proposal /
classification в пределах policy.

Source content не может сам расширить полномочия агента.

## 22. Auto tier на начальном этапе

До получения production evidence автоматический режим не должен напрямую
переписывать опубликованные factual claims только на основании LLM.

Без human publication gate допускаются прежде всего:

- monitoring metadata;
- freshness metadata;
- normalization;
- technical link maintenance при однозначном результате;
- пересборка generated artifacts из уже verified canonical inputs;
- translation drafts;
- internal search/index refresh;
- drafts и proposed patches.

Система может полностью автоматически подготовить изменение factual content,
но publish gate для значимых factual changes на первом этапе остаётся у человека.

## 23. Будущее расширение auto-apply

Запрет на automatic factual publishing не является вечным архитектурным
ограничением.

После накопления measured evidence отдельные классы изменений могут получить
bounded auto-apply policy.

Например:

- однозначный official API field;
- формализованная fee value;
- deterministic deadline;
- form version;
- contact metadata.

Переход к auto-apply должен опираться на measured false-positive/false-negative
performance, а не только на confidence LLM.

## 24. Guide

Guide — canonical editorial answer KAFENE на практический вопрос.

Guide не является:

- forum topic;
- raw source mirror;
- arbitrary page-builder document;
- event log.

## 25. Guide identity

Guide имеет:

- canonical UUID;
- один identity для всех locales;
- независимые localized representations;
- TopicSpace relation;
- slug как presentation concern, а не identity.

Publication state остаётся locale-specific.

## 26. Guide content shape

Initial Guide не должен превращаться в чрезмерно сложную domain model.

Рабочая модель:

- title;
- summary;
- stable GuideSections;
- key facts;
- applicability;
- publication/localization data;
- source dependencies через relations.

Большая часть prose остаётся rich text внутри GuideSection.

Не следует заранее превращать каждую смысловую единицу Guide в отдельную
глобальную Fact entity.

## 27. GuideSection identity и localization

SourceDependency должна иметь возможность указывать на один и тот же logical
раздел Guide независимо от locale.

Поэтому identity раздела должен быть **нелокализованным и стабильным**.

Рабочая модель:

- GuideSection имеет stable UUID или stable non-localized key;
- GuideSection принадлежит одному Guide;
- порядок section хранится отдельно от localized title/body;
- title/body локализованы;
- SourceDependency ссылается на GuideSection identity, а не на translated heading.

Initial schema не должна использовать Payload localized blocks как обязательную
основу Guide sections.

Причина: localized complex structures в Payload 3.x уже выделены как отдельный
risk-class в ADR-002.

Предпочтительный initial direction — отдельная структурированная GuideSection
collection/child entity с localized scalar/rich-text fields и stable relation
к Guide, если pinned-version spike подтверждает корректность drafts/versioning/
localization для такого shape.

До schema freeze нужен отдельный bounded test именно для выбранной GuideSection
реализации на Payload 3.90.2 + Postgres.

## 28. KeyFact

Для волатильных и хорошо типизируемых данных Guide может содержать небольшой
набор structured KeyFact.

Примеры:

- application fee;
- processing time;
- deadline;
- minimum income;
- validity period;
- document count;
- office hours.

Концептуально KeyFact содержит:

- stable key/ID;
- label;
- typed value;
- unit/currency;
- validity interval;
- locale presentation;
- SourceDependency.

## 29. Временная модель KeyFact

KeyFact не должен иметь только одну "дату вступления".

Значение имеет интервал действия:

- `valid_from`;
- `valid_until` nullable.

Это позволяет хранить:

- текущее значение;
- объявленное будущее значение;
- завершившееся историческое значение.

До наступления `valid_from` future value не заменяет текущий факт в public
presentation, а отображается по отдельной presentation policy.

Перекрывающиеся интервалы для одного logical KeyFact должны либо быть явно
разрешены доменной policy, либо отклоняться validation.

## 30. Future Fact promotion

Если один и тот же logical fact начинает использоваться несколькими Guides,
может потребоваться отдельная canonical Fact entity.

Initial KeyFact design должен позволять такое повышение без полной ручной
переработки knowledge base.

Но отдельная global Claim/Fact ontology сейчас НЕ вводится.

## 31. Change

Change — editorial/canonical запись о подтверждённом meaningful изменении.

Например:

> "С 1 января application fee повышается с EUR 70 до EUR 90."

Change не является техническим diff.

## 32. Change может существовать без monitoring pipeline

Manual path остаётся first-class.

Редактор может создать Change вручную на основании:

- официального объявления;
- документа;
- сообщения ведомства;
- иного проверенного evidence.

Monitoring automation не является обязательным источником каждого Change.

## 33. Change и evidence: many-to-many

Один Change может подтверждаться:

- несколькими Sources;
- несколькими SourceObservations;
- несколькими operational findings.

И наоборот:

многие operational findings могут оказаться:

- noise;
- duplicate evidence;
- частью одного canonical Change;
- вообще не привести к Change.

Связь не должна быть one-to-one.

## 34. Четыре времени Change

Для Change необходимо различать как минимум:

- `observed_at` — когда KAFENE обнаружил или получил информацию;
- `verified_at` — когда изменение признано достоверным;
- `effective_at` — когда правило фактически начинает действовать;
- `published_at` — когда KAFENE опубликовал Change.

Эти времена не взаимозаменяемы.

## 35. Исправление, отзыв и замена Change

Canonical Change не переписывает историю задним числом.

Если ранее опубликованное изменение:

- исправлено;
- перенесено;
- отозвано;
- заменено новым;
- признано ошибочным,

создаётся новый append-only correction/supersession record или новый Change,
с явной связью с исходным Change.

Минимальные relation semantics:

- corrects / corrected_by;
- supersedes / superseded_by;
- withdraws / withdrawn_by,

либо эквивалентный нормализованный механизм.

Исходная запись остаётся доступной в audit/history.

Точная schema relationship определяется отдельно, но принцип "не переписывать
историю" является invariant.

## 36. VerificationRecord

Verification не должна быть mutable boolean flag на Guide.

Используется append-only VerificationRecord.

Рабочая структура:

- verification_id;
- entity_id;
- locale;
- `verification_content_hash`;
- `hash_spec_version`;
- verified_at;
- verified_by;
- verification_method;
- optional evidence references.

Текущее content representation считается verified, если существует действующая
VerificationRecord, у которой:

- entity/locale совпадают;
- `hash_spec_version` соответствует поддерживаемой verification hash spec;
- `verification_content_hash` совпадает с hash текущего проверяемого
  canonical content.

## 37. Append-only enforcement VerificationRecord

Append-only — не только документационная конвенция.

Для VerificationRecord должны быть технически запрещены обычные update/delete
операции через Payload access control / hooks / permissions.

Коррекция ошибочной VerificationRecord выполняется новой записью, которая явно
ссылается на предыдущую как correction/revocation, а не её редактированием.

Это поведение должно быть покрыто automated test.

## 38. Verification hash contract

`verification_content_hash` вычисляется не из произвольного raw JSON.

Нужен versioned canonical serialization contract.

Он должен определять как минимум:

- какие поля входят в verification;
- locale;
- порядок collections/sections;
- canonical key ordering;
- Unicode normalization;
- представление null/absence;
- представление rich-text structures;
- правила numeric/date serialization.

Каждая VerificationRecord хранит `hash_spec_version`.

Содержимое конкретной hash spec может эволюционировать, но изменение spec
не должно молча инвалидировать всю существующую историю.

Migration/reverification policy при новой `hash_spec_version` определяется
отдельно.

## 39. Автоматическая invalidation verification

При изменении canonical localized content, входящего в текущую hash spec,
меняется `verification_content_hash`.

Старая VerificationRecord остаётся в истории, но больше не подтверждает
текущее содержание.

Следовательно:

- не требуется вручную удалять старую verification;
- история проверки сохраняется;
- изменение RU не инвалидирует EN, если EN verification hash не изменился.

## 40. Verification и monitoring freshness разделены

Verification отвечает:

> "Это содержание было проверено?"

Monitoring отвечает:

> "После проверки появились сигналы, что источник мог измениться или monitoring
> потерял способность это доказать?"

Guide может одновременно быть:

- historically verified;
- published;
- но нуждаться в review из-за нового source change или fail-closed finding.

Monitoring state не заменяет verification state.

## 41. Что видит читатель при открытом finding

Public presentation не должна скрывать открытый monitoring risk.

Минимально система должна уметь показать для затронутого Guide/section/key fact:

- когда content последний раз был verified;
- что после verification обнаружено изменение/проблема мониторинга;
- что актуальность сейчас проверяется.

Рабочее reader-facing состояние:

- **Проверено**;
- **Требует перепроверки**;
- **Мониторинг источника недоступен/просрочен**.

Точный UI wording определяется frontend/product layer.

High-risk finding не должен оставлять пользователю безусловную маркировку
"актуально/проверено" для затронутой части knowledge.

## 42. Review SLA

Human-gated findings должны иметь review SLA, зависящий от risk class.

До production launch должна быть принята конкретная operations policy.

Initial architectural floor:

- high-risk finding не может оставаться без owner/queue;
- SLA breach сам становится operational alert;
- просроченный finding сохраняет/усиливает reader-facing stale state;
- queue health и median/max review latency измеряются.

Конкретные часы/дни не замораживаются этим документом до monitoring spike,
но production без заданного SLA не допускается.

## 43. Locale synchronization state

Поскольку официальный Source может существовать на одном языке, а Guide —
на нескольких, нужно различать:

- canonical source language;
- locale representation Guide;
- состояние синхронизации локали с актуальным verified knowledge state.

RU representation может быть опубликована и переведена из EN/EL source,
но должна иметь понятный provenance.

Точная locale-sync state machine определяется отдельно.

## 44. Generation lineage

Lineage generated content не должен зависеть исключительно от Payload revision ID.

Primary lineage key для генератора:

- `generation_input_hash`.

Он вычисляется из **конкретного набора canonical localized inputs**, которые
прочитал generator.

Это другой hash contract, чем verification hash.

## 45. Generation hash contract

GenerationRecord должен хранить:

- `generation_input_hash`;
- `hash_spec_version`;
- generator/pipeline identifier;
- generator version;
- model metadata при необходимости;
- generated_at;
- locale;
- artifact/field reference;
- optional VerificationRecord reference.

`generation_input_hash` вычисляется по versioned canonical serialization spec,
определяющей конкретные входы данного generator/pipeline.

Изменение RU не делает EN artifact stale, если EN generator inputs не изменились.

Изменение нерелевантного metadata не обязано инвалидировать artifact.

Payload revision/version ID может сохраняться как reference/debug metadata,
но не является главным ключом актуальности.

## 46. GenerationRecord вместо универсального DerivedContent

Универсальная сущность DerivedContent сейчас не вводится.

Причина:

под одним названием смешиваются разные вещи:

- summary;
- translation draft;
- SEO text;
- search embedding;
- homepage snippet;
- Ask answer;
- newsletter text.

Они имеют разный lifecycle и разные места хранения.

Для любого хранимого generated artifact достаточно общего GenerationRecord /
generation metadata.

## 47. Generated output не является source of truth

Generated content всегда производен от canonical knowledge.

Например:

Guide canonical fields
→ generated summary

или:

Guide canonical locale
→ translation draft другой locale.

Generated artifact не должен становиться независимым canonical factual source.

## 48. derived_from_verified не хранится как mutable flag

Состояние "derived from verified" вычисляется из provenance.

GenerationRecord может ссылаться на VerificationRecord, которая была действительна
для соответствующего verification content/hash context при generation.

Булев flag `derived_from_verified` не нужен.

## 49. Политика генерации и переводов

Рабочий принцип:

- автоматическая публикация generated representation допускается только там,
  где отдельная policy явно разрешает это для verified canonical input;
- generation из unverified input может выполняться как draft/internal artifact;
- machine-generated translation сама по себе не получает verified status;
- **в P0 machine-generated translation автоматически НЕ публикуется**;
- публикация перевода требует отдельного editorial action.

## 50. Стоимость pipeline как first-class operational metric

Поскольку monitoring должен масштабироваться до сотен и тысяч Sources,
стоимость processing должна измеряться с первого production implementation.

Следует собирать как минимум:

- number of checks;
- browser/rendering usage;
- extraction cost;
- AI input tokens;
- AI output tokens;
- AI cost;
- number of deterministic diffs;
- number of operational findings;
- number of material Changes;
- number of human reviews;
- cost per material Change.

Cost metadata относится к operations/analytics, а не editorial domain.

## 51. Cost firewall

Архитектурный порядок processing:

cheap deterministic check
→ valid source/anchor?
→ relevant-region change?
→ deterministic risk
→ cheap semantic classification if needed
→ expensive reasoning only for relevant cases
→ human only for required gates.

Нельзя использовать дорогой model pass для unchanged Source checks.

## 52. KAFENE-owned state

Независимо от внешних инструментов KAFENE владеет:

- Source registry;
- Source identity;
- SourceDependency graph;
- normalization profile definitions/versions;
- anchor contract/version;
- evidence references;
- verification history;
- canonical Change;
- canonical Guide/GuideSection;
- GenerationRecord lineage;
- editorial decisions;
- audit trail.

## 53. Replaceable infrastructure

Заменяемыми implementation components остаются:

- changedetection.io;
- Crawlee;
- Firecrawl;
- Browserless;
- Docling;
- custom scrapers;
- RSS/API adapters;
- scheduler;
- queue;
- workflow engine;
- model provider;
- LLM;
- diff implementation;
- object storage provider.

Замена такого компонента не должна требовать миграции canonical knowledge model.

## 54. Требуемая поправка к ADR-002

Перед реализацией monitoring layer ADR-002 должен быть уточнён:

его write-boundary относится к editorial content/domain, а не ко всей
операционной информации KAFENE.

Нужно явно разрешить отдельный evidence/operations persistence layer для:

- SourceObservations;
- monitoring telemetry;
- snapshots;
- diffs;
- workflow events;
- processing metadata.

Эти данные не должны писаться напрямую в Payload content tables.

При этом любые изменения editorial entities по-прежнему проходят через
поддерживаемую Payload write boundary.

## 55. Что нужно заморозить до implementation

Следующие invariants считаются высокостоимостными для поздней миграции и должны
быть закрыты до production implementation:

1. Разделение editorial и evidence/operations storage.
2. Immutable/content-addressed raw evidence.
3. Evidence retention: referenced evidence не исчезает.
4. Версия normalization profile как часть evidence.
5. SourceDependency имеет source-side anchor и knowledge-side target.
6. Anchor имеет `anchor_spec_version` и verified baseline fragment/hash.
7. Verification lineage основан на `verification_content_hash`.
8. Generation lineage основан на отдельном `generation_input_hash`.
9. Оба hash contracts имеют `hash_spec_version` и canonical serialization.
10. Verification является append-only record, технически защищённой от update/delete.
11. Publication, verification и monitoring freshness разделены.
12. Change имеет observed_at, verified_at, effective_at, published_at.
13. Change corrections/supersession append-only.
14. KeyFact value имеет validity interval.
15. LLM не может понижать deterministic risk floor.
16. Monitoring fail-closed.
17. Locality иерархична.
18. Jurisdiction, geographic applicability и audience различаются.
19. Machine-generated translations в P0 не публикуются автоматически.

## 56. Что НЕ нужно замораживать до empirical spike

До первого реального monitoring spike остаются гибкими:

- конкретный anchor format;
- normalization rules;
- aspect taxonomy;
- risk tier thresholds;
- model/prompts;
- crawler adapter interface details;
- check schedules;
- exact KeyFact schema;
- global Fact entity;
- auto-apply thresholds;
- orchestration engine;
- non-referenced evidence retention period;
- конкретные review SLA values;
- exact GuideSection storage shape после bounded Payload test.

## 57. Falsifying monitoring spike

Перед замораживанием anchor и normalization design требуется empirical spike.

Минимальный масштаб:

- 5–10 реальных Cyprus sources;
- 3 реальных Guides;
- 2–4 недели live observation;
- HTML pages;
- PDF;
- forms/documents;
- по возможности один dynamic/JS source.

Live monitoring недостаточен сам по себе, потому что за 2–4 недели реальные
официальные изменения могут вообще не произойти.

Поэтому spike обязан включать три режима:

1. **Live observation** реальных источников.
2. **Historical replay** архивных/предыдущих версий тех же источников, где они
   доступны.
3. **Synthetic mutation suite** сохранённых snapshots для контролируемой проверки
   recall и fail-closed behavior.

## 58. Обязательные synthetic/failure scenarios

Synthetic/replay suite должен включать как минимум:

- изменение суммы;
- изменение даты;
- изменение срока;
- добавление/удаление requirement;
- изменение eligibility wording;
- изменение только menu/footer/banner;
- перестановку DOM без semantic change;
- anchor moved;
- anchor missing;
- source returns hard 404;
- source returns soft-404;
- redirect на главную;
- source unavailable;
- freshness window breached;
- normalization profile version changed;
- PDF replaced новой версией;
- form/document link replaced;
- conflicting source evidence.

## 59. Метрики spike

Нужно измерить:

1. false-positive rate page-level monitoring;
2. false-positive rate anchor-level monitoring;
3. false-negative / miss rate на replay + synthetic mutation suite;
4. anchor-loss detection rate;
5. soft-404/redirect/freshness failure detection rate;
6. насколько anchors уменьшают шум;
7. сколько изменений обнаруживается чисто deterministic rules;
8. сколько случаев реально требуют LLM;
9. сколько случаев реально требуют человека;
10. долю PDF/forms/non-HTML sources;
11. устойчивость anchors;
12. причины поломки anchors;
13. влияние разных normalization profiles;
14. average processing cost per Source;
15. cost per material Change;
16. median/max human review latency;
17. долю routine work, реально автоматизируемую без factual auto-publish.

## 60. Go / no-go criteria spike

До старта spike должны быть зафиксированы численные acceptance thresholds.

Они не должны определяться после просмотра результатов.

Минимальные категории thresholds:

- recall на synthetic/replay material changes;
- detection rate fail-closed scenarios;
- acceptable anchor-loss rate;
- acceptable false-positive rate;
- acceptable human-review load;
- acceptable average monthly cost per Source;
- доля checks, завершающихся без LLM;
- доля material findings, для которых система корректно определяет affected
  SourceDependency;
- устойчивость выбранного anchor mechanism.

Конкретные числа задаются отдельным spike protocol до запуска.

Если ключевой threshold не достигнут, architecture assumption считается
неподтверждённой и пересматривается.

## 61. Кандидаты источников для spike

Нужен разнообразный набор, а не десять похожих HTML pages.

Рабочие классы:

- migration/residency;
- taxation;
- electricity/utilities;
- vehicle/MOT/transport;
- municipality/local authority;
- official PDF/document;
- page with forms/downloads;
- dynamic/JS-heavy government page.

Конкретные URLs выбираются отдельным bounded task.

## 62. Цель spike

Spike не должен доказывать заранее выбранную архитектуру.

Он должен позволить ответить:

- anchors действительно лучше page-level monitoring?
- какой anchor mechanism достаточно устойчив?
- насколько часто normalization создаёт ложные изменения?
- monitoring действительно fail-closed?
- какой recall достигается на known material changes?
- сколько source changes можно обработать без LLM?
- сколько LLM-classifications реально требуется?
- где необходим human gate?
- реальна ли цель 90%+ routine automation на фактических данных?

## 63. Ограничение цели 90%+

"90%+ automation" означает автоматизацию рутинной работы pipeline:

- monitoring;
- diff;
- evidence capture;
- impact analysis;
- classification;
- drafting;
- regeneration;
- routing;
- preparation of approvals.

Это НЕ означает заранее установленную цель:

"90% factual changes публикуются без человека".

Доля automatic factual publishing должна определяться evidence после эксплуатации.

## 64. Initial implementation principle

До получения empirical evidence система должна быть консервативной в publish
и агрессивной в automation до publish gate.

Иными словами:

машина должна сделать максимально много работы сама,
а человек должен получать максимально маленькое и понятное решение:

> "Вот официальный источник.
> Вот что изменилось.
> Вот какой факт KAFENE затронут.
> Вот старая версия.
> Вот новая.
> Вот предлагаемое исправление.
> Вот evidence.
> Approve / Reject."

## 65. Итоговая минимальная модель

После architecture review минимальный durable состав выглядит так.

### Editorial domain

- Guide;
- GuideSection;
- Source;
- SourceDependency;
- Change;
- VerificationRecord;
- Locality.

### Evidence / operations

- SourceObservation;
- raw snapshot reference;
- operational change work item + append-only triage events;
- monitoring/process metadata.

### Generated content

- хранится по месту назначения;
- сопровождается GenerationRecord / generation metadata;
- lineage основан на `generation_input_hash`.

Не вводятся сейчас:

- универсальный DerivedContent;
- глобальная Fact ontology;
- DetectedChange как editorial domain entity;
- mutable `derived_from_verified` flag;
- mutable `verified` boolean как единственный источник истины.

## 66. Открытые вопросы после v3

До канонизации остаются вопросы, которые должен разрешить monitoring spike
или следующий schema-design pass:

1. Конкретный формат source anchor.
2. Конкретная GuideSection storage shape на Payload 3.90.2 + Postgres.
3. Конкретные canonical serialization rules для verification hash spec.
4. Конкретные canonical serialization rules для generation hash spec.
5. Initial KeyFact representation.
6. Locale synchronization representation.
7. Evidence persistence topology.
8. Snapshot retention для non-referenced evidence.
9. Risk taxonomy после empirical data.
10. Concrete monitoring adapters для первого deployment.
11. Граница между cheap classifier и deeper reasoning model.
12. Конкретная human review SLA policy.
13. Порог, после которого отдельные typed facts могут получить auto-apply.

## 67. Следующий шаг

До канонизации lifecycle:

1. внести узкое уточнение в ADR-002 о разделении editorial и evidence storage;
2. провести bounded Payload test выбранной GuideSection representation;
3. подготовить отдельный spike protocol с численными go/no-go thresholds;
4. выбрать 5–10 реальных Cyprus sources и 3 Guides;
5. провести live + historical replay + synthetic falsifying spike;
6. на основании измерений зафиксировать anchor и normalization contracts;
7. только затем канонизировать living-knowledge lifecycle.
