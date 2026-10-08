# Payload reorder diagnostic pass

Статус: **EXECUTABLE DIAGNOSTIC — RESULT UNKNOWN UNTIL RUN**

Цель — минимально различить причины observed edge case, где EN reorder silently becomes a no-op после RU locale-specific invisibility publication.

Этот pass:
- не меняет production code;
- не меняет production schema;
- не меняет уже закрытый Local Invalidation harness;
- использует отдельные diagnostic collections и config.

## Matrix

### T0 — baseline + write/read/version/raw-DB evidence

Baseline:
- shared array;
- localized required heading/body;
- RU second row made fixture-invisible with U+200B;
- RU published;
- EN non-identity reorder attempted.

Capture:
- update return order;
- immediate refetch order;
- version count before/after reorder;
- raw Drizzle rows from matching Payload tables before/after.

Purpose:
- distinguish write-not-persisted from read-overlay/version/identity effects.

### T1 — normal RU content

Same required-localized schema, but no invisible/placeholder RU row.

Purpose:
- test whether ignored reorder depends on locale-specific invisibility state.

### T2 — RU invisible draft only

RU row made U+200B-invisible, but RU is not re-published before EN reorder.

Purpose:
- distinguish publication snapshot/state from mere RU draft content.

### T4 — target schema candidate

Localized heading/body are optional.
RU second row is stored as actual null/null and RU is published before EN reorder.

Purpose:
- test whether the edge case disappears under the ADR-002-compatible target schema and without placeholder content.

### T6 — array without localized row fields

Array remains shared, but heading/body are non-localized.

Purpose:
- distinguish generic array-order behavior from the interaction of shared array ordering with localized children.

## Interpretation

- T4 APPLIED while T0 IGNORED: strong evidence that current required/placeholder state is the trigger; supports schema policy B.
- T6 APPLIED while T0 IGNORED: localized children inside shared rows are implicated.
- T2 APPLIED while T0 IGNORED: RU publication/localized version state is implicated.
- T1 APPLIED while T0 IGNORED: invisibility/placeholder-specific state is implicated.
- T0 version count increases but refetch order stays old: write/version created but read/merge/identity path is suspect.
- T0 version count unchanged and update return already shows old order: write path is suppressing the reorder before persistence.

No hypothesis is considered established until actual run output is reviewed.

## Run

From `spike/payload`:

    git rev-parse HEAD
    docker compose down -v
    docker compose up -d
    npm run reorder-diagnostic

Return the complete output, especially every `DIAG T0...T6` line and PASS/FAIL summary.
