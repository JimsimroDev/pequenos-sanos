# Design — Pequeños Sanos

## 1. Architecture Overview

El sistema se compone de dos motores independientes que colaboran:

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTE WEB                               │
│   Panel Padre (Browser)          Cliente Juego (Browser/App)     │
│        REST/HTTP                        WebSocket                │
└──────────┬───────────────────────────────────┬───────────────────┘
           │                                   │
           ▼                                   ▼
┌─────────────────────┐             ┌──────────────────────┐
│  Backend Spring Boot│             │  Servidor MMO        │
│  (Puerto 8080)      │◄───────────►│  (Puerto 8081)       │
│  REST API + JWT     │  eventos    │  WebSocket + Timer   │
│  Transaccional ACID │  internos   │  In-Memory Engine    │
└──────────┬──────────┘             └──────────────────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL         │
│  Base de Datos      │
└─────────────────────┘
```

### Tecnología por capa

| Capa                  | Tecnología                           |
| --------------------- | ------------------------------------ |
| Backend transaccional | Java 21 + Spring Boot 3.x            |
| Persistencia          | Spring Data JPA + PostgreSQL         |
| Seguridad             | Spring Security + JWT (jjwt)         |
| Motor tiempo real     | Spring WebSocket (STOMP over SockJS) |
| In-Memory Engine      | ConcurrentHashMap en JVM             |
| Migraciones BD        | Flyway                               |
| Build                 | Maven                                |

---

## 2. Package Structure

Siguiendo el estándar **Package by Domain** del proyecto (`architecture-structure.md`):

```
uk/jimsimrodev/pequenos_sanos/
│
├── domain/
│   ├── auth/
│   │   ├── controllers/
│   │   │   ├── resource/
│   │   │   │   └── AuthResource.java
│   │   │   └── AuthController.java
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
│   │       ├── Usuario.java
│   │       └── Rol.java
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
│   │       └── RegistroConsumo.java
│   │
│   ├── recompensa/
│   │   ├── controllers/resource/
│   │   ├── services/impl/
│   │   ├── repositories/
│   │   ├── dto/
│   │   └── model/
│   │       └── TransaccionRecompensa.java
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
│           └── SesionJuego.java
│
├── config/
│   ├── SecurityConfig.java
│   ├── SwaggerConfig.java
│   └── WebSocketConfig.java
│
└── infra/
    ├── Result.java
    ├── errores/
    │   ├── TratadorDeErrores.java
    │   └── CodigosError.java
    └── security/
        ├── AutenticacionService.java
        ├── TokenService.java
        └── SecurityFilter.java
