# Agent instructions

Read, in order, before durable product/architecture work:

1. `docs/00-START-HERE.md`
2. `docs/00-DECISIONS.md`
3. `docs/00-DOCS-INVENTORY.md`

Then read only the current document(s) for the scoped task.

Do not treat research or a newer file as canonical unless the inventory says so.
Do not create a parallel documentation file when an existing current document can be updated.
Any new durable doc must be registered in the inventory in the same change.

Documentation discipline:
- standard: `docs/standards/DOCUMENTATION_DISCIPLINE_v1.0.md`;
- KAFENE adoption: `docs/operations/documentation_discipline_adoption.md`.

Execution discipline:
- pinned standard: `docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.md`;
- KAFENE adoption: `docs/operations/agent_execution_discipline_adoption.md`.

Ordinary work is Level 0/1; Level 2 is reserved for an explicitly authorized living-knowledge or other long-running provenance-sensitive workflow.

For authorized coding tasks, run `python3 scripts/task_sync.py start` before edits.
After required checks and an explicit scoped commit, run `python3 scripts/task_sync.py finish`; explicit user no-commit/no-push instructions take precedence.

Use one writing agent per worktree. Details: `docs/operations/git-handoff.md`.
