---
name: architecture-structure
inclusion: always
---

# Package by Domain Architecture Standard

## Rule

All new code must follow the **Package by Domain** structure under `uk.jimsimrodev.pequenos_sanos`. Each business domain encapsulates its own technical sub-layers.

## Required Package Structure

```
uk/jimsimrodev/pequenos_sanos/
│
├── domain/
│   ├── auth/
│   │   ├── controllers/
│   │   │   ├── resource/
│   │   │   │   └── AuthResource.java        ← OpenAPI interface
│   │   │   └── AuthController.java           ← @RestController (thin)
│   │   ├── services/
│   │   │   ├── impl/
│   │   │   │   └── AuthServiceImpl.java
│   │   │   └── IAuthService.java
│   │   ├── repositories/
│   │   │   └── IUsuarioRepository.java
│   │   ├── dto/
│   │   │   ├── DatosRegistroUsuario.java
│   │   │   ├── DatosLoginUsuario.java
│   │   │   ├── DatosRespuestaUsuario.java
│   │   │   └── DatosJWTToken.java
│   │   └── model/
│   │       ├── Usuario.java                  ← @Entity
│   │       └── Rol.java                      ← Enum
│   │
│   ├── perfil/
│   │   ├── controllers/resource/
│   │   ├── services/impl/
│   │   ├── repositories/
│   │   ├── dto/
│   │   └── model/
│   │       └── PerfilInfantil.java
│   │
│   ├── alimento/
│   │   ├── controllers/resource/
│   │   ├── services/impl/
│   │   ├── repositories/
│   │   ├── dto/
│   │   └── model/
│   │       ├── Alimento.java
│   │       └── CategoriaAlimento.java
│   │
│   ├── consumo/
│   │   ├── controllers/resource/
│   │   ├── services/impl/
│   │   ├── repositories/
│   │   ├── dto/
│   │   └── model/
│   │
│   ├── recompensa/
│   │   ├── controllers/resource/
│   │   ├── services/impl/
│   │   ├── repositories/
│   │   ├── dto/
│   │   └── model/
│   │
│   └── sesion/
│       ├── controllers/resource/
│       ├── services/impl/
│       ├── repositories/
│       ├── dto/
│       ├── websocket/
│       │   ├── GameSessionHandler.java
│       │   └── GameStateStore.java
│       └── model/
│
├── config/                          ← Global configurations only
│   ├── SecurityConfig.java
│   ├── SwaggerConfig.java
│   └── WebSocketConfig.java
│
└── infra/                           ← Cross-cutting infrastructure
    ├── Result.java                  ← Result<T> sealed interface
    ├── errores/
    │   ├── TratadorDeErrores.java
    │   └── CodigosError.java
    └── security/
        ├── TokenService.java
        ├── SecurityFilter.java
        └── AutenticacionService.java
```

## Sub-Layer Rules

### `controllers/`

- Contains `@RestController` thin controllers.
- Has `resource/` sub-package with the OpenAPI interface (`XxxResource.java`).
- Controllers implement the `XxxResource` interface.
- Zero business logic — delegates all to the service layer.

### `services/`

- Interface named `I<Domain>Service.java`.
- Implementation in `impl/<Domain>ServiceImpl.java`.
- Returns `Result<T>` for business errors.
- `@Transactional` on write operations, `@Transactional(readOnly = true)` on reads.

### `repositories/`

- Spring Data JPA interfaces named `I<Entity>Repository.java`.

### `dto/`

- Java `record` types for request/response data.
- Named `Datos<Purpose><Domain>` (e.g., `DatosRegistroUsuario`, `DatosRespuestaPerfil`).
- Request DTOs: Jakarta Validation annotations + `@Schema`.
- Response DTOs: `@Schema` annotations only.

### `model/`

- JPA `@Entity` classes and domain enums.
- Named after the domain concept (e.g., `Usuario`, `PerfilInfantil`).

## Configuration & Infrastructure

- `config/` — global Spring beans (Security, Swagger, WebSocket, CORS).
- `infra/` — cross-cutting concerns: error handling, JWT, `Result<T>`.
- `DocumentationController` lives in `config/` as it is a global redirect.

## Naming Conventions

| Artifact           | Convention               | Example                     |
| ------------------ | ------------------------ | --------------------------- |
| Entity             | `PascalCase`             | `Usuario`, `PerfilInfantil` |
| Repository         | `I<Entity>Repository`    | `IUsuarioRepository`        |
| Service interface  | `I<Domain>Service`       | `IAuthService`              |
| Service impl       | `<Domain>ServiceImpl`    | `AuthServiceImpl`           |
| Controller         | `<Domain>Controller`     | `AuthController`            |
| Resource interface | `<Domain>Resource`       | `AuthResource`              |
| DTO                | `Datos<Purpose><Domain>` | `DatosRegistroUsuario`      |
| Enum               | `PascalCase`             | `Rol`, `CategoriaAlimento`  |
