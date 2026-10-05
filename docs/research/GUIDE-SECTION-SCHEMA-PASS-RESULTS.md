# GuideSection Schema Pass Results

Статус: **EVIDENCE**

Дата запуска: 2026-10-05

Связанные документы:

- `docs/architecture/ADR-002-CMS-CONTENT-STORAGE.md` — CANONICAL;
- `docs/architecture/LIVING-KNOWLEDGE-LIFECYCLE.md` — ACTIVE DRAFT;
- `spike/payload/GUIDE-SECTION-SCHEMA-PASS.md` — executable test description.

Исполняемый тест:

- `spike/payload/src/run-guide-section-schema-pass.ts`

## Цель

Сравнить два initial storage shape для GuideSection на уже закреплённом стеке
Payload + Postgres без построения production schema:

1. **Array shape** — Guide содержит non-localized array section rows со stable
   row identity и localized leaf fields.
2. **Separate collection shape** — GuideSection является отдельной Payload
   collection и связан с Guide relation.

Критерии:

- atomic publication Guide;
- stable section ID при save/reorder;
- locale independence;
- drafts/versioning;
- пригодность section identity для verification component-manifest hashing.

## Environment

Фактически использованный стек:

- Payload: `3.90.2`;
- `@payloadcms/db-postgres`: `3.90.2`;
- Postgres: `postgres:16-alpine`;
- adapter ID type: UUID;
- locales: EN/RU;
- global locale fallback: disabled;
- localized status: Payload 3.90.2 experimental mechanism;
- запуск: macOS + Docker.

Перед запуском test database была очищена через:

`docker compose down -v`

Это исключило schema-rename prompts от предыдущего Payload spike.

## Результат

Итог:

```text
10/10 checks passed.
```

### Array shape

1. **Stable section row IDs survive save and reorder — PASS**
2. **EN can publish while RU remains independent — PASS**
3. **Atomic Guide publication keeps sections in one document — PASS**
4. **Versions preserve section set and stable IDs — PASS**
5. **Component-manifest hashing can address section IDs independently — PASS**

### Separate collection shape

6. **Section IDs are intrinsically stable across reorder — PASS**
7. **Locale independence works per section document — PASS**
8. **Separate collection permits partial publication — PASS**
   - Payload позволил опубликовать одну GuideSection при соседней section,
     остающейся draft;
   - это подтверждает реальный atomicity risk для Guide как единой canonical
     editorial unit.
9. **Versions exist independently for Guide and sections — PASS**
10. **Component-manifest hashing can address section UUIDs independently — PASS**

## Что подтверждено

На pinned stack подтверждено:

- array row identity достаточно стабильна для использования как
  `component_id` GuideSection;
- reorder не меняет row identity;
- localized leaf fields работают при общей non-localized structure;
- EN/RU representations остаются независимыми;
- Guide и весь набор его sections могут публиковаться одной document-level
  publication operation;
- Payload versions сохраняют section set и stable row IDs;
- component hashes можно вычислять независимо для каждой section;
- отдельная GuideSection collection технически работоспособна, но её собственный
  publication lifecycle допускает partially published Guide.

## Initial architecture conclusion

Для initial KAFENE Guide schema выбирается:

> **non-localized array of Guide sections inside Guide, со stable non-localized
> row identity и localized leaf fields.**

Причина выбора не в том, что separate collection технически не работает.

Она работает, но создаёт дополнительную orchestration/transaction problem:
нужно отдельно гарантировать согласованную публикацию Guide и всех его child
sections.

Array shape на фактически протестированном stack сохраняет требуемые свойства
без введения такой дополнительной boundary.

## Что этот тест НЕ подтверждает

Этот schema-pass не проверяет:

- production Guide schema целиком;
- rich-text implementation будущих section body fields;
- canonical serialization spec целиком;
- verification invalidation hooks;
- SourceDependency implementation;
- KeyFact storage;
- public frontend/cache behavior;
- monitoring/evidence pipeline;
- performance на больших Guide;
- Payload upgrade behavior.

Результат относится только к bounded GuideSection storage decision на
Payload 3.90.2 + Postgres 16.

## Решение для следующего design pass

Initial GuideSection storage shape больше не является открытым архитектурным
вопросом.

Если позже появится требование, которое array shape не может удовлетворить,
separate collection может быть пересмотрена отдельным ADR/schema test, но для P0
она не нужна.
