---
name: tech
inclusion: always
---

# Tech Stack — Pequeños Sanos

## Language & Runtime

- **Java 21** — target language version; use records, sealed classes, pattern matching where appropriate.
- **Maven** — build tool.

## Frameworks & Libraries

| Layer         | Technology                                                    | Notes                                                          |
| ------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| Web / REST    | Spring Boot 3.x + Spring MVC                                  | `spring-boot-starter-web`                                      |
| Persistence   | Spring Data JPA + Hibernate                                   | `spring-boot-starter-data-jpa`                                 |
| Database      | PostgreSQL                                                    | Primary datastore                                              |
| DB Migrations | Flyway                                                        | Versioned SQL migrations in `src/main/resources/db/migration/` |
| Security      | Spring Security 6.x + JWT (JJWT 0.12.x)                       | Stateless Bearer token auth                                    |
| WebSocket     | Spring WebSocket + STOMP over SockJS                          | Real-time avatar sync and session timer                        |
| Validation    | Jakarta Validation (Bean Validation 3.x)                      | `@NotNull`, `@NotBlank`, `@Size`, etc.                         |
| API Docs      | SpringDoc OpenAPI 2.x (`springdoc-openapi-starter-webmvc-ui`) | Swagger UI at `/swagger-ui.html`                               |
| Testing       | JUnit 5 + Mockito + Spring Boot Test                          | `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest`               |
| Logging       | SLF4J + Logback                                               | Default Spring Boot logging                                    |

## Architecture Style

- **Layered + Feature-based packages** under `uk.jimsimrodev.pequenos_sanos`
- **Stateless REST API** — no server-side HTTP sessions; JWT in `Authorization: Bearer` header.
- **In-Memory Game Engine** — avatar positions and session timers held in `ConcurrentHashMap` inside the JVM; persisted to PostgreSQL on session close.
- **ACID transactional rewards** — `@Transactional` at service layer; UNIQUE constraints in DB prevent duplicate reward credits.

## Key Technical Constraints

- JWT secret loaded from environment variable `JWT_SECRET` — never hardcoded.
- `screen_time_limit` enforced server-side (not client-side) — client cannot bypass it.
- WebSocket broadcast target: **30 FPS** (~33 ms fixed-rate scheduled task).
- Force Logout signal sent via `/user/queue/logout` STOMP destination.
- Minimum PostgreSQL version: **15**.

## Development Environment

- Java 21 SDK
- PostgreSQL 15+ running locally or via Docker
- `application.yml` for all configuration; secrets via environment variables or `.env` (never committed)

## Preferred Patterns

- **Result\<T\>** pattern for service-layer business errors (not exceptions).
- **Constructor injection** — never `@Autowired` on fields.
- **`record` types** for all DTOs prefixed with `Datos`.
- **`@Transactional(readOnly = true)`** on all read-only service methods.
