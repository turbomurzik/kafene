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


## Second observed run: row identity/value capture

Tested commit: `4dc65eeff66e40725918a8d00fdc3f4e7636d428`.

Fresh-database rerun reproduced the anomaly and printed row IDs plus localized values.

After EN draft reorder `a,b,c -> c,a,b` and EN publication:

- EN published order became `c,a,b`;
- RU draft remained `a,b,c` with the correct RU values;
- RU published order became `c,a,b`, but RU localized values were reassigned by array position rather than by row identity:
  - row `c` / id ending `...250d` received RU value from former row `a` (`Альфа`);
  - row `a` / id ending `...250b` received the former untranslated `b` value (`null/null`);
  - row `b` / id ending `...250c` received RU value from former row `c` (`Гамма`).

Therefore the intermediate RU published snapshot was structurally `c,a,b` but semantically misaligned.

A subsequent RU republish repaired the localized values against the reordered row identities:

- `c -> Гамма`;
- `a -> Альфа`;
- `b -> null/null`.

### Consequence

For Payload 3.90.2, the candidate model “shared array rows with localized child fields” is unsafe for production when a shared reorder in one locale is published while another locale already has published localized child values.

This is stronger than a workflow-only caveat: an externally readable published locale can temporarily contain localized content attached to the wrong section identity.

The current shared-array/localized-child candidate must therefore remain blocked pending schema redesign. The result does not by itself establish whether Payload considers this behavior a bug or a supported consequence of localized array-child storage.
