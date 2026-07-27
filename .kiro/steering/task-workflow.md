---
name: task-workflow
inclusion: always
---

# Task Workflow Rules

## Task Completion

When working on a TASK from `tasks.md`:

1. Implement all subtasks listed under the TASK.
2. Verify compilation passes (`mvn compile`).
3. Run relevant tests and confirm they pass.
4. Once verified, **immediately mark the TASK as completed** in `.kiro/specs/pequenos-sanos/tasks.md`:
   - Change `### TASK-XXX: Title` to `### TASK-XXX: Title ✓`
   - Change all `- [ ]` to `- [x]` for completed subtasks.
5. Include the `tasks.md` update in the same commit or as part of the branch changes.

## Rules

- Never leave a TASK unmarked after it has been verified and committed.
- Mark subtasks individually as they are completed if the TASK spans multiple commits.
- If a TASK is partially complete (some subtasks done, others pending), mark only the completed subtasks.
- The final commit on a TASK branch must always include the updated `tasks.md`.
