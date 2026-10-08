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

## Semantic emptiness

Before completeness evaluation:

1. normalize string with NFC;
2. remove Unicode categories Z, Cc and Cf;
3. meaningful content exists only if characters remain.

Therefore values such as whitespace, NBSP, U+200B, U+FEFF and soft hyphen are semantically empty.

Placeholder characters must not be used as a production representation of missing translation. Missing translation is represented by actual null/empty localized content.

## Why

This preserves the product requirement in ADR-002:

- EN content can exist and be published before RU translation;
- RU publication is not blocked merely because a shared row exists only in EN;
- shared row identity and order remain common across locales;
- drafts remain permissive for ongoing translation work;
- published localized content is never half-complete.

## Evidence

Payload 3.90.2 diagnostic on commit `10e1e0cd64fc9dfe9da607b07f2a48b96b231d5f` passed 5/5:

- EN-only publication without RU;
- RU publication with an EN-only `null/null` row;
- partial RU draft accepted;
- partial RU publish rejected by publish-time policy;
- Unicode-only emptiness handled as intended.

The earlier suspected reorder defect was separately disproved and traced to malformed test-harness update data.

## Still open

This decision does not yet choose:

- final hook location / implementation shape;
- whether a published locale must have at least one visible section;
- Admin UI affordances for untranslated/partial rows;
- access control for shared structural edits;
- migration strategy for existing required localized fields;
- server projection API shape.

Those are implementation/design follow-ups, not blockers to the schema model itself.
