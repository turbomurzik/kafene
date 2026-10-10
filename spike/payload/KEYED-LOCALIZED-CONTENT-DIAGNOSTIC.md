# Keyed localized content replacement diagnostic

Status: **PASS ON COMMITTED TREE — OWNER REVIEW PENDING**

Purpose: test a replacement for the unsafe “shared array with localized child fields” representation.

Candidate shape:

- shared reorderable `sections[]` contains only stable shared `sectionKey` identity;
- localized `sectionContent` is stored separately as a localized JSON object keyed by `sectionKey`;
- localized values therefore do not move with array position.

Critical scenario:

1. create EN shared structure `a,b,c` and EN keyed content;
2. publish EN;
3. add/publish RU keyed content where `b` is untranslated;
4. reorder EN shared structure to `c,a,b`;
5. publish EN;
6. verify RU published structure may advance to `c,a,b`, but RU content remains keyed correctly as `a -> Альфа`, `b -> null`, `c -> Гамма`.

This diagnostic tests storage alignment only. It does not yet freeze Admin UX, validation hook shape, or production API representation.


## Result

Tested commit: `1fadfada99e3308e6d91e9bd047a4e9529be7b8f`.

Fresh-database run: **PASS**.

After EN reordered shared structure `a,b,c -> c,a,b` and published it, RU published structure advanced to `c,a,b`, while RU localized content remained correctly keyed: `a -> Альфа`, `b -> null/null`, `c -> Гамма`.

This passes the storage-alignment probe only. Production validation, normalization, projection, Admin editing shape, migration, and other lifecycle paths still require explicit coverage.
