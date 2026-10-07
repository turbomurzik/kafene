# Local Invalidation schema-pass

Статус: **EXECUTABLE TEST — результат не считать EVIDENCE до фактического запуска**

Цель — проверить локальность invalidation поверх реальной Payload Guide array
shape и уже закрытого canonical serialization substrate.

## Граница

Используемая component projection — **fixture-v0 только для теста**.

Этот pass НЕ замораживает:

- production field-selection;
- component projection contract;
- partial-section policy;
- rich-text semantic projection;
- SourceDependency manifest coverage.

## Проверяемые invariants

1. **Locale isolation**
   - localized RU change не меняет EN localized component hashes;
   - sibling section не инвалидируется;
   - fallback locale выключен.

2. **Exact-diff discipline**
   - structural tests используют fresh Guide fixtures;
   - перед обычным structural action все shared components и locale-visible structure совпадают между draft/published baseline;
   - после действия сравниваются все component projections: EN/RU × draft/published;
   - множество реально изменившихся components должно в точности совпасть с ожидаемым;
   - characterization pending-shared tests намеренно не требуют clean baseline после внесения pending change.

3. **Shared publication semantics**
   - non-localized shared field имеет один published state на Guide;
   - draft-only shared change виден обеим draft locale projections, но не published;
   - publication EN может продвинуть pending shared change, внесённый через RU, и наоборот;
   - это **наблюдаемая Payload semantics, не желаемое workflow behavior**;
   - повторная publication без изменений ничего не меняет.

4. **Reorder**
   - reorder — нетождественная перестановка;
   - identity reorder ничего не меняет;
   - shared structure = ordered list всех live section IDs;
   - locale-visible structure = ordered list видимых ID конкретной локали;
   - visible structure меняется тогда и только тогда, когда перестановка изменила относительный порядок видимых ID этой локали;
   - перенос невидимого section через другие sections может менять shared structure и не менять visible structure;
   - expected visible order считается из известного baseline + применённой permutation, а не из after-projection;
   - section component hashes при reorder не меняются.

5. **Visibility fixture-v0**
   - section видим только если heading и body содержат meaningful text;
   - после NFC meaningful text = наличие символа вне Unicode categories Z, Cc, Cf;
   - vectors включают null, empty string, обычные пробелы, NBSP, U+200B, U+FEFF, soft hyphen и empty editor tree;
   - partial section (heading есть, body пуст) консервативно invisible;
   - это только fixture hypothesis, production policy остаётся OPEN.

6. **EN-only section**
   - EN-only addition меняет shared structure;
   - EN visible structure меняется;
   - RU visible structure не меняется, если RU content отсутствует;
   - existing EN/RU section hashes не меняются;
   - фактическая RU row representation читается через published RU, draft RU и locale=all;
   - после добавления RU content в тот же section RU draft-visible меняется, published-visible — только после RU publication;
   - после RU publication RU visible structure меняется, shared structure уже не меняется, EN visible structure не меняется;
   - зависимость locale-facing artifact от visible structure вместо shared — **условное наблюдение** для этого класса artifacts, не универсальный contract.

7. **Delete / tombstone / identity**
   - delete меняет shared structure;
   - locale-visible structure меняется только в локалях, где section был видим;
   - missing/tombstoned component invalid fail-closed;
   - удалённый section ID не переиспользуется новым section.

8. **Unpublish**
   - unpublish локали не откатывает shared published state;
   - locale published representation после unpublish считается absent/fail-closed, а не «пустой visible structure».

9. **Verification / manifests**
   - validity — вычисляемый predicate, не sticky flag;
   - change → revert снова делает artifact valid;
   - manifest хранит hashes реально прочитанных inputs;
   - concurrent later write делает artifact stale;
   - verified draft, опубликованный без semantic change, сохраняет hash;
   - edit after verification меняет hash после publication.

## Editorial workflow requirement

Payload publication одной локали может протолкнуть накопленные shared draft changes,
включая structure/applicability, в опубликованное состояние других локалей.

Поэтому Lifecycle должен требовать от production editorial workflow перед publication:

- обнаруживать pending shared changes;
- показывать редактору затрагиваемые опубликованные locales.

Это **workflow requirement**, а не результат Local Invalidation pass.
Конкретный UX, blocking policy и approval mechanics здесь не выбираются.

## Не входит

- добавление новой SourceDependency после verification;
- coverage каждого user-readable field;
- production field-selection;
- production partial-section policy;
- production rich-text semantic projection;
- evidence storage;
- monitoring;
- LLM;
- production invalidation queue.

## Запуск

Из `spike/payload`:

    set -a
    source .env
    set +a
    docker compose up -d
    npm run local-invalidation

Для чистого прогона:

    docker compose down -v
    docker compose up -d
    npm run local-invalidation

Harness сам повторяет structural probe в двух порядках на fresh fixtures.
Результат становится EVIDENCE только после фактического PASS/FAIL output.
