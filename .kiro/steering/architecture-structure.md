---
name: architecture-structure
inclusion: always
---

# Workspace Project Structure & Standards

## Project Architecture

All new code must strictly follow the feature-based package structure under `uk.jimsimrodev.pequenos_sanos`. The project separates HTTP routing, core domain modules, and infrastructure concerns.

### Required Package Structure

```
uk/jimsimrodev/pequenos_sanos/
├── config/          # Global configuration classes (e.g., CORS, Swagger, Security)
├── controller/      # REST Controllers (e.g., ConsumoController.java)
├── domain/          # Core business logic organized by feature/entity
│   └── [entity]/    # e.g., usuario, perfil, alimento, consumo, recompensa, sesion
│       ├── [Entity].java              # JPA Entity
│       ├── Datos[Name].java           # Request/Response DTO records
│       └── I[Entity]Repository.java   # Spring Data JPA Repository
├── infra/
│   ├── errores/     # Global error handlers (TratadorDeErrores.java)
│   └── security/    # Security, JWT filters, authentication logic
├── service/         # Business services (ConsumoService.java, etc.)
└── websocket/       # WebSocket handlers and in-memory game state
```

### Layering & Naming Rules

1. **`domain/[entity]/` Module:**
   - Group the JPA Entity, its DTOs, and the Repository in one folder named after the entity (lowercase).
   - **DTOs:** Java `record` types prefixed with `Datos` (e.g., `DatosRegistroConsumo`, `DatosRespuestaPerfil`).
   - **Repositories:** Interface prefixed with `I`, suffixed with `Repository` (e.g., `IConsumoRepository`).

2. **`controller/` Layer:**
   - Thin controllers — HTTP concerns only (status codes, request/response mapping).
   - Never expose raw JPA entities in responses.

3. **`infra/` Layer:**
   - `errores/`: `@RestControllerAdvice` global handler.
   - `security/`: JWT filter, `TokenService`, `SecurityConfig`.

4. **`service/` Layer:**
   - Business rules and orchestration.
   - Returns `Result<T>` for controlled business failures.

5. **`config/` Layer:**
   - `SwaggerConfig`, `SecurityConfig`, `WebSocketConfig`, `CorsConfig`.

## Configuration & Environment

- Externalize configuration using `application.yml` in `src/main/resources`.
- Never commit secrets, passwords, or JWT secret keys.

## Commit Hygiene

- Keep changes focused per commit.
- Maintain clear and updated documentation when altering public APIs.
