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
- MonitoringFindings;
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
→ MonitoringFinding
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
- freshness policy;
- expected check interval;
- max allowed staleness.

Operational state и adapter configuration НЕ принадлежат Source editorial entity.
Они хранятся в evidence/operations layer по `source_id`, включая:

- active adapter/config;
- last_checked_at;
- last_successful_check_at;
- current monitoring health;
- transient failure counters;
- runtime diagnostics.

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

Source identity также переживает смену URL. История canonical/previous URLs
сохраняется; redirect сам по себе не создаёт новую Source entity. Подтверждённая
миграция URL оформляется как изменение адреса существующего Source.

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
- anti-bot challenge / CAPTCHA;
- cookie wall, закрывающий ожидаемый content;
- maintenance/interstitial page даже при HTTP 200;
- authentication/error shell вместо ожидаемой публичной страницы.

Такие случаи создают отдельный high-risk MonitoringFinding и требуют human gate
либо заранее определённого recovery workflow.

Transient failures могут debounce/retry'иться, но retry/debounce window не может
пересечь `max_allowed_staleness`.

Для одного непрерывного failure episode должен существовать один открытый
MonitoringFinding с append-only событиями, а не новый finding на каждый retry.

Автозакрытие fail-closed finding допустимо только:
- детерминированно, если релевантный fragment снова успешно разрешён и его hash
  совпадает с verified/acknowledged baseline;
- либо человеком.

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

Retention также распространяется на snapshots/evidence, используемые активным
verified baseline или acknowledgement.

Append-only triage events, dismissals и verification provenance являются audit
records и не подпадают под обычную snapshot cleanup policy.

Source, Guide, GuideSection и SourceDependency, на которые ссылаются evidence,
VerificationRecord или published Change, не hard-delete'ятся: используется
deactivation/tombstone semantics.

Evidence database role для immutable observations/events должна по возможности
иметь INSERT-only/no-UPDATE privileges на соответствующие immutable tables.

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

Каждая SourceDependency обязана иметь классифицированный `aspect`.

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

`unclassified` допустим только как временное состояние создания/миграции и
для risk policy приравнивается к максимальному риску. Low-risk automation для
unclassified dependency запрещена.

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

Кроме anchored impact существует отдельная обязательная категория:

- `unanchored_main_content_change`.

Если внутри основной содержательной области Source появилось/исчезло/изменилось
содержимое вне существующих anchors, это не считается шумом автоматически.

Такое изменение создаёт persistent MonitoringFinding с отдельным priority/risk
policy. Порог эскалации определяется после spike, но сама категория является
архитектурным invariant.

Это защищает от false negative вида:

> "На страницу добавили новое обязательное требование, которого раньше не было
> и поэтому не существовало anchor."

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

Канонический термин: **MonitoringFinding**.

MonitoringFinding остаётся operational record, а не editorial entity.

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

Минимальные технические controls:

- output LLM schema-validated;
- analysis model не имеет tool-доступа к записи/publish side effects;
- hidden/invisible text (например display:none/zero-width artifacts) удаляется
  normalization layer и логируется как anomaly;
- source excerpts в reviewer UI явно рендерятся как untrusted evidence;
- fetch/render/PDF parsers работают в sandbox без application secrets;
- egress ограничен необходимыми destinations;
- redirect chain проверяется против policy/allowlist;
- reviewer UI показывает baseline и current evidence рядом, чтобы снизить риск
  манипулятивного diff framing.

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

Initial schema не должна автоматически выбирать Payload localized blocks.

До schema freeze сравниваются как минимум два shape:

1. нелокализованный массив/структура sections внутри Guide, где каждая строка
   имеет stable non-localized section ID, а текстовые листья локализованы;
2. отдельная GuideSection collection/child entity со stable relation к Guide.

Сравнение обязано проверить:

- атомарную публикацию Guide;
- невозможность частично опубликовать несогласованный набор sections;
- draft/versioning behavior;
- locale independence;
- стабильность section identity при save/reorder;
- совместимость с verification component manifest;
- Payload 3.90.2 + Postgres behavior.

Отдельная collection не принимается только потому, что она "чище":
если она разрушает атомарную публикацию Guide, это blocker.

