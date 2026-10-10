# Schema decision: localized section completeness

Status: **KEYED CONTRACT PASSED — OWNER REVIEW PENDING**

## Decision status

The completeness semantics below remain the intended product contract, but the previously proposed physical Payload representation is now blocked.

Do **not** ship the following Payload 3.90.2 representation as production schema:

- one shared `sections` array;
- shared `sectionKey` inside each row;
- localized `heading` / `body` child fields inside those same array rows.

A fresh diagnostic reproduced a cross-locale publication hazard where publishing an EN reorder moved the RU published array structure but reassigned RU localized child values by array position rather than row identity.

The replacement schema must preserve shared section identity/order without storing locale-specific content as localized child fields inside the reorderable shared array.

The semantic contract remains:

- stable shared `sectionKey`;
- locale-specific heading/body;
- translation parity not required;
- drafts may be untranslated, partial, or complete;
- publication allows only untranslated or complete rows;
- at least one complete/visible section is required.

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

## Why the semantic contract remains

The intended contract still preserves the product requirement in ADR-002:

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

The earlier suspected simple reorder defect was separately disproved and traced to malformed test-harness update data.

A later, different diagnostic found a real cross-locale publication hazard that the earlier reorder test did not cover: after both locales were published, an EN reorder followed by EN publication caused the RU published snapshot to adopt the new row order while RU localized child values remained position-aligned. A subsequent RU republish repaired the values. This blocks the shared-array/localized-child production representation.

Publish-context diagnostic on commit `3482dfefbe7641c2efabbd1347fa53e49afd9961` produced the same expected A/B/C persisted publication results on two clean runs and characterized the `locale=all` object-status path.

The keyed replacement diagnostic on commit `1fadfada99e3308e6d91e9bd047a4e9529be7b8f` passed on a fresh database: after EN reordered the shared structure and published it, RU published structure advanced to the new order while RU localized content remained correctly associated by `sectionKey`.

The consolidated keyed contract on commit `3ff40888ba5fcd4a30c8dcc3f8c8e6a09b1a577b` then passed 7/7 on a clean database, covering semantic-empty normalization, partial/zero-complete publication rejection, complete-only projection, cross-locale reorder safety and `locale=all` fail-closed behavior.

## Implementation shape

The helper/policy work remains reusable, but the storage shape must change before production wiring.

Reusable pieces:

- pure semantic helper with no Payload/I/O dependency;
- field-level normalization may collapse values that are entirely semantically empty to `null`, while mixed meaningful content is preserved as entered;
- collection `beforeChange` enforces publish completeness for the effective `req.locale`;
- draft saves allow untranslated, partial and complete rows;
- publish blocks partial rows;
- publish blocks a locale with zero complete/visible sections;
- `req.locale === "all"` publish validation fails closed in v1;
- server visibility/projection uses the same canonical completeness classifier;
- Admin v1 surfaces row state and clear validation messages without custom heavy field components;
- Admin row-state semantics and validation messages.

Storage redesign requirement:

- shared reorderable structure must not carry localized child fields whose persistence can become position-aligned across locale publication;
- localized content should instead be keyed by stable section identity outside the reorderable shared array, or moved to a separate identity-bearing collection;
- the keyed replacement shape passed the consolidated 7/7 contract on a clean database, including normalization, publish validation, cross-locale reorder safety and projection; production integration still requires Admin UX and remaining lifecycle coverage.

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
