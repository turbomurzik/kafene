# Publish context diagnostic

Статус: **EXECUTABLE DIAGNOSTIC — RESULT UNKNOWN UNTIL RUN**

Цель — закрыть единственную оставшуюся implementation uncertainty перед production publish-time completeness hook:

как Payload 3.90.2 передаёт locale context в collection `beforeChange` при locale-specific publication.

## Cases

### A — locale=en, publishSpecificLocale=ru

Характеризует intentionally mismatched Local API call.

Capture:
- `req.locale`;
- `req.publishSpecificLocale`;
- incoming `_status`;
- operation;
- final EN/RU statuses.

### B — locale=ru, publishSpecificLocale=ru

Canonical expected locale-specific publication path.

### C — locale=en, no publishSpecificLocale

Characterizes ordinary locale publication.

### D — locale=all with object status

Characterizes whether an object-valued localized status reaches the hook and how Payload treats it.

## Decision use

После прогона:

- если `req.locale` и `publishSpecificLocale` доступны и canonical path B совпадает, production hook может explicitly reject mismatch in v1;
- если `publishSpecificLocale` не виден в hook, нельзя принимать invariant о его сравнении с `req.locale` без другой signal source;
- если `locale=all` object-status path достигает hook, v1 должен либо явно поддержать его, либо fail closed;
- никаких production changes до review результата.

## Run

Из `spike/payload`:

    git pull
    git rev-parse HEAD
    docker compose down -v
    docker compose up -d
    npm run publish-context-diagnostic

Нужен полный output от `CASE A` до `CASE D`, включая все `PUBLISH-CONTEXT` строки.
