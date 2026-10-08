# Publish policy schema-design diagnostic

Статус: **PASS ON COMMITTED TREE — OWNER REVIEW PENDING**

Цель — проверить ADR-002-compatible schema direction без изменения production schema:

- shared `sections` array сохраняется;
- localized `heading` / `body` становятся optional;
- translation parity не требуется;
- drafts допускают неполный локализованный content;
- publish конкретной locale требует либо полной пары `heading+body`, либо полностью пустой пары;
- Unicode-only placeholders считаются semantically empty.

## Diagnostic collection

`diag-publish-policy`

- `sections`: shared array, required;
- `sectionKey`: shared + required;
- `heading`: localized + optional;
- `body`: localized + optional;
- drafts: `validate:false`;
- localizeStatus: enabled.

Publish completeness enforced only in diagnostic `beforeChange` hook when incoming `_status === 'published'`.

Это не production implementation и не фиксирует окончательный hook location/API.

## Checks

### T1 — EN-only publication without RU

EN content публикуется до существования RU translation.

Expected:
- EN published;
- RU не становится published автоматически;
- отсутствие RU translation не блокирует EN publish.

### T2 — RU publication with an EN-only row

Одна shared row имеет RU translation, другая остаётся `null/null`.

Expected:
- RU publish проходит;
- translated row сохраняется;
- EN-only row остаётся `null/null` в RU projection.

Это основной ADR-002 check.

### T3 — partial RU draft allowed

RU draft содержит `heading`, но `body = null`.

Expected:
- draft save проходит;
- partial state сохраняется.

### T4 — partial RU publish rejected

Тот же partial RU row пытается публиковаться.

Expected:
- publish отклоняется diagnostic completeness policy.

### T5 — Unicode-empty semantics

Case A:
- heading = U+200B;
- body = U+FEFF.

Expected:
- оба считаются semantically empty;
- publish разрешён как untranslated row.

Case B:
- meaningful heading;
- body = U+200B.

Expected:
- publish отклонён как partial localized row.

## Scope / non-decisions

Этот pass пока НЕ решает:

- нужен ли минимум один visible section на публикуемую locale;
- field-level validate vs collection hook как окончательная production implementation;
- Admin UI hints / row labels;
- role/access policy для structural edits;
- server projection implementation;
- migration existing rows.

Сначала проверяется сама lifecycle semantics Payload 3.90.2.

## Run

Из `spike/payload`:

    git pull
    git rev-parse HEAD
    docker compose down -v
    docker compose up -d
    npm run publish-policy-diagnostic

Нужен полный output, включая строки `POLICY HOOK`, `POLICY T*`, expected rejects и итог X/5.


## Result

Tested commit: `10e1e0cd64fc9dfe9da607b07f2a48b96b231d5f`.

Result: **5/5 PASS**.

Observed:

- T1: EN publication succeeds with no RU translation; RU remains draft and shared rows project as `null/null`.
- T2: RU publication succeeds when one shared row is translated and another remains `null/null`.
- T3: partial RU draft (`heading` present, `body=null`) is accepted and preserved.
- T4: publication of the same partial RU row is rejected by publish-time completeness policy.
- T5: U+200B / U+FEFF-only pair is classified as semantically empty; meaningful heading + invisible body is rejected as partial.

### Architectural conclusion

ADR-002-compatible schema direction is technically viable on Payload 3.90.2:

- shared `sections` array;
- shared required `sectionKey`;
- localized `heading` and `body` optional at schema level;
- untranslated locale represented by `null/null`;
- incomplete localized drafts allowed;
- completeness enforced only when publishing the affected locale;
- semantic emptiness must normalize/strip Unicode Z/Cc/Cf before validation.

This diagnostic does not yet select the final production hook/API shape. It establishes lifecycle semantics only.
