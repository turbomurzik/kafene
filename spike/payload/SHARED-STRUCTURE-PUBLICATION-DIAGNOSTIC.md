# Shared structure publication propagation diagnostic

Status: **EXECUTABLE DIAGNOSTIC — RESULT UNKNOWN UNTIL RUN**

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