```

---

## 3. Data Model

### Entidades JPA

#### `Usuario`

```
usuarios
├── id              BIGSERIAL PK
├── nombre          VARCHAR(100) NOT NULL
├── email           VARCHAR(150) NOT NULL UNIQUE
├── password_hash   VARCHAR(255) NOT NULL
├── rol             VARCHAR(20) NOT NULL DEFAULT 'PADRE'  -- PADRE, NINO
├── activo          BOOLEAN DEFAULT TRUE
├── created_at      TIMESTAMP NOT NULL
└── updated_at      TIMESTAMP
```

#### `PerfilInfantil`

```
perfiles_infantiles
├── id                  BIGSERIAL PK
├── usuario_id          BIGINT FK → usuarios.id NOT NULL
├── nombre              VARCHAR(80) NOT NULL
├── edad_anios          SMALLINT NOT NULL (2-4)
├── avatar_codigo       VARCHAR(50)
├── screen_time_limit   SMALLINT NOT NULL DEFAULT 15 (minutos)
├── monedas_saldo       INTEGER NOT NULL DEFAULT 0
├── activo              BOOLEAN DEFAULT TRUE
├── created_at          TIMESTAMP NOT NULL
└── updated_at          TIMESTAMP
```

#### `Alimento`

```
alimentos
├── id              BIGSERIAL PK
├── nombre          VARCHAR(100) NOT NULL
├── categoria       VARCHAR(50) NOT NULL  -- FRUTA, VERDURA, PROTEINA, CEREAL
├── descripcion     TEXT
├── puntos_reward   SMALLINT NOT NULL DEFAULT 10
├── activo          BOOLEAN DEFAULT TRUE
└── created_at      TIMESTAMP NOT NULL
```

#### `RegistroConsumo`

```
registros_consumo
├── id              BIGSERIAL PK
├── perfil_id       BIGINT FK → perfiles_infantiles.id NOT NULL
├── alimento_id     BIGINT FK → alimentos.id NOT NULL
├── registrado_por  BIGINT FK → usuarios.id NOT NULL
├── fecha_consumo   DATE NOT NULL
├── hora_consumo    TIME NOT NULL
├── procesado       BOOLEAN NOT NULL DEFAULT FALSE
├── created_at      TIMESTAMP NOT NULL
└── UNIQUE(perfil_id, alimento_id, fecha_consumo)  -- previene duplicado diario
```

#### `TransaccionRecompensa`

```
transacciones_recompensa
├── id                  BIGSERIAL PK
├── perfil_id           BIGINT FK → perfiles_infantiles.id NOT NULL
├── registro_consumo_id BIGINT FK → registros_consumo.id NOT NULL UNIQUE
├── monedas_acreditadas SMALLINT NOT NULL
├── tipo                VARCHAR(20) NOT NULL  -- CREDITO, DEBITO
├── created_at          TIMESTAMP NOT NULL
```

#### `SesionJuego`

```
sesiones_juego
├── id              BIGSERIAL PK
├── perfil_id       BIGINT FK → perfiles_infantiles.id NOT NULL
├── fecha_sesion    DATE NOT NULL
├── inicio          TIMESTAMP NOT NULL
├── fin             TIMESTAMP
├── minutos_jugados SMALLINT NOT NULL DEFAULT 0
├── cerrada_por     VARCHAR(30)  -- FORCE_LOGOUT, USUARIO, TIMEOUT
└── UNIQUE(perfil_id, fecha_sesion)  -- una sesión por día por perfil
```

---

## 4. REST API Design

Base URL: `/api/v1`

### Auth

| Método | Endpoint         | Descripción                | Actor   |
| ------ | ---------------- | -------------------------- | ------- |
| POST   | `/auth/registro` | Crear cuenta padre/tutor   | Público |
| POST   | `/auth/login`    | Autenticarse y obtener JWT | Público |

### Perfiles Infantiles

| Método | Endpoint         | Descripción                                           | Actor |
| ------ | ---------------- | ----------------------------------------------------- | ----- |
| POST   | `/perfiles`      | Crear perfil infantil                                 | Padre |
| GET    | `/perfiles`      | Listar perfiles del padre autenticado                 | Padre |
| PUT    | `/perfiles/{id}` | Actualizar perfil (nombre, avatar, screen_time_limit) | Padre |
| DELETE | `/perfiles/{id}` | Desactivar perfil eliminado logico                    | Padre |

### Alimentos

| Método | Endpoint          | Descripción                                | Actor |
| ------ | ----------------- | ------------------------------------------ | ----- |
| GET    | `/alimentos`      | Listar catálogo (con filtro por categoría) | Padre |
| GET    | `/alimentos/{id}` | Detalle de un alimento                     | Padre |

### Consumo

| Método | Endpoint                      | Descripción                                        | Actor |
| ------ | ----------------------------- | -------------------------------------------------- | ----- |
| POST   | `/consumos`                   | Registrar consumo de alimento (dispara recompensa) | Padre |
| GET    | `/consumos/perfil/{perfilId}` | Historial de consumos de un perfil                 | Padre |

### Recompensas

| Método | Endpoint                               | Descripción                           | Actor      |
| ------ | -------------------------------------- | ------------------------------------- | ---------- |
| GET    | `/recompensas/perfil/{perfilId}`       | Historial de transacciones de monedas | Padre      |
| GET    | `/recompensas/perfil/{perfilId}/saldo` | Saldo actual de monedas               | Padre/Niño |

### Reportes

| Método | Endpoint                              | Descripción                                         | Actor |
| ------ | ------------------------------------- | --------------------------------------------------- | ----- |
| GET    | `/reportes/perfil/{perfilId}/resumen` | Resumen diario: alimentos + tiempo jugado + monedas | Padre |

### Sesión de Juego

| Método | Endpoint                          | Descripción                                        | Actor      |
| ------ | --------------------------------- | -------------------------------------------------- | ---------- |
| POST   | `/sesiones/iniciar`               | Iniciar sesión de juego (valida tiempo disponible) | Niño       |
| GET    | `/sesiones/perfil/{perfilId}/hoy` | Tiempo jugado hoy vs. límite                       | Padre/Niño |

---

## 5. WebSocket Protocol (STOMP over SockJS)

Endpoint de conexión: `ws://host:8081/game`

### Topics y Colas

| Canal                 | Dirección        | Descripción                                  |
| --------------------- | ---------------- | -------------------------------------------- |
| `/topic/mapa/{mapId}` | Server → Clients | Broadcast de posiciones de avatares (30 FPS) |
| `/app/mover`          | Client → Server  | Enviar nueva posición del avatar             |
| `/user/queue/timer`   | Server → Client  | Tiempo restante de sesión (cada 10 s)        |
| `/user/queue/logout`  | Server → Client  | Señal de Force Logout                        |

### Mensajes

**Movimiento de avatar (Client → Server)**

```json
{
  "perfilId": 42,
  "x": 120.5,
  "y": 340.2,
  "direccion": "NORTE"
}
```

**Broadcast de estado del mapa (Server → Clients)**

```json
{
  "timestamp": 1721999000000,
  "avatares": [
    { "perfilId": 42, "nombre": "Luisa", "x": 120.5, "y": 340.2 },
    { "perfilId": 55, "nombre": "Tomas", "x": 200.0, "y": 100.0 }
  ]
}
```

**Notificación de tiempo restante (Server → Client)**