Нелокализованный массив с localized leaves — отдельный shape и не должен
автоматически приравниваться к problematic localized blocks из upstream issue.

До schema freeze нужен bounded comparative test обоих вариантов.

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

Семантика времени фиксируется заранее:

- для правовых/административных effective dates используется civil date в
  timezone/юрисдикции соответствующего deployment, если Source не задаёт точный
  instant;
- exact instant используется только когда он действительно дан/нужен.

Все consumers используют одну общую `as_of` semantics:

- website;
- search;
- Ask KAFENE;
- generated snippets;
- monitoring impact logic.

При gap между intervals значение считается **не определено**, а не "последнее
известное".

`Change.effective_at` описывает событие изменения, а отображаемое factual
value берётся из KeyFact interval. Change должен ссылаться на созданный/
затронутый interval, если изменение относится к KeyFact.

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

После publication обычное редактирование canonical Change запрещено.

Исправление даже factual typo выполняется audit-preserving correction path.

Change должен иметь собственную verification/evidence provenance по тем же
общим принципам: published Change не считается подтверждённым только из-за
самого факта публикации.

Если generated artifact использует Change (например блок "Что изменилось"),
его GenerationRecord обязан включать component inputs Change, включая
correction/withdrawal state, чтобы withdrawal/supersession делали artifact stale.

## 36. VerificationRecord как манифест

VerificationRecord является append-only манифестом того, **что именно было
проверено и против какого evidence**.

Он не должен быть одной записью с единственным общим hash на весь Guide.

Рабочая структура:

- verification_id;
- entity_id;
- locale;
- verification_type;
- verified_at;
- verified_by_actor_ref;
- hash_spec_version;
- component_manifest[];
- source_dependency_manifest[];
- optional root_manifest_hash;
- optional correction/revocation reference.

### 36.1. Component manifest

Для каждой проверяемой части canonical knowledge сохраняется отдельный компонент:

- component_id;
- component_type;
- component_hash;
- locale, если компонент локализован;
- hash_spec_version.

Минимальные component types:

- GuideSection;
- KeyFact;
- общие нелокализованные поля, влияющие на смысл/applicability.

Хеш locale representation формируется из:

- общих нелокализованных semantic fields;
- плюс fields именно этой locale.

Правка RU не должна автоматически инвалидировать EN, если общие поля и EN
components не изменились.

### 36.2. Source dependency manifest

Для каждой зависимости, использованной при verification, манифест фиксирует:

- source_dependency_id;
- source_anchor_version_id;
- anchor_spec_version;
- source_fragment_hash;
- normalization_profile_version;
- evidence / SourceObservation reference;
- optional human-readable source excerpt;
- verified component_id(s), которые эта dependency подтверждает.

Таким образом historical fact:

> "на момент T компонент C был сверен с fragment H Source S"

не зависит от изменяемых полей SourceDependency.

### 36.3. Root manifest hash

Общий/root hash может вычисляться из component manifest для integrity/audit,
но **не является единственной гранулярностью verification**.

Reader-facing verification и generation provenance вычисляются по компонентам.

## 37. Append-only enforcement VerificationRecord

Append-only — не только документационная конвенция.

Для VerificationRecord должны быть технически запрещены обычные update/delete
операции через Payload access control / hooks / permissions.

Коррекция ошибочной VerificationRecord выполняется новой append-only записью,
которая явно ссылается на предыдущую как correction/revocation.

Это поведение должно быть покрыто automated test.

`verified_by_actor_ref` должен быть устойчивым audit reference, а не копией
отображаемого имени.

Если связанный пользователь позже удалён или анонимизирован по privacy/GDPR
policy, verification history не должна терять целостность: actor identity может
перейти в tombstoned/anonymized representation без изменения самой
VerificationRecord.

## 38. Verification hash contract

Component hashes вычисляются не из произвольного raw JSON.

Нужен versioned canonical serialization contract.

Он должен определять как минимум:

- какие fields входят в каждый component type;
- locale semantics;
- порядок collections/sections;
- canonical key ordering;
- Unicode normalization;
- представление null/absence;
- представление rich-text structures;
- правила numeric/date serialization.

