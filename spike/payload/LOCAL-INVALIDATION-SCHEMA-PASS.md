# Local Invalidation schema-pass

Статус: **EXECUTABLE TEST — результат не считать EVIDENCE до фактического запуска**

Цель — проверить локальность invalidation поверх реальной Payload Guide array
shape и уже закрытого canonical serialization substrate.

## Важная граница

Используемая component projection — **fixture-v0 только для теста**.

Этот schema-pass НЕ замораживает:

- production field-selection;
- component projection contract;
- rich-text semantic projection;
- SourceDependency manifest coverage.

## Проверяемые invariants

1. Locale isolation:
   - RU change не меняет EN component hashes;
   - sibling section не инвалидируется;
   - fallback locale выключен.

2. Under-invalidation protection:
   - shared non-localized component меняет состояние EN и RU consumers;
   - каждый artifact, manifest которого содержит изменённый component, становится invalid;
   - missing/tombstoned component fail-closed.

3. Payload noise:
   - save без semantic change не меняет component hashes.

4. Draft/published:
   - draft и published читаются отдельно;
   - published-facing artifact не инвалидируется draft-only change;
   - EN publication не меняет RU published hashes;
   - verified draft, опубликованный без изменения, сохраняет hash;
   - edit after verification меняет published hash после publish.

5. Structure:
   - ordered live section IDs — отдельный shared structural component;
   - reorder меняет structural hash, но не section hashes;
   - add/remove влияет на artifacts, объявившие structural dependency;
   - section-only artifact не инвалидируется из-за нового sibling.

6. Predicate semantics:
   - validity вычисляется из текущих component hashes, а не хранится как sticky flag;
   - change → revert делает artifact valid снова;
   - manifest содержит hashes реально прочитанных inputs;
   - concurrent later write делает artifact stale.

7. Identity:
   - component identity = entity + component_type + component_id + locale|null;
   - удалённый section ID не переиспользуется молча новым section.

## Не входит

- добавление новой SourceDependency после verification;
- coverage каждого user-readable field;
- evidence storage;
- monitoring;
- LLM;
- production invalidation queue.

Эти вопросы остаются в соответствующих последующих passes.

## Запуск

Из `spike/payload`:

    set -a
    source .env
    set +a
    docker compose up -d
    npm run local-invalidation

Для максимально чистого прогона допустимо предварительно:

    docker compose down -v
    docker compose up -d

Результат становится EVIDENCE только после фактического PASS/FAIL output.
