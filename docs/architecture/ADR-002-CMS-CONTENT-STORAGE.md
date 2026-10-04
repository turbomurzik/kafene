# ADR-002: CMS, Content Storage и Structured Knowledge Model

Статус: **CANONICAL**

Дата: 2026-10-04

Зависимости:

- `docs/architecture/ADR-001-FORUM-ENGINE.md` — CANONICAL;
- `docs/architecture/WEBSITE-DISCOURSE-INTEGRATION-CONTRACT.md` — CANONICAL;
- `docs/product/HOME-INTERACTION-MODEL.md` — CANONICAL.

## Контекст

KAFENE — knowledge-first, community-backed продукт.

После принятия ADR-001 роли систем разделены:

- Discourse владеет forum/community data;
- KAFENE website/content layer владеет editorial knowledge.

Для website нужны structured editorial entities, а не только страницы или posts.
Минимальный ожидаемый набор доменных сущностей включает Guide, Journey,
Collection/Hub, Change, Source, Locality и TopicSpace.

Контентная модель должна поддерживать локализацию, связи, публикацию,
версионирование, provenance, verification/freshness metadata и дальнейшее
использование теми же данными в search, Ask KAFENE и Changes workflow.

KAFENE не должен писать собственный CMS/admin с нуля без отдельной причины.

## Решение 1. CMS и content-storage stack

Для current product direction выбирается:

- **Payload** как CMS/application content layer;
- **Postgres** как persistence для structured editorial knowledge.

Payload выбран как code-first CMS, позволяющий хранить структуру content model
в TypeScript-коде и reviewable migrations, а не в production-only admin state.

## Решение 2. Разделение authority

### Payload TypeScript schema/config

Payload TypeScript schema/config является authoritative definition структуры
content model: collections, fields, relationships, localization settings,
validation, hooks и другие schema-level правила.

Структурные изменения должны проходить через Git, code review и migrations.

### Postgres

Postgres является authoritative persistence для content data.

Это не означает разрешение на произвольные direct SQL writes.

### Payload Admin

Payload Admin является editorial/admin tooling.

Admin UI не является отдельным source of truth и не должен создавать
невоспроизводимые schema changes вне code/migrations workflow.

## Решение 3. Write boundary

Запись и изменение editorial content выполняются только через поддерживаемую
Payload write boundary: Payload Local API или Payload HTTP/API layer.

Прямые SQL writes в Payload-generated/content tables запрещены.

Это требование сохраняет validation, hooks, revisions/versioning, lifecycle
semantics и schema invariants.

Search, Ask KAFENE, Changes automation и другие будущие consumers должны
работать через KAFENE-side server/content boundary, а не проектироваться вокруг
прямого доступа к внутренней структуре Payload tables.

## Решение 4. Storage isolation

Payload Postgres должен быть отделён от Discourse storage.

Допустимы отдельная database в том же Postgres instance или отдельный Postgres
instance. Недопустима shared application database, где website content layer
и Discourse разделяют одну schema/ownership boundary.

## Решение 5. Content-model invariants

### Structured entities

Guide, Journey, Collection, Change, Source, Locality и TopicSpace моделируются
как structured domain entities, а не как opaque page blobs.

Точный набор полей каждой сущности этим ADR не определяется.

### Stable IDs

Каждая canonical entity должна иметь stable identity, не зависящую от slug,
title, locale, publication state или revision.

Для canonical entities принимается семейство **UUID** с нативным Postgres
`uuid` type через поддерживаемую Payload adapter configuration.

В P0 используется один canonical ID на сущность без отдельного internal/public
ID слоя.

Инварианты ID:

- непрозрачный для пользователя;
- неизменяемый;
- не переиспользуется после удаления;
- не выводится из slug, title или locale;
- один canonical entity ID сохраняется при любом числе локалей и revisions.

Конкретная generation policy UUIDv4 или UUIDv7 остаётся implementation detail.