Каждая VerificationRecord хранит `hash_spec_version`.

Содержимое конкретной hash spec может эволюционировать, но изменение spec
не должно молча превращать всю существующую историю в "непроверенную".

Migration/reverification policy при новой `hash_spec_version` определяется
отдельно.

## 39. Действующая verification

Component считается verified, если существует действующая VerificationRecord,
в которой:

- entity и locale соответствуют;
- component_id присутствует в manifest;
- component_hash совпадает с hash текущего canonical component;
- hash_spec_version поддерживается;
- VerificationRecord не отозвана/corrected так, что проверка больше не действует.

Guide в целом может иметь mixed verification state:

- часть sections verified;
- часть sections stale/unverified;
- отдельные KeyFact требуют review.

Это позволяет reader-facing state вычислять на уровне section/KeyFact, а не
сбрасывать весь Guide из-за локальной правки.

## 40. Verified source baseline выводится из verification manifest

SourceDependency **не хранит mutable `last_verified_source_fragment_hash` как
источник истины**.

Последний verified source baseline выводится из последней действующей
VerificationRecord, в которой соответствующая dependency была использована.

Baseline включает:

- source_fragment_hash;
- normalization_profile_version;
- source_anchor_version_id;
- evidence reference.

Hash разных normalization profile versions напрямую не сравниваются.

При смене normalization profile baseline либо пересчитывается из сохранённого
snapshot по новой версии profile, либо создаётся новая verification.

## 41. Acknowledged source states

Чтобы dismissed harmless change не создавал один и тот же finding при каждом
следующем check, evidence/operations layer поддерживает append-only
acknowledgement.

Acknowledgement фиксирует:

- source_dependency_id;
- source_anchor_version_id;
- acknowledged_fragment_hash;
- normalization_profile_version;
- evidence reference;
- acknowledged_at;
- actor / deterministic reason.

Сравнение выполняется против множества допустимых ориентиров:

- verified baseline;
- acknowledged harmless state.

Любое новое fragment value, не совпадающее ни с одним действующим ориентиром,
создаёт новый MonitoringFinding.

Acknowledgement не означает verification canonical knowledge и не заменяет
VerificationRecord.

## 42. Monitoring freshness и verification разделены

Verification отвечает:

> "Какие canonical components были проверены и против какого evidence?"

Monitoring отвечает:

> "После проверки появились сигналы, что Source изменился или monitoring больше
> не способен доказать его актуальность?"

Guide/section/KeyFact может быть historically verified, но требовать review из-за
нового MonitoringFinding или fail-closed condition.

## 43. Reader-facing state

Public presentation не должна скрывать monitoring uncertainty.

Минимально для Guide/section/KeyFact должен быть вычислим один из состояний:

- **Проверено**;
- **Требует перепроверки**;
- **Не удалось подтвердить актуальность**.

Если evidence/freshness projection недоступна или старше допустимого TTL,
состояние **не может по умолчанию деградировать в "Проверено"**.

Для reader path отсутствие подтверждения freshness трактуется fail-closed.

Точный UI wording определяется frontend/product layer.

## 44. Независимая staleness-проверка

Staleness не должна зависеть от того же scheduler/pipeline, отказ которого она
должна обнаружить.

Условие:

`now - last_successful_check_at > max_allowed_staleness`

должно быть вычислимо независимо:

- отдельным watchdog;
- и/или read-time predicate;
- и/или независимой health projection.

Если основной scheduler умер, staleness всё равно должна проявиться в
operations и reader-facing state.

## 45. Evidence → website read path

Сайт не читает raw evidence tables напрямую.

Нужна KAFENE-owned read projection/health boundary, которая предоставляет
минимальный freshness/monitoring state для editorial components.

Эта projection должна:

- связывать SourceDependency с последним monitoring state;
- учитывать open MonitoringFinding;
- учитывать staleness predicate;
- иметь bounded freshness TTL;
- fail-closed при собственной недоступности или просрочке.

Если projection недоступна/просрочена, reader-facing состояние становится
"не удалось подтвердить актуальность", а не "Проверено".

Конкретная cache/storage technology не фиксируется.

## 46. Review SLA

