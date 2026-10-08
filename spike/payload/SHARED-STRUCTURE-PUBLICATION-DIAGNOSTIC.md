# Shared structure publication propagation diagnostic

Status: **RESULT RECORDED — OWNER REVIEW PENDING**

Purpose: characterize one state that the consolidated localized-content contract exposed but the earlier reorder diagnostic did not cover directly:

- EN and RU have both already been published;
- EN receives a shared array reorder in draft;
- EN is published again;
- observe whether the reordered shared structure advances into EN published, RU draft, and RU published snapshots;
- then publish RU again and observe whether the RU snapshots adopt the reordered structure.

This is intentionally a characterization diagnostic. It does not change the schema or the production policy.

The diagnostic prints four exact snapshots:

- baseline with both locales published;
- after EN draft reorder;
- after EN publish;
- after RU republish.

No propagation result is assumed in advance.


## First observed run

Tested commit: `a678967991b215bd90e5eefebfc5ecaf7381b362`.

Observed on a fresh database:

- baseline: EN and RU draft/published orders were `a,b,c`;
- after EN draft reorder: EN draft became `c,a,b`, while RU draft and both published projections remained `a,b,c`;
- after EN publish:
  - EN published became `c,a,b`;
  - RU draft remained `a,b,c`;
  - RU published structural order became `c,a,b`;
  - unexpectedly, RU published visible order became `c,b`, not the expected `c,a`;
- after RU republish:
  - RU draft still remained `a,b,c`;
  - RU published order stayed `c,a,b`;
  - RU published visible order became the expected `c,a`.

This means the consolidated contract must **not** yet encode a stable cross-locale shared-reorder publication invariant.

The visible-order anomaly after EN publication is material. It may indicate localized child values were temporarily associated with reordered array positions rather than the intended row identity, but the first run did not print enough per-row identity/value detail to establish that mechanism.

The diagnostic runner is therefore extended to print, for every snapshot, each row's:

- row `id`;
- `sectionKey`;
- localized `heading`;
- localized `body`.

A second fresh run is required before choosing production workflow or schema behavior.
