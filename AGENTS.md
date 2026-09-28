# Agent instructions

Read `README.md`, `docs/research/DISCOURSE-FEASIBILITY-SPIKE.md` and
`docs/architecture/ADR-001-FORUM-ENGINE.md` before product changes.
Keep the Discourse spike and its unaccepted architecture decision boundaries.

Execution discipline:
- pinned standard: `docs/standards/AGENT_EXECUTION_DISCIPLINE_v1.1.md`;
- KAFENE adoption: `docs/operations/agent_execution_discipline_adoption.md`.

Ordinary work is Level 0/1; Level 2 is reserved for an explicitly authorized
living-knowledge or other long-running provenance-sensitive workflow.

For authorized coding tasks, run `python3 scripts/task_sync.py start` before edits.
After required checks and an explicit scoped commit, run
`python3 scripts/task_sync.py finish`; explicit user no-commit/no-push
instructions take precedence.

Use one writing agent per worktree. Details: `docs/operations/git-handoff.md`.
