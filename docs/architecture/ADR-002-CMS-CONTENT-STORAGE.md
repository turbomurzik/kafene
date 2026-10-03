# ADR-002: CMS, Content Storage и Structured Knowledge Model

Статус: **ACTIVE DRAFT**

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

До канонизации ADR-002 должен быть выполнен сквозной validation test UUID через
relationships, versions и localized fields на закреплённой версии Payload.

### Localization

По умолчанию editorial entity использует field-level localization и представляет
одну canonical entity с локализованными полями.

Допускаются явно помеченные locale-specific entities, если содержание
объективно относится только к одной языковой аудитории или практический ответ
реально различается.

Payload документирует field-level localization и отдельный locale-aware
publication status mechanism (`localizeStatus`) для draft-enabled content, но
этот механизм в текущей документации помечен как experimental/beta и не
считается автоматически принятым production-механизмом KAFENE.

До канонизации production schema должны быть отдельно определены:

- publication status по locale;
- fallback behavior при отсутствии конкретной locale representation;
- пригодность `localizeStatus` или другого поддерживаемого механизма именно в
  закреплённой версии Payload.

Этот ADR фиксирует требование к поведению, но не канонизирует конкретный
locale-publication механизм до pinned-version validation.

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
комментарием редактора. Модель должна позволять выражать Source, verification
state, last_verified, effective dates и source linkage, где применимо.

### Publication state и verification state

Publication и verification являются разными состояниями.
`updated_at` или дата публикации не должны автоматически означать
«актуально/проверено».

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

## Решение 6. Frontend independence

Выбор Payload не выбирает public frontend framework.

Payload Admin/HTTP runtime может потребовать Next.js runtime в текущей major
версии Payload, но это не означает, что public KAFENE frontend обязан быть
Next.js.

Если public frontend будет выбран на другом runtime/framework, допускается
размещение Payload как отдельного service.

Эта возможность архитектурно допустима, но не считается проверенной для
конкретного будущего KAFENE deployment stack до runtime/deployment validation.

## Решение 7. Payload upgrades

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

## Условия последующей канонизации

Перед переводом ADR-002 в CANONICAL должны быть закрыты как минимум:

1. сквозной validation test UUID через relationships, versions и localized
   fields на закреплённой версии Payload;
2. locale publication/fallback semantics;
3. подтверждение, что выбранная Payload major version поддерживает необходимые
   draft/version/localization/relationship capabilities для KAFENE;
4. pinned-version validation механизма locale publication;
5. отсутствие конфликта с будущим frontend/runtime ADR;
6. минимальная initial schema реализуема без обхода write boundary.

До явного принятия ADR-002 остаётся **ACTIVE DRAFT**.