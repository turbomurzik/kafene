# Keyed localized content contract

Status: **PASS ON COMMITTED TREE — OWNER REVIEW PENDING**

Tested commit: `3ff40888ba5fcd4a30c8dcc3f8c8e6a09b1a577b`.

Environment:
- Payload: 3.90.2
- clean PostgreSQL state via `docker compose down -v` / `up -d`
- runner: `npm run keyed-localized-content-contract`

Result: **7/7 PASS**.

The consolidated pass covered:

1. EN create + locale-specific publication with keyed localized content.
2. RU draft with complete, untranslated and partial states.
3. Semantic-empty normalization to `null/null`.
4. Partial RU publication rejection.
5. RU repair + publication and complete-only public projection.
6. Cross-locale shared reorder safety: EN reorder/publication advanced RU published shared order without reassigning RU localized content, because content is keyed by stable `sectionKey`.
7. Zero-complete publication rejection and `locale=all` fail-closed behavior.

## Contract established by this pass

Physical storage candidate:
- `sections[]` is shared and reorderable;
- each row carries stable shared `sectionKey`;
- localized section text is stored outside the array in localized `sectionContent`, keyed by `sectionKey`.

Semantic rules:
- untranslated = heading/body both semantically empty;
- partial = exactly one meaningful;
- complete = both meaningful;
- draft allows all three states;
- publication allows untranslated or complete only;
- publication requires at least one complete section;
- public projection emits complete sections only, in shared structure order;
- invisible-only text is normalized to `null`;
- locale-specific publication uses effective `req.locale`;
- `locale=all` publication fails closed in v1.

## Important Payload 3.90.2 characterization

After an EN shared reorder is published:
- RU published shared structure may advance to the new order;
- RU draft shared structure may remain on its prior draft snapshot;
- keyed RU localized content remains correctly associated by `sectionKey`.

The contract therefore does not require draft shared-order equality across locales at every intermediate point.

## Not covered yet

This pass does not freeze:
- production Admin editing UX for keyed `sectionContent`;
- migration from earlier localized-child shapes;
- restoreVersion / schedulePublish / bulk paths;
- stale-form conflict UX / hard shared-structure access policy;
- final production API wrapper and Guide collection integration.

No project-level APPROVED/CLOSED/VERIFIED status is assigned by this record.