Human-gated findings должны иметь review SLA, зависящий от risk class.

До production launch должна быть принята конкретная operations policy.

Initial architectural floor:

- high-risk finding не может оставаться без owner/queue;
- SLA breach сам становится operational alert;
- просроченный finding сохраняет/усиливает reader-facing stale state;
- queue health и median/max review latency измеряются.

Конкретные часы/дни остаются до spike.

## 47. Locale verification вместо отдельной locale-sync state machine

Отдельная locale-sync state machine не вводится.

VerificationRecord использует `verification_type`, например:

- `source_check`;
- `translation_check`.

Для translation check сохраняется:

- translated locale component manifest;
- hash базовой locale/components, против которых перевод был проверен;
- соответствующие source/evidence references при необходимости.

Если базовая locale/components изменились, translation verification автоматически
перестаёт быть актуальной по hash mismatch.

## 48. Generation lineage

Lineage generated content не должен зависеть исключительно от Payload revision ID.

Primary lineage key для generator:

- `generation_input_hash`.

Generation input строится из тех же canonical component primitives, которые
используются verification manifest.

Если generated artifact требует verified input, условие означает:

> каждый canonical component, входящий в generation input, присутствует в
> действующей VerificationRecord с совпадающим component_hash.

Таким образом "derived from verified" является вычислимым условием.

## 49. Generation hash contract

GenerationRecord должен хранить:

- `generation_input_hash`;
- `hash_spec_version`;
- перечень component_id/component_hash, входивших в generation;
- generator/pipeline identifier;
- generator version;
- model metadata при необходимости;
- generated_at;
- locale;
- artifact/field reference;
- optional VerificationRecord references.

`generation_input_hash` вычисляется по versioned canonical serialization spec.

Изменение RU не делает EN artifact stale, если его component inputs не изменились.

Payload revision/version ID может сохраняться как reference/debug metadata,
но не является главным ключом актуальности.

## 50. GenerationRecord вместо универсального DerivedContent

Универсальная сущность DerivedContent не вводится.

Разные outputs:

- summary;
- translation draft;
- SEO text;
- search embedding;
- homepage snippet;
- Ask answer;
- newsletter text

имеют разные lifecycle и места хранения.

Для любого хранимого generated artifact достаточно GenerationRecord /
generation metadata.

## 51. Generated output не является source of truth

Generated content всегда производен от canonical knowledge.

Generated artifact не становится независимым canonical factual source.

## 52. derived_from_verified не хранится как mutable flag

Булев flag `derived_from_verified` не нужен.

Состояние вычисляется из generation component manifest и действующих
VerificationRecord.

## 53. Политика генерации и переводов

Generation из unverified input может выполняться как draft/internal artifact.

Machine-generated translation сама по себе не получает verified status.

В P0 machine-generated translation автоматически **не публикуется**:
публикация перевода требует отдельного editorial action.


## 54. Стоимость pipeline как first-class operational metric

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

## 55. Cost firewall

Архитектурный порядок processing:

cheap deterministic check
→ valid source/anchor?
→ relevant-region change?
→ deterministic risk
→ cheap semantic classification if needed
→ expensive reasoning only for relevant cases
→ human only for required gates.

Нельзя использовать дорогой model pass для unchanged Source checks.

## 56. KAFENE-owned state

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

## 57. Replaceable infrastructure

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

## 58. Требуемая поправка к ADR-002

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

## 59. Что нужно заморозить до implementation

Следующие invariants считаются высокостоимостными для поздней миграции:

1. Разделение editorial и evidence/operations storage.
2. Source editorial entity не содержит runtime monitoring status/adapter config.
3. Immutable/content-addressed raw evidence.
4. Retention активных baselines/acknowledgements и evidence, на которое ссылаются
   VerificationRecord/Change.
5. VerificationRecord имеет component manifest и source dependency/evidence
   manifest.
6. Verification baseline выводится из append-only manifest, а не mutable поля.
7. Source anchors являются versioned/append-only identities.
8. Anchor contract имеет `anchor_spec_version`.
9. Normalization contract имеет `normalization_profile_version`.
10. Verification component hashes и generation input hashes разведены и имеют
    versioned canonical serialization.
