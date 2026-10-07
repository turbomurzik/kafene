# Local Invalidation schema-pass

Статус: **EXECUTABLE TEST — OWNER REVIEW REQUIRED; агент не присваивает EVIDENCE/CLOSED**

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

## Environment / upgrade sentinel

- Payload: **3.90.2** (точная версия из `spike/payload/package.json`);
- PostgreSQL image: **postgres:16-alpine**;
- characterization tests с префиксом `observed:` служат upgrade sentinel: изменение их поведения при обновлении Payload требует отдельного review.

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

3. **Locale draft isolation / publication safety**
   - localized RU draft change не должен уничтожаться, переписываться или публиковаться при publication EN;
   - EN publication при clean shared baseline не должна менять RU localized draft/published component hashes;
   - повторная publication без semantic changes ничего не меняет.

4. **Reorder locality**
   - reorder — нетождественная перестановка;
   - identity reorder ничего не меняет;
   - shared structure = ordered list всех live section IDs;
   - locale-visible structure = ordered list видимых ID конкретной локали;
   - visible structure меняется тогда и только тогда, когда перестановка изменила относительный порядок видимых ID этой локали;
   - перенос невидимого section через другие sections может менять shared structure текущей draft locale и не менять visible structure другой locale до publication;
   - expected visible order считается из известного baseline + применённой permutation, а не из after-projection;
   - section component hashes при reorder не меняются.

5. **Visibility fixture-v0**
   - section видим только если heading и body содержат meaningful text;
   - после NFC meaningful text = наличие символа вне Unicode categories Z, Cc, Cf;
   - vectors включают null, empty string, обычные пробелы, NBSP, U+200B, U+FEFF, soft hyphen и empty editor tree;
   - partial section (heading есть, body пуст) консервативно invisible;
   - это только fixture hypothesis, production policy остаётся OPEN.

6. **EN-only section / schema characterization boundary**
   - EN-only addition меняет shared structure;
   - EN visible structure меняется;
   - RU visible structure не меняется, если RU content семантически отсутствует;
   - existing EN/RU section hashes не меняются;
   - фактическая RU row representation читается через published RU, draft RU и locale=all;
   - после добавления RU content в тот же section RU draft-visible меняется, published-visible — только после RU publication;
   - после RU publication RU visible structure меняется, shared structure уже не меняется, EN visible structure не меняется;
   - зависимость locale-facing artifact от visible structure вместо shared — **условное наблюдение** для этого класса artifacts, не универсальный contract;
   - текущая schema требует localized `heading`/`body`; test-only U+200B может сделать row schema-valid, но fixture-v0 invisible;
   - U+200B — только техника characterization, **не production solution**.

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


## Observed Payload characterization

Это не desired workflow invariants, а экспериментально фиксируемое поведение Payload 3.90.2.
Все такие checks в harness имеют префикс `observed:`.

- shared/non-localized draft write через EN меняет EN draft projection, но не обязан сразу менять RU draft projection;
- shared draft write через RU зеркально может существовать только в RU draft projection до publication;
- publication конкретной locale может продвинуть shared state сразу в обе published locale projections;
- та же publication может синхронизировать shared draft state другой locale;
- pending shared change, внесённый через другую locale, может быть продвинут publication текущей locale;
- conflict probes EN=A / RU=B выполняются в обоих publication orders;
- committed clean run на `2c0ba785c2704692aeff1039878e2cede7e3bbfd` показал: после EN=A затем RU=B обе draft projections уже содержат B до publication; A не сохраняется как отдельный pending shared draft;
- первая publication (EN или RU) публикует B в обе locale projections; вторая publication ничего не меняет;
- для этого сценария наблюдаемая semantics = **last shared draft write wins before publication; publication order irrelevant**;
- unpublish semantics также относятся к Payload-specific characterization, а не к универсальному product contract.

## Observed structural edge case: reorder ignored after locale-specific invisibility publication

Committed clean run на `2c0ba785c2704692aeff1039878e2cede7e3bbfd` дал `diff = []` для EN reorder после того, как RU section был сделан fixture-v0 invisible и RU был опубликован.

Это не трактуется как успешный reorder. Harness теперь:
- доказывает, что target permutation нетождественна текущему EN order;
- ожидает exact no-op;
- проверяет, что фактический EN order остался прежним;
- логирует before/target/after IDs.

Пока это **observed Payload characterization / possible product risk**, а не desired invariant. Если повторный committed-tree run подтвердит поведение, нужен отдельный schema/workflow design review: почему structurally valid reorder игнорируется в этом version state.

## OPEN schema/product issue: ADR-002 vs required localized fields

Текущая test schema требует localized `heading` и `body`. Это означает, что реальный EN-only section без placeholder может упереться в validation другой locale. Такое поведение потенциально противоречит ADR-002 / принципу «translation parity не обязательна».

В этом pass schema **не меняется**. Для отдельного invisible-section characterization используется U+200B, потому что он schema-valid, но fixture-v0 считает его semantically empty. Этот placeholder hack нельзя переносить в production.

Отдельное schema-design решение должно определить conditional requiredness / validation по факту publication конкретной locale.

## Expectation changes from committed clean-run observation

Изменения ниже основаны только на фактическом clean-run output от commit `20a408b1cd857c183a2237ff028fc64e28f78c4c`; exact-diff discipline сохранена.

- `observed: EN shared draft write changes only EN draft projection`: удалено ожидание `draft:ru`; clean run показал изменение только EN draft.
- `observed: RU shared draft write changes only RU draft projection`: добавлен зеркальный characterization test.
- `observed: publish EN advances shared published state and synchronizes RU shared draft`: добавлен `draft:ru` в exact expected set; он присутствовал в фактическом diff.
- `observed: pending RU shared change is advanced by EN publish`: добавлен `draft:en` в exact expected set; он присутствовал в фактическом diff.
- `observed: pending EN shared change is advanced by RU publish`: добавлен `draft:ru` в exact expected set; он присутствовал в фактическом diff.
- EN draft reorder: удалены RU draft structure/visible expectations; clean run показал только EN draft structure + EN visible structure.
- invisible-section reorder: RU draft structure больше не считается изменённой до publication; exact expected set ограничен EN draft structure + EN visible structure.
- EN draft delete: RU draft structure/visible остаются неизменными до publication; exact expected set включает только EN draft structure, EN visible structure и удалённый EN section component.
- EN-only pre-publication: RU draft не должен считаться содержащим новую shared row до EN publication; post-publication representation характеризуется отдельно.
- non-identity reorder: RU visible expected order теперь остаётся baseline order, потому что EN draft permutation не применяется к неизменённому RU draft.

Ни один exact-diff check не заменён subset/contains-проверкой ради PASS.

## Editorial workflow requirement

Payload publication одной локали может протолкнуть pending shared changes,
включая structure/applicability, в published state обеих locale projections и синхронизировать shared draft state другой locale.

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

Evidence procedure:

1. изменения сначала коммитятся;
2. рабочее дерево должно быть clean;
3. оба clean runs выполняются на одном commit SHA;
4. в отчёте фиксируются SHA, Node/npm, exact Payload version, PostgreSQL image/version и raw stdout/stderr;
5. два прогона должны проверить structural scenarios в обоих deterministic orders;
6. при PASS markdown получает только статус **PASS ON COMMITTED TREE — OWNER REVIEW PENDING**;
7. только владелец после review может присвоить EVIDENCE / CLOSED / VERIFIED / APPROVED.