Предпочтение отдаётся UUIDv7 только если закреплённая стабильная версия Payload
поддерживает его нативно для выбранного Postgres adapter. Если нет — используется
UUIDv4. Кастомные generation hooks только ради UUIDv7 не вводятся.

Сквозной validation test на Payload 3.90.2 + Postgres 16 подтвердил UUID через
relationships, versions и localized fields. Фактический результат зафиксирован
в `docs/research/PAYLOAD-POSTGRES-SPIKE-RESULTS.md`.

### Localization

По умолчанию editorial entity использует field-level localization и представляет
одну canonical entity с локализованными полями.

Допускаются явно помеченные locale-specific entities, если содержание
объективно относится только к одной языковой аудитории или практический ответ
реально различается.

Locale scope и publication state являются разными измерениями:

- scope отвечает на вопрос, для каких локалей сущность вообще предназначена;
- publication state отвечает на вопрос, опубликовано ли конкретное locale
  representation.

Locale-specific entity не считается "непереведённой" для остальных локалей и
не должна автоматически показывать пользователю предложение перевода.

Для multi-locale entity publication state должен поддерживаться независимо по
локалям. Паритет переводов не требуется: EN может быть published при RU
draft/missing и наоборот.

Локаль считается publishable только если для неё заполнены и валидны все
обязательные localized fields. Частично заполненная локаль не должна
публиковаться как полноценное representation.

Публичный delivery layer обязан сохранять отсутствие локали как отсутствие:

- silent fallback localized editorial fields на default/другую locale запрещён;
- CMS fallback не должен превращать missing/unpublished locale в якобы
  опубликованный контент;
- допустимо явно предложить пользователю перейти к другой опубликованной
  локали, но не подставлять её body как requested locale;
- конкретные redirect/404/noindex semantics остаются frontend/SEO решением.

Payload документирует field-level localization и locale-aware publication status
для draft-enabled content. На закреплённом стеке Payload 3.90.2 + Postgres 16
необходимое P0-поведение прошло отдельный executable spike.

Конкретный Payload API/flag остаётся implementation detail конкретной pinned
версии. При обновлении Payload locale behavior должен перепроверяться.

Для P0 **localized blocks не используются**. Initial schema должна опираться на
обычные structured fields и relations. Если позднее появится реальная
необходимость локализовать целые block-layout structures, для них требуется
отдельный bounded correctness test перед production use.

### TopicSpace identity и readable key

Для `TopicSpace` фиксируется узкое дополнительное правило, необходимое для
cross-surface linkage из ADR-001:

- `TopicSpace.id` — canonical UUID entity ID;
- `TopicSpace.key` — отдельный человекочитаемый stable semantic key;
- `TopicSpace.key` уникален внутри deployment;
- `TopicSpace.key` неизменяем после создания;
- если key выбран неудачно, старый TopicSpace помечается устаревшим и создаётся
  новый TopicSpace вместо rename/migration key;
- `topic_space_id` означает UUID relation к TopicSpace;
- `topic_space_key` означает readable key;
- URL/presentation slug остаётся отдельной concern.

Это правило **не распространяется автоматически** на Guide, Change или другие
сущности. Нужны ли им собственные stable readable keys, остаётся открытым
schema-design вопросом.

### First-class relations

Связи между сущностями должны быть explicit first-class relations, а не
неформальными строками или договорёнными JSON blobs.

### Draft и published state

Editorial workflow должен поддерживать минимум draft и published.
Незавершённое изменение не должно требовать публикации.

### Revision history

Для editorial knowledge должна сохраняться revision history.

Version snapshots штатного versioning являются допустимым системным
дублированием. Недопустимы прикладные клоны canonical entity как замена
localization, draft state или revision/version history.

### Provenance

Provenance является частью доменной модели, а не свободным текстовым
комментарием редактора.

Общими для canonical entity могут оставаться, где применимо:

- Source links;
- effective dates;
- relations;
- external/native references.

Verification state и `last_verified` не должны автоматически быть общими между
локалями. Они относятся к конкретному locale representation либо к явно
определённой проверяемой единице, если будущая schema задаст иной эквивалентный
механизм.

Редактирование содержательного localized editorial content должно
инвалидировать verification для затронутой локали, если отдельно не доказано,
что изменение не влияет на проверенное содержание.

Это является обязательным implementation invariant KAFENE. Конкретный Payload
hook/механизм сброса verification определяется при реализации initial schema и
не требует отдельного pre-canonization spike, поскольку это KAFENE-owned
business rule, а не зависимость от специфической возможности Payload.

### Publication state и verification state

Publication и verification являются разными состояниями.

Материал может быть published, но не verified/current.

`updated_at`, дата публикации или публикация другой локали не должны
автоматически означать «актуально/проверено» для текущего locale representation.

Machine-generated translation сам по себе не получает published или verified
status. Публикация локализованного контента является отдельным editorial
действием.

### Portable deployment scope

Content model не должна hard-code Cyprus как доменную границу продукта.
Country/state/locality hierarchy, languages и market-specific configuration
должны оставаться deployment-aware и не ломать portable core.

### Discourse linkage

Discourse identifiers остаются external/native references.
`discourse_topic_id` или другие Discourse IDs не становятся canonical identity
KAFENE editorial entities.

### Search / Ask / Changes independence

Search, Ask KAFENE и Changes workflows должны иметь server-side доступ к
structured content без зависимости от Payload Admin UI.

### Schema changes through code/migrations

Изменения structure/content model должны быть воспроизводимы из repository
state. Production-only schema changes через UI, которые невозможно восстановить
из Git и migrations, недопустимы.

## Решение 6. Locale publication production gate

Для закреплённого P0 stack gate пройден на Payload 3.90.2 + Postgres 16.
Executable spike подтвердил:

1. EN published, RU draft/missing.
2. Публичное чтение RU возвращает отсутствие RU representation, а не EN fallback.
3. RU нельзя опубликовать при незаполненных обязательных RU localized fields.
4. Publish/unpublish RU не меняет publication state EN.
5. Version history сохраняет независимое состояние локалей.
6. known-risk multi-locale query pattern `locale: 'all'` + published status
   не воспроизвёл upstream failure на протестированном Postgres path.

Дальнейшие public access-control/query combinations проверяются обычными
implementation tests по мере появления content API и не являются отдельным
architecture blocker.

Native per-locale status принят для P0 на протестированном pinned stack.
При смене major/minor stack, затрагивающей localization/versioning semantics,
соответствующий gate повторяется.

### Fallback plan при провале gate

Если pinned-version validation не проходит, Payload не отвергается автоматически.

Для P0 допускается fallback:

- publication остаётся document-level в Payload;
- KAFENE content model хранит явное locale-readiness состояние;
- public delivery layer выдаёт locale только если она marked ready и проходит
  required-field validation;
- CMS `_status` не считается достаточным источником истины для locale
  availability;
- silent fallback по-прежнему запрещён;
- localized blocks не используются в initial schema.

Fallback не меняет доменное решение о независимой locale availability; он только
заменяет механизм реализации до появления production-safe native support.

## Решение 7. Frontend independence

Выбор Payload не выбирает public frontend framework.

Payload Admin/HTTP runtime может потребовать Next.js runtime в текущей major
версии Payload, но это не означает, что public KAFENE frontend обязан быть
Next.js.

Если public frontend будет выбран на другом runtime/framework, допускается
размещение Payload как отдельного service.

Эта возможность архитектурно допустима, но не считается проверенной для
конкретного будущего KAFENE deployment stack до runtime/deployment validation.

## Решение 8. Payload upgrades

Major upgrade Payload считается schema-affecting architectural event.

