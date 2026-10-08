# Schema decision: localized section completeness

Status: **PROPOSED — OWNER REVIEW PENDING**

## Decision

Keep the Guide section structure shared across locales.

For section rows:

- `sectionKey`: shared, required;
- `heading`: localized, optional at schema level;
- `body`: localized, optional at schema level.

Translation parity is not required.

A locale-specific section state is valid for draft when it is:

1. untranslated: both `heading` and `body` semantically empty; or
2. partial: one field meaningful and the other empty; or
3. complete: both fields meaningful.

A locale may be published only when every row is either:

- untranslated; or
- complete.

Partial rows block publication of that locale.

A published locale should have at least one complete/visible section.

## Semantic emptiness

Before completeness evaluation:

1. normalize string with NFC;
2. remove Unicode categories Z, Cc and Cf;
3. meaningful content exists only if characters remain.

Therefore values such as whitespace, NBSP, U+200B, U+FEFF and soft hyphen are semantically empty.

Placeholder characters must not be used as a production representation of missing translation. Missing translation is represented by actual null/empty localized content.

## Publish hook context

Payload 3.90.2 publish-context diagnostic on commit `3482dfefbe7641c2efabbd1347fa53e49afd9961` was run twice on clean databases with identical results.

For locale-specific Local API publication:

- `publishSpecificLocale` is normalized before collection `beforeChange`;
- the effective target locale reaches the hook as `req.locale`;
- `req.publishSpecificLocale` is not available there as an independent signal;
- mismatched external `locale=en, publishSpecificLocale=ru` reaches the hook as `req.locale=ru` and persists RU publication only;
- ordinary EN publication reaches the hook as `req.locale=en` and persists EN publication only.

For `locale=all`, the hook can receive object-valued localized `_status`. The tested object-status update did not publish either locale. Production v1 should fail closed for publish-validation paths with `req.locale === "all"` unless a supported multi-locale publication contract is added deliberately.

## Why

This preserves the product requirement in ADR-002:

- EN content can exist and be published before RU translation;
- RU publication is not blocked merely because a shared row exists only in EN;
- shared row identity and order remain common across locales;
- drafts remain permissive for ongoing translation work;
- published localized content is never half-complete.

## Evidence

Payload 3.90.2 publish-policy diagnostic on commit `10e1e0cd64fc9dfe9da607b07f2a48b96b231d5f` passed 5/5:

- EN-only publication without RU;
- RU publication with an EN-only `null/null` row;
- partial RU draft accepted;
- partial RU publish rejected by publish-time policy;
- Unicode-only emptiness handled as intended.

The earlier suspected reorder defect was separately disproved and traced to malformed test-harness update data.

Publish-context diagnostic on commit `3482dfefbe7641c2efabbd1347fa53e49afd9961` produced the same expected A/B/C persisted publication results on two clean runs and characterized the `locale=all` object-status path.

## Implementation shape

Current proposed v1 implementation shape:

- pure semantic helper with no Payload/I/O dependency;
- field-level normalization may collapse values that are entirely semantically empty to `null`, while mixed meaningful content is preserved as entered;
- collection `beforeChange` enforces publish completeness for the effective `req.locale`;
- draft saves allow untranslated, partial and complete rows;
- publish blocks partial rows;
- publish blocks a locale with zero complete/visible sections;
- `req.locale === "all"` publish validation fails closed in v1;
- server visibility/projection uses the same canonical completeness classifier;
- Admin v1 surfaces row state and clear validation messages without custom heavy field components;
- shared structural edits remain a workflow rule for now rather than a hard field access restriction.

## Still open

Implementation follow-ups still requiring explicit coverage or later product decisions:

- exact error/message shape and hook composition in production config;
- Admin UI wording/RowLabel details;
- migration strategy for existing required localized fields;
- server projection API shape;
- hard access control for shared structural edits if/when multiple editors are introduced;
- restoreVersion / schedulePublish / bulk-operation behavior;
- stale-form shared-structure overwrite risk;
- odd Unicode emptiness characters intentionally outside the current Z/Cc/Cf rule.

These are implementation/design follow-ups, not blockers to the schema model itself.
