# Keyed localized content replacement diagnostic

Status: **EXECUTABLE DIAGNOSTIC — RESULT UNKNOWN UNTIL RUN**

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
