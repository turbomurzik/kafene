# Publish context diagnostic

Статус: **RESULT RECORDED — OWNER REVIEW PENDING**

Цель — закрыть оставшуюся implementation uncertainty перед production publish-time completeness hook:

как Payload 3.90.2 передаёт locale context в collection `beforeChange` при locale-specific publication.

## Tested commit

`3482dfefbe7641c2efabbd1347fa53e49afd9961`

Диагностический runner был прогнан дважды на чистой БД с `docker compose down -v` / `up -d`. Оба прогона дали одинаковый результат.

## Observed cases

### A — locale=en, publishSpecificLocale=ru

Внешний Local API вызов намеренно передавал несовпадающие:

- `locale: "en"`;
- `publishSpecificLocale: "ru"`.

Внутри collection `beforeChange` наблюдалось:

- `req.locale === "ru"`;
- `req.publishSpecificLocale == null`;
- incoming `_status === "published"`;
- operation `update`.

Published views после операции:

- EN: `draft`;
- RU: `published`.

### B — locale=ru, publishSpecificLocale=ru

Внутри hook наблюдалось то же canonical effective context:

- `req.locale === "ru"`;
- `req.publishSpecificLocale == null`;
- incoming `_status === "published"`.

Published views:

- EN: `draft`;
- RU: `published`.

### C — locale=en, no publishSpecificLocale

Внутри hook:

- `req.locale === "en"`;
- `req.publishSpecificLocale == null`;
- incoming `_status === "published"`.

Published views:

- EN: `published`;
- RU: `draft`.

### D — locale=all with object status

Внутри hook Payload передал:

- `req.locale === "all"`;
- `req.publishSpecificLocale == null`;
- incoming `_status === { en: "published", ru: "draft" }`;
- original `_status === { en: "draft", ru: "draft" }`.

Диагностический вызов завершился без ошибки, но published views обеих локалей остались `draft`.

## Implementation conclusion

Для locale-specific Local API publication Payload 3.90.2 нормализует `publishSpecificLocale` до входа в collection `beforeChange`:

- effective publication target внутри hook доступен как `req.locale`;
- отдельный `req.publishSpecificLocale` в hook отсутствует;
- поэтому production hook не должен пытаться сравнивать `req.locale` с `publishSpecificLocale` как независимые сигналы.

Для v1:

- `req.locale === "en"` или `"ru"` может использоваться как effective locale publication context;
- `req.locale === "all"` с object-valued `_status` должен обрабатываться явно;
- пока multi-locale object-status publication не является продуктовым контрактом, безопасная v1 политика — fail closed для publish-validation path с `locale=all`, а не угадывать target locale.

## Scope

Этот diagnostic характеризует только hook context и persisted publication status для протестированных Local API путей.

Он не закрывает отдельно:

- restoreVersion;
- schedulePublish;
- bulk operations;
- Admin-specific mutation paths, если они используют иной Payload execution path.

Эти пути остаются follow-up coverage, а не основанием менять установленную locale-specific hook семантику.
