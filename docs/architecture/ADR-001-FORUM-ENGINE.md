# ADR-001: Community Substrate и граница Website ↔ Discourse

Статус: **CANONICAL**

Дата исходного ADR: 2026-09-26  
Переписан после завершения Discourse feasibility spike и принятия DEC-002/003/004/009.

## Контекст

Исходная версия ADR-001 предлагала использовать один self-hosted Discourse как
одновременно форум, guide CMS, knowledge system of record и основу Ask KAFENE.

Эта версия никогда не была принята. После live spike и последующих продуктовых
решений эта архитектура больше не соответствует принятому направлению KAFENE.

Текущая принятая продуктовая модель:

- KAFENE — knowledge-first, community-backed продукт;
- KAFENE website/knowledge layer и Discourse forum — отдельные, связанные
  поверхности одного продукта;
- guides, journeys, collections/hubs, verified Changes и другая editorial
  knowledge живут на KAFENE website;
- questions, discussions, replies, moderation и community experience живут в
  Discourse;
- native Discourse Ask AI не является production Ask KAFENE layer;
- homepage и knowledge website должны оставаться полезными при недоступности
  Discourse.

Этот ADR определяет только границу между website и Discourse. Он не выбирает
frontend framework, CMS, search engine, hosting, cache, IdP vendor, Ask KAFENE
architecture или News/Changes automation.

## Решение 1. Разделение систем ответственности

KAFENE website и Discourse рассматриваются как две bounded systems внутри одного
продукта.

### Discourse является system of record для community/forum data

К Discourse относятся:

- forum topics;
- replies;
- community profiles;
- moderation state;
- forum permissions;
- solved/Q&A state;
- community-native notifications;
- forum-native search/retrieval state.

### KAFENE website/content layer является system of record для editorial knowledge

К website/content layer относятся:

- guides;
- journeys;
- collections/hubs;
- verified Changes;
- News, если этот слой будет отдельно активирован;
- editorial localization;
- editorial freshness/verification metadata;
- website-native navigation и editorial presentation.

Один и тот же content object не должен одновременно поддерживаться как
authoritative object в обеих системах.

Связь между editorial knowledge и discussion не превращает guide в forum topic
и не превращает discussion в canonical guide.

## Решение 2. Integration boundary

KAFENE website должен обращаться с Discourse как с отдельным внешним bounded
service.

Для production integration:

- website не должен зависеть от прямого чтения или записи Discourse PostgreSQL;
- shared database между website и Discourse не является допустимой границей;
- Discourse core не должен патчиться ради KAFENE integration;
- production integration должна быть описана отдельным ADR или integration
  contract;
- конкретные API, webhook, cache, synchronization и authentication механизмы
  этим ADR не выбираются.

P0 не должен зависеть от unsupported direct database coupling.

Любой P0 frontend-компонент, который показывает live Discourse data
(например, reply count, latest activity, live topic metadata или forum feed),
может быть сверстан и протестирован на mock/static fixture, но не должен
подключаться к production Discourse data до принятия отдельного
website↔Discourse integration contract из этого решения.

Обычная ссылка на заранее известный forum URL не считается live data
integration, если для её построения не требуется runtime lookup в Discourse.

## Решение 3. topic_space_id

`topic_space_id` используется как KAFENE-owned semantic linkage key в уже
принятом scope HOME INTERACTION MODEL и для связанных cross-surface отношений.

Он:

- не заменяет native entity IDs;
- не является Discourse topic ID;
- не является website entity ID;
- может связывать несколько сущностей, относящихся к одному practical topic
  space, например guide, collection, Change и один или несколько forum topics.

Пример:

```text
topic_space_id = tax-2026

KAFENE guide         guide_184
KAFENE collection    collection_27
KAFENE change        change_91
Discourse EN topic   topic 642
Discourse RU topic   topic 811
```

Native IDs остаются authoritative внутри своих систем.

Более широкая persistence/modeling схема `topic_space_id`, включая место
хранения canonical mapping и способ его отражения в Discourse, остаётся
отдельным domain/integration решением. Этот ADR не объявляет
`topic_space_id` глобальным identity key всей платформы.

## Решение 4. Search boundary

Этот ADR не выбирает техническую search architecture.

Для first useful release действуют только следующие требования:

- website knowledge search должен работать независимо от availability Discourse;
- результаты должны сохранять content type, provenance и native destination;
- community results могут быть интегрированы через production
  website↔Discourse boundary;
- недоступность Discourse не должна делать website search неработоспособным;
- search не должен маскироваться под custom Ask KAFENE.

Будет ли later search federated, indexed, cached или реализован отдельным search
layer — открытое архитектурное решение.

## Решение 5. Identity и authentication

Для пользователя KAFENE должен восприниматься как единый продукт. При появлении
website-native accounts конечная модель должна обеспечивать единый login
experience для website и Discourse, а не два независимых пользовательских
логина.

### P0

В P0:

