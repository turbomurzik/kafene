# KAFENE Documentation Discipline Adoption

Status: **OPERATIONS**

KAFENE adopts `docs/standards/DOCUMENTATION_DISCIPLINE_v1.0.md` for all durable project documentation.

`PROJECT_RULES.md` remains the canonical repository-governance source. This adoption record and the standard are subordinate to it.

## Scope

Applies to:
- product documentation;
- architecture documentation;
- research/spike records;
- evidence/results;
- operational documentation;
- durable frontend/UX specifications.

Does not apply to:
- temporary scratch notes;
- disposable local prototypes;
- generated test artifacts;
- chat output not committed to the repository.

## KAFENE-specific control surface

The required control documents are:

- `PROJECT_RULES.md`
- `docs/STATUS.md`
- `docs/00-DECISIONS.md`
- `docs/00-DOCS-INVENTORY.md`
- `docs/00-START-HERE.md` for onboarding

## Current enforcement

Agents and contributors must:
- read the control surface before durable product/architecture work;
- update existing current docs rather than create parallel variants;
- register new durable docs in the inventory in the same change;
- keep research/evidence distinct from accepted decisions;
- mark deferred or superseded work explicitly.

This adoption does not authorize any product implementation by itself.
