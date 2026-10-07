# Canonical Serialization Schema Pass Results

Статус: **EVIDENCE**

Дата финального запуска: 2026-10-07

Связанные материалы:

- `docs/architecture/LIVING-KNOWLEDGE-LIFECYCLE.md` — ACTIVE DRAFT;
- `spike/payload/CANONICAL-SERIALIZATION-SCHEMA-PASS.md`;
- `spike/payload/src/canonical-serialization.ts`;
- `spike/payload/src/run-canonical-serialization-schema-pass.ts`;
- `spike/payload/golden/canonical-serialization-v1.1.json`;
- `spike/payload/reference/check-canonical-serialization.py`.

## Цель

Проверить deterministic serialization substrate и hash envelope, на которых
будут строиться VerificationRecord component hashes и GenerationRecord input
hashes.

Этот schema-pass **не определяет**:

- какие поля входят в конкретный verification/generation component;
- component field-selection / projection;
- semantic projection rich-text;
- domain-specific normalization date/decimal/relation/binary/set values.

Эти контракты остаются отдельными versioned layers.

## Зафиксированные версии

- serialization substrate: `kafene-canonical-json-v1.1`;
- hash envelope: `kafene-sha256-domain-v1`.

Фактически использованное окружение финального прогона:

- Node: `v22.14.0`;
- ICU: `76.1`;
- Python: `3.14.7`.

Отдельные Unicode runtime version strings в этом запуске не снимались.
При изменении Node/ICU/Python golden vectors должны повторно прогоняться до
production rollout.

## Итоговый контракт substrate

Разрешены:

- plain objects, включая object с null prototype;
- arrays;
- strings;
- booleans;
- null;
- safe integers.

Fail-closed отклоняются:

- non-integer numbers;
- unsafe integers;
- NaN / Infinity;
- Date;
- bigint;
- Map / Set;
- Buffer и другие non-plain objects;
- objects with `toJSON`;
- symbol keys;
- sparse arrays;
- undefined внутри array;
- cycles;
- ill-formed UTF-16;
- values выше depth/size limits.

Дополнительные правила:

- object field со значением `undefined` трактуется как absence;
- strings и keys нормализуются в NFC;
- CRLF/CR нормализуются в LF;
- NFC key collision отклоняется;
- object keys сортируются по UTF-16 code units без locale/ICU collation;
- array order semantic;
- UTF-8 без BOM;
- SHA-256 lowercase hex;
- verification и generation разведены hash-domain prefix;
- component type входит в hash envelope;
- component type alphabet запрещает separator/NUL ambiguity;
- default maximum depth: 64;
- default canonical byte size: 1 MiB.

Domain-specific значения должны быть нормализованы до serializer boundary.
В частности decimals/money/percentages должны приходить canonical strings.

## Golden vectors

Pinned file:

`spike/payload/golden/canonical-serialization-v1.1.json`

SHA-256 содержимого файла:

`c09b0bf4881e1b8f68596d8c346cb7530b3d15de47571a2d1e35fcd7a0904f9d`

Golden vectors покрывают как минимум:

- ordering + NFC;
- generation domain;
- integer-like/non-ASCII/astral key ordering;
- null и array order;
- control/escaping cases;
- prototype-like keys.

Основная TypeScript implementation сверяется с pinned expected canonical bytes
и expected SHA-256.

Независимая stdlib Python implementation повторно проверяет те же golden
vectors.

## История фактических прогонов

### Первый bounded pass

Результат: **9/9 PASS**.

Он подтвердил базовые свойства key ordering, NFC, null/absence, array semantics,
rich-text-as-structured-data и idempotence, но после review контракт был
усилен до v1.1.

### Hardened v1.1 до исправления object emission

Результат: **18/20 PASS**.

Два FAIL имели один корень: TypeScript implementation сортировала keys, затем
собирала обычный JS object и передавала его в `JSON.stringify`.
JavaScript property enumeration переупорядочивал integer-like keys.

Диагностический hex-diff подтвердил единственное расхождение:

- expected: `"10"` перед `"2"`;
- actual: `"2"` перед `"10"`.

Astral/BMP order отдельного дефекта не показал.

### После direct recursive JSON emission

Результат: **20/20 PASS**.

Contract, golden vectors и Python reference не менялись для исправления этого
implementation bug.

### Closure edge-case pass

После добавления integer-only rule, prototype-like keys, escaping и envelope
framing:

результат: **20/22 PASS**.

Два FAIL были вызваны malformed test fixture: `__proto__` при создании fixture
через JavaScript object literal был воспринят как special prototype syntax и
не попал в JSON input.

Serializer-level prototype test при этом проходил.

### После исправления fixture

Golden fixture был исправлен без изменения serializer contract.

Финальный результат:

```text
22/22 checks passed.
```

Все проверки, включая golden vectors и independent Python cross-check,
завершились PASS.

## Вывод

**Canonical serialization substrate считается PASS / CLOSED.**

Initial frozen substrate:

- `kafene-canonical-json-v1.1`;
- `kafene-sha256-domain-v1`.

Это закрытие относится только к deterministic serialization/hash substrate.

Остаются OPEN отдельные versioned contracts:

1. component field-selection / projection;
2. rich-text semantic projection.

В каждой будущей hash record должны храниться независимо как минимум:

- serialization spec version;
- hash envelope version;
- projection spec version.

Обновление runtime, которое может затронуть Unicode normalization или primitive
serialization behavior, требует повторного golden-vector run до rollout.
