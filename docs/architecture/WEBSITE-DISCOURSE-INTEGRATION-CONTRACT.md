# KAFENE Website ↔ Discourse Integration Contract

Статус: **ACTIVE DRAFT**

Дата: 2026-10-03

## Назначение

Этот документ фиксирует минимальный production contract для P0-интеграции между
KAFENE website и Discourse поверх принятого ADR-001.

Scope намеренно узкий: только чтение публичных community metadata, необходимых
для website community widgets и cross-surface links.

Документ не выбирает auth/SSO/IdP, CMS, frontend framework, search engine,
Ask KAFENE, News/Changes automation или будущую event-driven integration.

## 1. Направление интеграции

В P0 интеграция работает только в направлении:

```text
Discourse -> KAFENE website
```

Разрешён только read-only pull.

Website не выполняет запись в Discourse в рамках этого контракта.

## 2. Граница вызова

Browser/frontend не обращается напрямую к Discourse.

Получение community metadata выполняется server-side через KAFENE-side
integration boundary.

Frontend работает против стабильного KAFENE-side интерфейса/fixture и не должен
зависеть от конкретной формы Discourse endpoint.

Точный endpoint path остаётся implementation detail.

## 3. Уровень доступа

P0 integration fetch должен иметь не больше прав, чем анонимный публичный
посетитель Discourse.

Для получения данных community widgets нельзя использовать privileged API key,
staff credentials или иной доступ, позволяющий видеть private, staff-only или
restricted content.

Это ограничение является production-safety boundary: ошибочный mapping на
непубличный topic не должен приводить к утечке его metadata на публичный
KAFENE website.

## 4. Mapping

`topic_space_id` остаётся KAFENE-owned semantic linkage key.

В P0 curated mapping между KAFENE topic space и Discourse topic хранится в
KAFENE content metadata.

Минимальная связь:

```text
topic_space_id -> discourse_topic_id
```

Отдельный mapping service в P0 не создаётся.

`discourse_topic_id` является external/native reference и не становится
глобальным KAFENE entity ID.

Более широкая canonical cross-surface mapping model остаётся отдельным
архитектурным вопросом.

## 5. Разрешённые поля

Integration должна читать только зафиксированный минимальный набор community
metadata.

### Linkage

- `discourse_topic_id`.

### Display

- title;
- native URL;
- language;
- reply count;
- latest activity timestamp;
- solved/Q&A state, где применимо;
- category/subcategory label.

Category/subcategory label в P0 отображается as-is из Discourse. KAFENE-side
taxonomy normalization, rename или remapping для этого поля не выполняются.

Изменение названия категории в Discourse поэтому может напрямую изменить
подпись на website; это осознанная P0 coupling.

## 6. Поля вне P0 scope

P0 integration не должна читать или выводить в website community widgets:

- excerpt;
- author;
- avatar;
- user profile data;
- arbitrary post body;
- private/staff/restricted metadata;
- любые другие поля, не перечисленные в разделе 5.

Расширение allowlist требует отдельного решения.

## 7. Fetch model

P0 использует pull model.

Webhook/event-driven integration не требуется и откладывается.

Будущая webhook-based integration архитектурно не запрещена, но её появление
требует отдельного решения и не должно быть скрытой зависимостью P0.

## 8. Cache и freshness

Короткоживущий cache допустим и ожидаем как защита latency и Discourse от
лишней нагрузки.

Cache:

- не становится source of truth;
- не является отдельным persisted read model;
- не должен использоваться как last-known store на длительный outage.

Точная cache technology и рабочий TTL являются implementation details.

Однако без staleness UI community data не считаются valid старше **15 минут**.
Это жёсткий P0 freshness ceiling.

После превышения 15 минут cached community data должны рассматриваться как
недоступные и не показываться.

## 9. Failure policy

P0 использует **hide-on-outage**.

Если Discourse недоступен, timeout/error получен и valid cache отсутствует,
community-dependent surface скрывается или деградирует согласно canonical
HOME INTERACTION MODEL.

Остальной KAFENE website продолжает работать.

Persisted last-known community store в P0 не создаётся.

Отдельный staleness UI для forum metadata в P0 не нужен, поскольку данные старше
freshness ceiling вообще не показываются.

## 10. Resource-level degradation

Failure policy применяется не только к service-level outage.

Если конкретный mapped topic:

- удалён;
- не найден;
- перемещён так, что текущая ссылка/mapping больше невалидна;
- недоступен анонимному посетителю;
- возвращает непригодный или неполный response;
- имеет сломанный mapping;

то соответствующая карточка/элемент скрывается.

Один проблемный topic не должен автоматически скрывать весь community block,
если другие элементы успешно получены и валидны.

Весь block скрывается только если после фильтрации не остаётся пригодных данных
или если сама Discourse integration недоступна.

## 11. Self-protection

Integration должна иметь защиту от каскадной деградации Discourse:

- bounded timeout;
- ограниченное retry behavior;
- backoff/anti-cascade behavior;
- отсутствие бесконтрольного fan-out на page request.

Конкретные timeout, retry и backoff значения остаются implementation details.

## 12. Source of truth

Discourse остаётся authoritative source для всех forum/community fields,
перечисленных в этом контракте.

KAFENE cache хранит только временную read-only копию.

Изменение cached значения не является изменением community state и не должно
записываться обратно в Discourse.

## Что этот contract не решает

Этот документ намеренно не определяет:

- auth/SSO/IdP;
- website-native user identity;
- website -> Discourse writes;
- CMS/content storage;
- frontend framework/runtime;
- search engine;
- Ask KAFENE;
- News/Changes;
- persistent read model;
- queue/event bus;
- webhook receiver;
- database technology;
- exact Discourse endpoint paths;
- точные TTL/retry/backoff values;
- business/marketplace integration;
- broader cross-surface mapping architecture.

## Условия последующей канонизации

Перед переводом в CANONICAL необходимо убедиться, что:

- контракт согласуется с ADR-001 и HOME INTERACTION MODEL;
- frontend fixtures соответствуют allowlist полей;
- implementation не требует privileged Discourse access;
- 15-minute freshness ceiling и hide-on-outage реализуемы без отдельного
  persisted read model;
- resource-level failure не приводит к page-wide failure;
- любые расширения scope явно вынесены в отдельное решение.

До явного принятия этот документ остаётся **ACTIVE DRAFT**.