11. Generation lineage строится из component inputs.
12. Publication, verification и monitoring freshness разделены.
13. Staleness является предикатом от часов и обнаруживается независимо от
    основного scheduler.
14. Категория `unanchored_main_content_change` существует всегда.
15. SourceDependency aspect обязателен; unclassified = high risk.
16. Change имеет observed_at, verified_at, effective_at, published_at.
17. Published Change immutable; corrections/withdrawals/supersession append-only.
18. KeyFact использует validity interval и общую `as_of` semantics.
19. Locality иерархична.
20. Jurisdiction, geographic applicability и audience различаются.
21. LLM не может понижать deterministic risk floor.
22. Monitoring fail-closed.
23. VerificationRecord технически append-only.
24. Source/Guide/GuideSection/SourceDependency с audit references используют
    tombstone/deactivation вместо hard delete.

## 60. Что НЕ нужно замораживать до empirical spike

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
- exact GuideSection storage shape после bounded Payload test;
- thresholds для unanchored main-content findings;
- transient failure debounce/retry parameters;
- конкретная sandbox implementation technology.

## 61. Falsifying monitoring spike

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

## 62. Обязательные synthetic/failure scenarios

Synthetic/replay suite должен включать как минимум:

- изменение суммы;
- изменение даты;
- изменение срока;
- добавление/удаление requirement;
- изменение eligibility wording;
- новое material requirement в main content вне любого существующего anchor;
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

## 63. Метрики spike

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
17. human-review quality через canary findings;
18. долю routine work, реально автоматизируемую без factual auto-publish.

## 63.1. Quality control human gate

Review quality измеряется не только скоростью.

В human review queue должны периодически подмешиваться canary findings:

- заранее известный material change;
- заранее известный noise/non-material case.

Reviewer не должен заранее знать, какой item является canary.

Метрики:

- material-canary detection rate;
- noise-canary rejection rate;
- systematic reviewer error patterns;
- review latency.

Reviewer UI должен показывать verified baseline и current evidence side-by-side,
а не только AI summary/рекомендацию.

## 64. Go / no-go criteria spike

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

## 65. Кандидаты источников для spike

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

## 66. Цель spike

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

## 67. Ограничение цели 90%+

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

## 68. Initial implementation principle

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

## 69. Итоговая минимальная модель

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
- MonitoringFinding + append-only triage events;
- monitoring/process metadata.

### Generated content

- хранится по месту назначения;
- сопровождается GenerationRecord / generation metadata;
- lineage основан на `generation_input_hash`.

Не вводятся сейчас:

- универсальный DerivedContent;
- глобальная Fact ontology;
- MonitoringFinding как editorial domain entity (он остаётся operational record);
- mutable `derived_from_verified` flag;
- mutable `verified` boolean как единственный источник истины.

## 70. Открытые вопросы после v4

До канонизации остаются вопросы, которые должен разрешить monitoring spike
или следующий schema-design pass:

1. Конкретный формат source anchor.
2. Конкретная GuideSection storage shape на Payload 3.90.2 + Postgres.
3. Конкретные canonical serialization rules для verification hash spec.
4. Конкретные canonical serialization rules для generation hash spec.
5. Initial KeyFact representation.
6. Evidence persistence topology.
7. Snapshot retention для non-referenced evidence.
8. Risk taxonomy после empirical data.
9. Concrete monitoring adapters для первого deployment.
10. Граница между cheap classifier и deeper reasoning model.
11. Конкретная human review SLA policy.
12. Порог, после которого отдельные typed facts могут получить auto-apply.
13. Конкретная implementation технологии evidence→website freshness projection.

## 71. Следующий шаг

До канонизации lifecycle:

1. внести узкое уточнение в ADR-002 о разделении editorial и evidence storage;
2. провести bounded Payload test выбранной GuideSection representation;
3. подготовить отдельный spike protocol с численными go/no-go thresholds;
4. выбрать 5–10 реальных Cyprus sources и 3 Guides;
5. провести live + historical replay + synthetic falsifying spike;
6. на основании измерений зафиксировать anchor и normalization contracts;
7. только затем канонизировать living-knowledge lifecycle.