```json
{
  "minutosRestantes": 8,
  "segundosRestantes": 45
}
```

**Force Logout (Server → Client)**

```json
{
  "codigo": "TIME_EXPIRED",
  "mensaje": "Tu tiempo de juego de hoy ha terminado. ¡Hasta manana!"
}
```

---

## 6. Service Layer Design

### Result Pattern

Todos los servicios retornan `Result<T>` para errores de negocio controlados:

```java
// Casos de uso que retornan Result<T>
Result<DatosRespuestaConsumo>    ConsumoService.registrar(DatosRegistroConsumo)
Result<DatosRespuestaRecompensa> RecompensaService.acreditar(Long registroConsumoId)
Result<DatosRespuestaSesion>     SesionService.iniciar(Long perfilId)
```

**Códigos de error de negocio:**

| Código                   | Descripción                                               |
| ------------------------ | --------------------------------------------------------- |
| `ALIMENTO_NO_ENCONTRADO` | El alimento_id no existe en el catálogo                   |
| `PERFIL_NO_ENCONTRADO`   | El perfil_id no existe o no pertenece al padre            |
| `CONSUMO_DUPLICADO`      | Ya existe un registro de ese alimento para ese perfil hoy |
| `TIEMPO_AGOTADO`         | El perfil ya consumió su límite diario de pantalla        |
| `SESION_ACTIVA`          | Ya existe una sesión activa para este perfil hoy          |
| `SALDO_INSUFICIENTE`     | (futuro) Intento de débito con saldo 0                    |

### Transaccionalidad

```java
// ConsumoService — flujo principal ACID
@Transactional
public Result<DatosRespuestaConsumo> registrar(DatosRegistroConsumo datos) {
    // 1. Validar alimento existe           → ALIMENTO_NO_ENCONTRADO
    // 2. Validar perfil pertenece al padre  → PERFIL_NO_ENCONTRADO
    // 3. Verificar no duplicado del día     → CONSUMO_DUPLICADO
    // 4. Persistir RegistroConsumo
    // 5. Acreditar recompensa (mismo TX)    → RecompensaService.acreditar()
    // 6. Retornar Result.success(respuesta)
}
```

---

## 7. Security Design

- Autenticación: JWT Bearer token, expira en 2 horas.
- Contraseñas: BCrypt (strength 10).
- Roles: Enum `Rol` con valores `PADRE` y `NINO`, almacenado en la tabla `usuarios`.
- Autorización: Role-based con `ROLE_PADRE` y `ROLE_NINO` en Spring Security authorities.
  - `PADRE`: gestiona perfiles, registra consumos, consulta reportes.
  - `NINO`: juega en el mundo virtual, consulta su saldo de monedas.
- El JWT incluye claims: `id`, `nombre`, `rol` (además del `subject` = email).
- El Padre solo accede a sus propios perfiles (validación en service layer).
- El Niño se autentica con `perfilId` + PIN de 4 dígitos (simplificado para MVP).
- CORS configurado para el origen del cliente web.

---

## 8. In-Memory Game State (Módulo MMO)

```java
// GameStateStore.java — estado del mapa en RAM
ConcurrentHashMap<Long, AvatarState>     avatares;    // perfilId → posición
ConcurrentHashMap<Long, SessionTimer>    timers;      // perfilId → temporizador
ConcurrentHashMap<String, WebSocketSession> sessions; // sessionId → WS session
```

`SessionTimer` mantiene:

- `perfilId`, `limitMinutos`, `minutosConsumidosHoy`, `inicioSesion`
- Scheduled task cada segundo que decrementa y dispara Force Logout al llegar a 0.

---

## 9. Error Handling

`TratadorDeErrores` (`@RestControllerAdvice`) maneja:

| Excepción                         | HTTP Status | Uso                         |
| --------------------------------- | ----------- | --------------------------- |
| `EntityNotFoundException`         | 404         | Entidad no encontrada       |
| `AccessDeniedException`           | 403         | Acceso no autorizado        |
| `MethodArgumentNotValidException` | 400         | Validación de DTO fallida   |
| `DataIntegrityViolationException` | 409         | Violación de unicidad en BD |
| `Exception` (fallback)            | 500         | Error inesperado            |

Los errores de negocio se retornan como `Result.Error` con código y mensaje, mapeados a 422 Unprocessable Entity.

---

## 10. Testing Strategy

| Tipo               | Herramienta       | Scope                                                                       |
| ------------------ | ----------------- | --------------------------------------------------------------------------- |
| Unit tests         | JUnit 5 + Mockito | Services (ConsumoService, RecompensaService, SesionService)                 |
| Slice tests (web)  | `@WebMvcTest`     | Controllers (AuthController, ConsumoController)                             |
| Slice tests (data) | `@DataJpaTest`    | Repositories (IRegistroConsumoRepository, ITransaccionRecompensaRepository) |
| Integration tests  | `@SpringBootTest` | Flujo completo: registro consumo → recompensa                               |

Todos los tests siguen el patrón **Arrange-Act-Assert (AAA)** con nombres descriptivos.
