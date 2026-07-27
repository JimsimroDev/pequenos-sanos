---
name: git-flow
inclusion: always
---

# Git Workflow & Branching Conventions

## Branch Strategy

This project follows a simplified Git Flow with the following permanent branches:

| Branch | Purpose | Direct push allowed |
|--------|---------|-------------------|
| `main` | Production-ready code only | No — PR required |
| `develop` | Integration branch for completed features | No — PR required |

All work happens in short-lived branches cut from `develop`.

## Branch Naming

Format: `<type>/<task-id>-<short-description>`

| Type | When to use | Example |
|------|------------|---------|
| `feature/` | New functionality | `feature/TASK-006-usuario-entity` |
| `fix/` | Bug fixes | `fix/TASK-014-consumo-duplicado` |
| `refactor/` | Code restructuring, no behavior change | `refactor/TASK-016-result-pattern` |
| `chore/` | Build, config, dependencies | `chore/TASK-001-spring-boot-scaffold` |
| `docs/` | Documentation only | `docs/TASK-024-javadoc-controllers` |
| `test/` | Adding or fixing tests | `test/TASK-022-integration-tests` |

Rules:
- Always lowercase, words separated by hyphens.
- Include the TASK-ID from `tasks.md` when applicable.
- Maximum 50 characters total.
- Never work directly on `main` or `develop`.

## Commit Message Format (Conventional Commits)

```
<type>(<scope>): <short summary>

Why: <reason for the change>
What: <what was changed>
```

- **First line:** maximum 72 characters, imperative mood, no period at end.
- **Type:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `build`
- **Scope:** optional, use the module/layer name — e.g., `consumo`, `auth`, `perfil`, `websocket`
- **No emojis.**

Examples:
```
feat(consumo): add endpoint to register healthy food intake

Why: Parents need to log food consumption to trigger reward flow
What: POST /api/v1/consumos with validation and Result<T> response
```

```
fix(recompensa): prevent duplicate reward on concurrent requests

Why: Race condition caused double credit on rapid duplicate POST
What: Added UNIQUE constraint on registro_consumo_id FK
```

## Pull Request Rules

- PRs always target `develop` (never `main` directly).
- Title follows the same Conventional Commits format.
- Description must include: Summary, Changes, Testing done.
- Minimum 1 reviewer before merge.
- Squash merge preferred to keep history clean.
- Delete branch after merge.

## Release Flow

```
develop → release/x.y.z → main (tag vX.Y.Z)
```
