---
name: readme-auto-update
inclusion: always
---

# README Visual Standard & Auto-Update

Before creating a Pull Request for any completed TASK, you MUST ensure the `README.md` in the project root exists and is up to date.

## Rules

1. If `README.md` does not exist, create it following the template below.
2. If a new feature, endpoint, or configuration was added, update the relevant sections.
3. Keep the visual format consistent: badges, emojis, tables, and dividers.
4. Update the "Project Progress" section to reflect completed tasks/phases.
5. Never remove existing content — only add or update.

## Required Sections

The README.md MUST include these sections in this order:

1. **Header** — Project name centered, tagline, badges (Java, Spring Boot, PostgreSQL, Flyway, Swagger)
2. **Navigation links** — Anchored links to main sections
3. **About** — Brief project description and key features with emojis
4. **Tech Stack** — Table with technology, category, and usage
5. **API Documentation** — Links to Swagger UI and OpenAPI spec
6. **Quick Start** — Prerequisites, configuration steps, environment variables, and run commands
7. **Project Architecture** — Package structure overview
8. **Running Tests** — How to execute tests
9. **Project Progress** — Table showing TASK completion status per phase
10. **Contributing** — Branch naming and PR conventions reference

## Badge Format

Use shields.io `for-the-badge` style:

```markdown
![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=for-the-badge&logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?style=for-the-badge&logo=flyway)
![Swagger](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=for-the-badge&logo=swagger)
```

## Environment Variables Table

Always document required env vars in a table:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_USERNAME` | PostgreSQL username | Yes | — |
| `DB_PASSWORD` | PostgreSQL password | Yes | — |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes | — |
