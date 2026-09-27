# Agent instructions

Read `README.md`, `docs/research/DISCOURSE-FEASIBILITY-SPIKE.md` and
`docs/architecture/ADR-001-FORUM-ENGINE.md` before product changes.
Keep the Discourse spike and its unaccepted architecture decision boundaries.

## Git task synchronization and handoff

For authorized coding tasks, run `python3 scripts/task_sync.py start` before edits.
After required checks and an explicit scoped commit, run
`python3 scripts/task_sync.py finish`; completion requires verified publication
to the configured same-name working branch. Explicit user no-commit/no-push
instructions take precedence; report LOCAL_ONLY / HANDOFF_INCOMPLETE instead.
Use one writing agent per worktree; parallel tasks need separate worktrees/branches.
Handoff: branch, SHA, checks, push result, next action. Do not alter frozen runs.
Details and recovery: `docs/operations/git-handoff.md`.