- website остаётся публичным и не требует собственного account/login system;
- Discourse обслуживает community registration и authentication, необходимые
  для участия в forum;
- авторизация в Discourse остаётся forum authentication и не используется как
  скрытая website identity;
- website не должен использовать Discourse session/cookie как собственный
  механизм входа.

### Жёсткие ограничения

Discourse не становится permanent global identity system of record KAFENE.

Ни один из следующих Discourse-native атрибутов не должен использоваться как
постоянный межсистемный KAFENE user identifier:

- numeric Discourse `id`;
- `username`;
- email.

Если до появления общей identity website или integration layer хранит ссылку на
конкретного пользователя Discourse, она должна быть явно маркирована как
external/native reference, например `discourse_native_id`, а не `user_id`.

Discourse `username` не должен использоваться как постоянный KAFENE-wide
handle.

До появления общей identity user-level website analytics не должны использовать
Discourse ID как внутренний KAFENE user identifier.

Website-native product notifications, Premium state, marketplace state, leads и
другие будущие account-domain данные не должны быть привязаны к Discourse email
delivery или forum account model.

### Триггер отдельного Auth/Identity ADR

До начала реализации первой website-native функции, требующей постоянного
пользовательского account state, необходимо принять отдельный Auth/Identity ADR.

К таким триггерам относятся, в частности:

- Premium;
- saved/favourite content;
- marketplace;
- business accounts;
- lead history;
- website-native user notifications;
- другие persistent account capabilities вне forum context.

Будущий Auth/Identity ADR должен определить:

- общий identity provider / identity ownership;
- единый login/SSO experience для website и Discourse;
- протокол и конкретный integration mechanism;
- миграцию и linking существующих Discourse accounts;
- session model;
- user-data ownership;
- GDPR/retention/security requirements.

После появления общей KAFENE identity пользователь не должен проходить второй
ручной login при переходе между website и Discourse.

Механизм связывания существующих Discourse accounts с будущей KAFENE identity
намеренно не решается этим ADR. Runtime email matching не считается
достаточным migration contract.

### Migration readiness P0

Новая user schema на website в P0 не требуется.

Операционно должна сохраняться возможность полного экспорта Discourse accounts,
как минимум с доступными native полями:

- Discourse `id`;
- username;
- email;
- created_at;
- account status, включая доступные признаки active / suspended / banned /
  deleted state.

Это необходимо для будущей контролируемой миграции/linking, но не делает эти
поля глобальной KAFENE identity.

## Решение 6. Failure boundary

Недоступность Discourse не должна приводить к page-wide failure KAFENE website.

При outage Discourse должны продолжать работать, если их собственные зависимости
доступны:

- homepage editorial/search surface;
- guides;
- `/guides`;
- journeys;
- collections/hubs;
- verified Changes;
- website knowledge search.

Community-dependent blocks должны деградировать согласно canonical
HOME INTERACTION MODEL: скрываться, использовать допустимый fallback или явно
показывать отсутствие community data без разрушения всей страницы.

## Что этот ADR не решает

Этот ADR намеренно не выбирает:

- frontend framework/runtime;
- CMS/content storage;
- website database;
- hosting/deployment platform;
- search engine;
- cache technology;
- exact API/webhook/sync design;
- конкретный auth protocol;
- identity provider/vendor;
- Ask KAFENE architecture;
- News ingestion;
- Changes monitoring/diff pipeline;
- vector database;
- business/lead architecture;
- marketplace implementation;
- billing;
- production IA mapping.

Эти решения должны приниматься отдельно, только когда соответствующий scope
становится текущим.

## Последствия

Положительные:

- community и editorial knowledge могут развиваться независимо;
- Discourse остаётся сильным готовым community substrate без превращения в
  CMS всего продукта;
- website не становится технически зависимым от внутренней БД Discourse;
- forum outage не обрушает основную knowledge surface;
- будущая единая identity может быть введена без признания Discourse account
  model глобальной моделью пользователя;
- native IDs сохраняют локальный смысл и не смешиваются с semantic linkage.

Цена:

- потребуется отдельный production website↔Discourse integration contract;
- потребуется явная cross-system mapping discipline;
- позже понадобится отдельный Auth/Identity ADR до появления website-native
  account features;
- search federation и broader `topic_space_id` persistence остаются отдельной
  архитектурной работой.

## Открытые вопросы после этого ADR

- где хранится canonical cross-surface mapping;
- как именно `topic_space_id` хранится и синхронизируется;
- production website↔Discourse API/webhook/cache contract;
- search architecture;
- frontend/runtime;
- CMS/content storage;
- будущий Auth/Identity architecture;
- production IA mapping.

## Статус принятия

Этот ADR принят как **CANONICAL**.

Канонический статус зафиксирован через DEC-010 и отражён в
`docs/STATUS.md` и `docs/00-DOCS-INVENTORY.md`.

Исходная версия ADR-001 была только PROPOSED и никогда не была принята, поэтому
она была переписана на месте, а не supersede отдельным ADR-002.
