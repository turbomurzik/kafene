# Payload + Postgres Spike Results

Статус: **EVIDENCE**

Дата запуска: 2026-10-04

Связанный ADR:

- `docs/architecture/ADR-002-CMS-CONTENT-STORAGE.md`

Исполняемый spike:

- `spike/payload/`

## Цель

Проверить ключевые production gates ADR-002 на реальном pinned stack Payload +
Postgres до канонизации CMS/content-storage решения.

Этот документ фиксирует только фактически выполненный запуск и его границы.
Он не заменяет ADR и не расширяет его решения.

## Environment

Фактически использованный стек:

- Payload: `3.90.2`
- `@payloadcms/db-postgres`: `3.90.2`
- Postgres image: `postgres:16-alpine`
- Payload Postgres adapter: `idType: 'uuid'`
- locales: `en`, `ru`
- default locale: `en`
- automatic locale fallback: disabled
- Payload localized status: enabled through the Payload 3.90.2 beta/experimental
  mechanism

Локальный запуск выполнен на macOS через Docker.

## Результат

Итог:

```text
6/6 checks passed.
```

Фактические проверки:

1. **UUID primary keys and UUID relationship target — PASS**
   - Source ID создан как UUID.
   - Guide ID создан как UUID.
   - relationship Guide → Source сохраняет UUID target корректно.

2. **EN can publish while RU remains draft/missing — PASS**
   - EN representation опубликовано.
   - RU representation остаётся draft/missing.
   - EN content доступен независимо от состояния RU.

3. **Incomplete RU draft saves, but RU locale cannot be published — PASS**
   - неполный RU draft разрешено сохранить;
   - публикация RU с отсутствующим обязательным localized field блокируется
     validation.

4. **RU publish/unpublish does not change EN publication state — PASS**
   - RU можно опубликовать независимо;
   - RU можно снять с публикации независимо;
   - EN publication state при этом остаётся published.

5. **Version history is present after locale lifecycle — PASS**
   - versions создаются в ходе draft/publish/unpublish lifecycle;
   - spike подтвердил наличие ожидаемой version history.

6. **Known-risk probe: `locale: 'all'` + published status query — PASS**
   - на этом Postgres-сценарии published EN Guide не исчез из результата при
     `locale: 'all'` + `_status = published`;
   - известный upstream bug-класс, описанный для другого adapter scenario, в
     этом конкретном тесте не воспроизвёлся.

## Что подтверждено

На pinned stack этого запуска подтверждено, что:

- UUID family работает как native Postgres/Payload identity path;
- first-class relationship работает с UUID;
- field-level localization работает для EN/RU сценария spike;
- независимый per-locale publication lifecycle работает в протестированном
  сценарии;
- silent fallback можно предотвратить через `fallbackLocale: false`;
- required localized fields могут блокировать publish, не запрещая incomplete
  draft;
- version history присутствует;
- tested Postgres query path не воспроизвёл известный `locale: 'all'` +
  `_status` failure.

## Что НЕ подтверждено

Этот запуск не проверяет и не должен интерпретироваться как подтверждение:

- automatic invalidation locale verification metadata после редактирования
  localized content;
- production access-control rules для всех будущих public query patterns;
- Admin UI behavior;
- public frontend behavior;
- redirects / 404 / noindex semantics;
- search / Ask KAFENE;
- scheduled publishing;
- localized blocks;
- другие complex localized structures;
- upgrades между Payload major versions;
- production performance/load behavior.

## Localized blocks

Localized blocks намеренно не включались в этот spike.

Причина: для Payload 3.x существует отдельный upstream risk class вокруг
localized blocks + drafts/Postgres. Если initial KAFENE schema потребует
localized blocks, перед production use нужен отдельный bounded reproduction
test именно для этого сценария.

## Вывод

Результат **не выявил blocker** для продолжения с Payload + Postgres и native
per-locale publication как P0 candidate.

Это не означает, что ADR-002 уже автоматически CANONICAL.

До канонизации остаются требования самого ADR, включая:

- решение/validation вокруг locale-aware verification invalidation;
- отдельный gate для localized blocks или отказ от них в initial schema;
- остальные explicitly listed canonization conditions.

Если любой следующий pinned-version gate провалится, применяется fallback plan,
описанный в ADR-002, без автоматического отказа от Payload + Postgres.