Перед major upgrade необходимо отдельно проверить migration behavior, generated
schema changes, versioning/revision compatibility, localization behavior,
relationships, database migrations и admin/runtime implications.

Major version Payload не обновляется автоматически только как dependency bump.

## Что этот ADR не решает

Этот документ намеренно не определяет:

- точные поля Guide/Journey/Collection/Change/Source/Locality/TopicSpace;
- exact collection/table names;
- UUID generation policy (v4 или нативный v7);
- slug format;
- exact revision retention;
- media storage provider;
- exact roles/permissions;
- полный editorial workflow;
- frontend framework/runtime;
- hosting topology;
- будет ли Payload sharing process с public frontend;
- search architecture;
- Ask KAFENE architecture;
- exact Changes automation;
- exact relation cardinality;
- plugins/extensions;
- deployment-specific content taxonomy.

## Рассмотренные альтернативы

### Directus + Postgres

Directus рассматривался как сильная DB-first/admin-first альтернатива.

Не выбран как основной вариант сейчас из-за совокупности факторов:

- текущая лицензия Directus v12 — source-available MSCL, а не permissive open
  source license;
- self-hosted deployment включает vendor license-validation dependency;
- часть возможностей зависит от commercial tier;
- часть editorial/schema semantics хранится в Directus-specific system metadata;
- admin/UI-first schema management хуже соответствует принятой KAFENE
  discipline «schema in code + Git review».

Конкретные тарифные лимиты в ADR намеренно не включаются: они могут меняться и
не являются архитектурным инвариантом.

Directus может быть пересмотрен, если существенно изменится licensing/deployment
model, требования KAFENE сместятся к admin-first/no-code schema management или
Payload перестанет соответствовать portability/content-model требованиям.

### Собственный CMS/admin

Не выбран: KAFENE не должен тратить P0 engineering effort на воспроизведение
admin forms, drafts, revisions, media management, relationships, permissions и
editorial UI, если это доступно в зрелом CMS.

### Git/Markdown/MDX

Не выбран как основной content store: structured relations, localization,
provenance, verification state, Changes и machine-readable consumers важнее
простоты file-based authoring.

### Sanity / Strapi / Ghost / WordPress

Не выбраны как primary candidates для текущего решения из-за худшего
соответствия сочетанию structured domain model, portable/self-hosted orientation,
code-reviewed schema и будущих machine-readable integrations.

## Риски и цена решения

Payload сознательно выбирается как code-first CMS.

Это означает:

- schema evolution требует engineering cycle;
- structural changes проходят CI/deploy/migrations;
- редактор не может безопасно менять domain schema production-only кликом;
- Payload Admin/HTTP layer имеет runtime coupling с Next.js в текущей major
  архитектуре;
- major Payload upgrades требуют отдельного schema/runtime review.

Эта цена считается приемлемой ради reproducible schema, typed relations,
Git-reviewable domain evolution, portability и отсутствия необходимости писать
собственный CMS/admin.

## Closure record

ADR-002 принят как CANONICAL на основании следующих закрытых архитектурных
вопросов:

1. Payload + Postgres выбран как CMS/content-storage stack.
2. UUID, relationships, versions и localized fields подтверждены executable
   spike на Payload 3.90.2 + Postgres 16.
3. Независимая EN/RU publication semantics и запрет silent fallback подтверждены
   тем же spike.
4. P0 не использует localized blocks, поэтому известный complex-localization risk
   не входит в initial schema.
5. Public access-control/query correctness остаётся обязательным implementation
   test, но не architecture blocker.
6. Выбор Payload не выбирает public frontend: конкретный frontend/runtime stack
   закрывается отдельным ADR.
7. Точные поля initial schema проектируются следующим implementation/design
   шагом внутри принятых здесь invariants и write boundary.

Evidence: `docs/research/PAYLOAD-POSTGRES-SPIKE-RESULTS.md`.

Изменения этих базовых решений требуют явного пересмотра ADR.