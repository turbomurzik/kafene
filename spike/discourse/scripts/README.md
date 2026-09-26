# Spike scripts

## load_fixtures.py

Loads synthetic fixture topics into an already-configured Discourse instance through the supported REST API.

It does not create the Discourse installation and does not write to PostgreSQL directly.

## run_eval.py

Consumes the evaluation cases and a retrieval-results export to calculate deterministic Hit@K and MRR metrics.

The exact live semantic-search invocation is intentionally not hard-coded until the supported API/plugin surface is verified on the selected Discourse build. This avoids baking an undocumented/private endpoint into the spike.

## Principle

The spike distinguishes:

- **documented platform behavior**;
- **supported plugin/API behavior verified live**;
- **assumptions**.

Only the second category can close the open architecture questions.
