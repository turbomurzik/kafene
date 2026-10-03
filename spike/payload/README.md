# Payload + Postgres spike

Статус: **исполняемый spike; результат ещё не является evidence до фактического запуска**.

Цель — проверить production gates из `ADR-002-CMS-CONTENT-STORAGE.md` на
закреплённой версии Payload, не строя CMS целиком.

## Закреплённый стек

- Payload: `3.90.2`
- `@payloadcms/db-postgres`: `3.90.2`
- Postgres: `16-alpine`
- Payload Postgres adapter: `idType: 'uuid'`
- locales: `en`, `ru`
- global fallback: disabled
- localized status: включён как beta/experimental mechanism Payload 3.90.2

## Что проверяет spike

1. UUID primary keys и UUID relationship target.
2. EN можно опубликовать при RU draft/missing.
3. RU read с `fallbackLocale: false` не подставляет EN как RU.
4. Неполная RU locale не должна публиковаться при required localized fields.
5. Publish/unpublish RU не должен менять publication state EN.
6. Version history создаётся в ходе locale lifecycle.
7. Отдельно воспроизводится known-risk pattern:
   `locale: 'all'` + `_status = published`.

Последний тест намеренно жёсткий. Если он падает, это не означает автоматический
отказ от Payload: ADR-002 уже определяет fallback plan через document-level
publication + KAFENE locale-readiness boundary.

## Что spike намеренно не проверяет

- Admin UI.
- public frontend.
- SEO redirects/404/noindex.
- search/Ask.
- localized blocks.

Localized blocks не включены специально: upstream issue #17508 остаётся отдельным
risk gate. Если initial content schema действительно потребует localized blocks,
для них нужен отдельный минимальный reproduction test до production use.

## Запуск

Нужны Docker, Node.js и npm.

```sh
cd spike/payload
cp .env.example .env
set -a
source .env
set +a
docker compose up -d
npm install
npm run spike
```

Для чистого повторного запуска:

```sh
docker compose down -v
docker compose up -d
npm run spike
```

Остановить:

```sh
docker compose down
```

## Критерий результата

- Если все проверки PASS — native Payload mechanism остаётся кандидатом для P0,
  после отдельного решения по verification invalidation и при необходимости
  localized-blocks gate.
- Если locale-specific publish/fallback/status checks FAIL — используем fallback
  plan из ADR-002, не ломая выбор Payload + Postgres.
- Если UUID/relations/versioning checks FAIL — ADR-002 нельзя канонизировать до
  объяснения и исправления причины.

После фактического запуска результат нужно записать отдельным evidence-документом
с pinned versions, environment и сырым PASS/FAIL выводом.
