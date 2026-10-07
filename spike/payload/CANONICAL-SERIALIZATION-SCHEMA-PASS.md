# Canonical serialization schema-pass

Статус: **EXECUTABLE TEST — результат не считать CLOSED до фактического запуска**

Цель — проверить deterministic serialization substrate и hash envelope для
verification/generation manifests.

## Versioned contracts

- serialization substrate: `kafene-canonical-json-v1.1`;
- hash envelope: `kafene-sha256-domain-v1`;
- component field-selection spec: отдельная версия, этим тестом не определяется;
- rich-text semantic projection: отдельная версия, этим тестом не определяется.

## Contract v1.1

Разрешены только:

- plain object;
- array;
- string;
- boolean;
- null;
- safe integer.

Fail-closed отклоняются:

- Date;
- bigint;
- Map / Set;
- Buffer / typed non-plain objects;
- objects with `toJSON`;
- symbol keys;
- sparse arrays;
- undefined внутри array;
- cycles;
- non-integer numbers;
- unsafe integers;
- NaN / Infinity;
- ill-formed UTF-16;
- depth/size above limits.

Дополнительно:

- object `undefined` field = absence;
- strings и keys → NFC;
- CRLF/CR → LF;
- key collision после NFC → reject;
- key order → UTF-16 code units, без locale/ICU dependency;
- array order semantic;
- UTF-8 bytes без BOM;
- SHA-256 lowercase hex;
- domain separation:
  `kafene:<verification|generation>:<component_type>\0<canonical-bytes>`;
- default max depth: 64;
- default serialized size: 1 MiB.

## Важная граница

Serializer не нормализует domain-specific values.

До serializer boundary component projection должна привести:

- Date → civil date `YYYY-MM-DD` или canonical UTC instant;
- decimal/money/percentage → canonical decimal string;
- relation → canonical ID;
- binary → content hash;
- unordered relation/tag/locality sets → deterministic sorted array.

Raw editor/Lexical JSON не считается semantic rich-text contract.
Отдельная versioned rich-text projection должна убрать несемантические editor
fields и нормализовать эквивалентные node shapes до serializer.

## Golden vectors

Pinned vectors:

- `golden/canonical-serialization-v1.1.json`

Они содержат:

- input;
- ожидаемые canonical UTF-8 JSON bytes;
- domain/component type;
- ожидаемый SHA-256.

Основной TypeScript test сверяет их побайтно.

Дополнительно независимая stdlib Python implementation:

- `reference/check-canonical-serialization.py`

повторно сверяет те же golden vectors.

## Запуск

Из `spike/payload`:

    git pull
    npm run canonical-serialization

Docker/Postgres не нужны.

Для evidence после запуска сохранить:

- полный PASS/FAIL output;
- Node version: `node --version`;
- ICU version: `node -p "process.versions.icu"`;
- Python version: `python3 --version`.

ICU фиксируется для audit, хотя key ordering v1.1 от ICU/locale уже не зависит.
