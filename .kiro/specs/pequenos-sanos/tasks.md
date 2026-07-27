# Tasks — Pequeños Sanos

## Implementation Plan

Las tareas están organizadas en 4 fases que siguen el orden natural de dependencias:
**Fundación → Módulo Parental → Motor Recompensas → Motor MMO**.
Cada tarea es atómica, verificable y referencia los requisitos y el diseño del que deriva.

---

## Fase 0 — Fundación del Proyecto

### TASK-001: Inicializar proyecto Spring Boot ✓

- [x] Crear proyecto Maven con Spring Boot 3.x y Java 21 en `src/`
- [x] Agregar dependencias: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-websocket`, `spring-boot-starter-validation`, `postgresql`, `flyway-core`, `jjwt-api`, `jjwt-impl`, `springdoc-openapi-starter-webmvc-ui`
- [x] Configurar `application.yml`: datasource (PostgreSQL), JPA (ddl-auto: validate), Flyway, server port 8080
- [x] Crear clase principal `PequenosSanosApplication.java` en `uk.jimsimrodev.pequenos_sanos`
- [x] Verificar que la aplicación inicia sin errores
- **Refs:** design.md §2 (Package Structure), design.md §1 (Tech Stack)

### TASK-002: Configurar base de datos y migraciones Flyway ✓

- [x] Crear base de datos PostgreSQL `pequenos_sanos_db`
- [x] Crear migración `V1__create_usuarios.sql`: tabla `usuarios`
- [x] Crear migración `V2__create_perfiles_infantiles.sql`: tabla `perfiles_infantiles`
- [x] Crear migración `V3__create_alimentos.sql`: tabla `alimentos` + datos semilla (10 alimentos mínimo: frutas, verduras, proteínas)
- [x] Crear migración `V4__create_registros_consumo.sql`: tabla `registros_consumo` con constraint UNIQUE(perfil_id, alimento_id, fecha_consumo)
- [x] Crear migración `V5__create_transacciones_recompensa.sql`: tabla `transacciones_recompensa` con UNIQUE(registro_consumo_id)
- [x] Crear migración `V6__create_sesiones_juego.sql`: tabla `sesiones_juego` con UNIQUE(perfil_id, fecha_sesion)
- [x] Verificar que Flyway aplica todas las migraciones sin errores al arrancar
- **Refs:** design.md §3 (Data Model), requirements.md REQ-08 (prevención duplicados)

### TASK-003: Implementar infraestructura de seguridad JWT ✓

- [x] Crear `TokenService.java` en `infra/security/`: métodos `generarToken(Usuario)` y `getSubject(String token)`
- [x] Crear `DatosJWTToken.java` record en `domain/usuario/`
- [x] Crear `SecurityFilter.java` que intercepta requests, valida Bearer token y carga el `SecurityContext`
- [x] Crear `SecurityConfig.java` en `config/`: configurar `SecurityFilterChain`, deshabilitar CSRF, stateless session, rutas públicas (`/auth/**`, `/api-docs/**`)
- [x] Crear `AutenticacionService.java` en `infra/security/` implementando `UserDetailsService`
- [x] Escribir test unitario para `TokenService`: genera token, extrae subject correctamente
- **Refs:** design.md §7 (Security Design), requirements.md REQ-01

### TASK-004: Implementar manejo global de errores ✓

- [x] Crear `TratadorDeErrores.java` en `infra/errores/` con `@RestControllerAdvice`
- [x] Manejar: `EntityNotFoundException` → 404, `AccessDeniedException` → 403, `MethodArgumentNotValidException` → 400 (incluir detalle de campos), `DataIntegrityViolationException` → 409, `Exception` → 500
- [x] Crear clase `Result<T>` en `infra/` con variantes `Result.Success<T>` y `Result.Error` (código + mensaje)
- [x] Definir constantes de códigos de error en `infra/errores/CodigosError.java`
- [x] Verificar que errores de validación de DTO retornan 400 con lista de campos inválidos
- **Refs:** design.md §9 (Error Handling), steering: service-error-handling.md

### TASK-005: Configurar Swagger/OpenAPI ✓

- [x] Crear `SwaggerConfig.java` en `config/` con info del proyecto (título, versión, descripción)
- [x] Configurar esquema de seguridad Bearer JWT en la UI de Swagger
- [x] Verificar que `http://localhost:8080/swagger-ui.html` carga correctamente
- **Refs:** design.md §4 (REST API Design)

---

## Fase 1 — Módulo Parental y Nutricional

> Cubre: REQ-01 a REQ-06 · CU-01, CU-02, CU-03, CU-04, CU-05, CU-06

### TASK-006: Entidad y repositorio Usuario ✓

- [x] Crear entidad JPA `Usuario.java` en `domain/usuario/` con todos los campos del diseño
- [x] Implementar `IUsuarioRepository.java` extendiendo `JpaRepository<Usuario, Long>`
- [x] Agregar método `Optional<Usuario> findByEmail(String email)`
- [x] Crear records: `DatosRegistroUsuario` (nombre, email, password — con validaciones `@NotBlank`, `@Email`, `@Size`), `DatosLoginUsuario` (email, password), `DatosRespuestaUsuario` (id, nombre, email)
- [x] Escribir `@DataJpaTest` para `IUsuarioRepository`: buscar por email existente y no existente
- **Refs:** design.md §3, design.md §2

### TASK-007: Autenticación — registro y login ✓

- [x] Crear `AuthController.java` en `controller/` con `POST /api/v1/auth/registro` y `POST /api/v1/auth/login`
- [x] Implementar lógica de registro en service: hashear password con BCrypt, persistir usuario, retornar `DatosRespuestaUsuario`
- [x] Implementar lógica de login: autenticar con `AuthenticationManager`, generar JWT, retornar `DatosJWTToken`
- [x] Retornar 201 en registro, 200 con token en login, 400 si email ya existe
- [x] Escribir `@WebMvcTest` para `AuthController`: registro exitoso → 201, email duplicado → 409, datos inválidos → 400
- **Refs:** requirements.md REQ-01, design.md §4, design.md §7

### TASK-008: Entidad y repositorio PerfilInfantil ✓

- [x] Crear entidad JPA `PerfilInfantil.java` en `domain/perfil/model/` con relación `@ManyToOne` a `Usuario`
- [x] Implementar `IPerfilInfantilRepository.java`: método `List<PerfilInfantil> findByUsuarioIdAndActivoTrue(Long usuarioId)`
- [x] Crear records: `DatosRegistroPerfil` (nombre, edadAnios, avatarCodigo, screenTimeLimit — con `@NotBlank`, `@Min(5)`, `@Max(60)`), `DatosActualizacionPerfil`, `DatosRespuestaPerfil`
- [x] Escribir `@DataJpaTest` para `IPerfilInfantilRepository`: listar perfiles de un usuario
- **Refs:** design.md §3, requirements.md REQ-02

### TASK-009: CRUD de perfiles infantiles ✓

- [x] Crear `PerfilService.java` en `service/` con métodos: `crear`, `listar`, `actualizar`, `desactivar`
- [x] En `crear` y `actualizar`: validar que `screenTimeLimit` esté entre 5 y 60 — retornar `Result.Error(LIMITE_INVALIDO)` si no
- [x] En `actualizar` y `desactivar`: validar que el perfil pertenece al padre autenticado — retornar 403 si no
- [x] Crear `PerfilController.java` en `controller/`: `POST /api/v1/perfiles` → 201, `GET /api/v1/perfiles` → 200, `PUT /api/v1/perfiles/{id}` → 200, `DELETE /api/v1/perfiles/{id}` → 204
- [x] Escribir `@WebMvcTest` para `PerfilController`: crear, listar, actualizar perfil de otro padre → 403
- **Refs:** requirements.md REQ-02, REQ-05, design.md §4

### TASK-010: Entidad y repositorio Alimento ✓

- [x] Crear enum `CategoriaAlimento.java` en `domain/alimento/model/`: `FRUTA`, `VERDURA`, `PROTEINA`, `CEREAL`
- [x] Crear entidad JPA `Alimento.java` en `domain/alimento/model/`
- [x] Implementar `IAlimentoRepository.java`: métodos `findByActivoTrue()` y `findByCategoriaAndActivoTrue(CategoriaAlimento)`
- [x] Crear record `DatosRespuestaAlimento` (id, nombre, categoria, puntosReward)
- [x] Escribir `@DataJpaTest` para `IAlimentoRepository`: filtrar por categoría
- **Refs:** design.md §3, requirements.md REQ-03

### TASK-011: Endpoint de catálogo de alimentos ✓

- [x] Crear `AlimentoController.java` en `controller/`: `GET /api/v1/alimentos` (param opcional `categoria`), `GET /api/v1/alimentos/{id}`
- [x] Retornar 200 con lista o detalle, 404 si alimento no existe
- [x] Todos los endpoints requieren autenticación JWT
- [x] Escribir `@WebMvcTest` para `AlimentoController`: listar todos, filtrar por categoría, id inexistente → 404
- **Refs:** requirements.md REQ-03, design.md §4

### TASK-012: Entidad y repositorio RegistroConsumo

- [ ] Crear entidad JPA `RegistroConsumo.java` en `domain/consumo/` con relaciones a `PerfilInfantil`, `Alimento`, `Usuario`
- [ ] Implementar `IRegistroConsumoRepository.java`: métodos `findByPerfilIdOrderByCreatedAtDesc(Long)`, `existsByPerfilIdAndAlimentoIdAndFechaConsumo(Long, Long, LocalDate)`
- [ ] Crear records: `DatosRegistroConsumo` (perfilId, alimentoId — ambos `@NotNull`), `DatosRespuestaConsumo`
- [ ] Escribir `@DataJpaTest`: verificar constraint de unicidad (mismo perfil + alimento + fecha lanza excepción)
- **Refs:** design.md §3, requirements.md REQ-04, REQ-08

### TASK-013: Entidad y repositorio TransaccionRecompensa

- [ ] Crear entidad JPA `TransaccionRecompensa.java` en `domain/recompensa/` con relación a `RegistroConsumo` y `PerfilInfantil`
- [ ] Implementar `ITransaccionRecompensaRepository.java`: método `findByPerfilIdOrderByCreatedAtDesc(Long)`
- [ ] Crear record `DatosRespuestaRecompensa` (id, monedasAcreditadas, tipo, createdAt, nombreAlimento)
- [ ] Escribir `@DataJpaTest`: verificar constraint UNIQUE en registro_consumo_id
- **Refs:** design.md §3, requirements.md REQ-07, REQ-08

### TASK-014: Motor transaccional — registrar consumo y acreditar recompensa

- [ ] Crear `RecompensaService.java` en `service/`: método `@Transactional acreditar(Long registroConsumoId) → Result<DatosRespuestaRecompensa>`
  - Cargar `RegistroConsumo`, verificar no procesado
  - Crear `TransaccionRecompensa`
  - Actualizar `monedas_saldo` en `PerfilInfantil` (nunca negativo)
  - Marcar `RegistroConsumo.procesado = true`
- [ ] Crear `ConsumoService.java` en `service/`: método `@Transactional registrar(DatosRegistroConsumo, Long usuarioId) → Result<DatosRespuestaConsumo>`
  - Validar alimento existe → `ALIMENTO_NO_ENCONTRADO`
  - Validar perfil pertenece al padre → `PERFIL_NO_ENCONTRADO`
  - Verificar no duplicado del día → `CONSUMO_DUPLICADO`
  - Persistir `RegistroConsumo`
  - Llamar `RecompensaService.acreditar()` dentro del mismo TX
- [ ] Crear `ConsumoController.java` en `controller/`: `POST /api/v1/consumos` → 201, `GET /api/v1/consumos/perfil/{id}` → 200
- [ ] Escribir test unitario para `ConsumoService`: flujo exitoso, duplicado → `CONSUMO_DUPLICADO`, alimento inexistente → `ALIMENTO_NO_ENCONTRADO`
- [ ] Escribir `@SpringBootTest` de integración: POST /consumos → verifica recompensa acreditada en BD y saldo actualizado
- **Refs:** requirements.md REQ-04, REQ-07, REQ-08, REQ-09, design.md §6

### TASK-015: Endpoints de recompensas y reportes

- [ ] Crear endpoints en un `RecompensaController.java` en `controller/`: `GET /api/v1/recompensas/perfil/{id}` → historial, `GET /api/v1/recompensas/perfil/{id}/saldo` → saldo actual
- [ ] Crear `ReporteController.java` en `controller/`: `GET /api/v1/reportes/perfil/{id}/resumen` → consumos del día + tiempo jugado + monedas ganadas
- [ ] Validar en cada endpoint que el perfil pertenece al padre autenticado
- [ ] Escribir `@WebMvcTest` para `RecompensaController`: saldo de perfil ajeno → 403
- **Refs:** requirements.md REQ-06, REQ-09, design.md §4

---

## Fase 2 — Motor Transaccional de Recompensas (consolidación)

> Esta fase valida y refuerza el módulo anterior con pruebas adicionales de integridad.

### TASK-016: Tests de integridad transaccional

- [ ] Escribir test de integración: registrar mismo consumo dos veces → segundo intento retorna `CONSUMO_DUPLICADO`, BD tiene exactamente 1 registro y 1 transacción de recompensa
- [ ] Escribir test de integración: simular fallo en `acreditar()` con `@Transactional` rollback → verificar que `RegistroConsumo` tampoco se persiste
- [ ] Escribir test unitario para `RecompensaService.acreditar()`: registro ya procesado no genera segunda transacción
- **Refs:** requirements.md REQ-08, NFR-02, design.md §6

---

## Fase 3 — Motor MMO y Control de Tiempo Real

> Cubre: REQ-10 a REQ-13 · CU-10, CU-11, CU-12, CU-13

### TASK-017: Entidad y repositorio SesionJuego

- [ ] Crear entidad JPA `SesionJuego.java` en `domain/sesion/` con relación a `PerfilInfantil`
- [ ] Implementar `ISesionJuegoRepository.java`: métodos `findByPerfilIdAndFechaSesion(Long, LocalDate)`, `findByPerfilIdAndFechaSesionAndFinIsNull(Long, LocalDate)`
- [ ] Crear record `DatosRespuestaSesion` (id, perfilId, minutosJugados, limitMinutos, minutosRestantes, estado)
- [ ] Agregar endpoint `GET /api/v1/sesiones/perfil/{id}/hoy` en un `SesionController.java`
- [ ] Escribir `@DataJpaTest`: constraint UNIQUE(perfil_id, fecha_sesion)
- **Refs:** design.md §3, requirements.md REQ-10, REQ-13

### TASK-018: Configurar WebSocket con STOMP

- [ ] Crear `WebSocketConfig.java` en `config/`: registrar endpoint `/game` con SockJS, configurar message broker `/topic` y `/user`, application prefix `/app`
- [ ] Crear `GameStateStore.java` en `websocket/`: `ConcurrentHashMap` para avatares, timers y sesiones WS
- [ ] Implementar `GameSessionHandler.java` en `websocket/` como `@Controller` con `@MessageMapping`:
  - `@MessageMapping("/mover")` → actualiza posición en `GameStateStore`
  - `@SubscribeMapping("/mapa/{mapId}")` → registra avatar en el mapa
- [ ] Verificar conexión WebSocket desde Postman/cliente de prueba
- **Refs:** design.md §5 (WebSocket Protocol), requirements.md REQ-11

### TASK-019: Servicio de sesión de juego — iniciar y validar tiempo

- [ ] Crear `SesionService.java` en `service/`: método `@Transactional iniciar(Long perfilId) → Result<DatosRespuestaSesion>`
  - Cargar perfil y `screen_time_limit`
  - Consultar `SesionJuego` del día: si existe y cerrada con `minutos_jugados >= limit` → `TIEMPO_AGOTADO`
  - Si sesión activa ya existe → `SESION_ACTIVA`
  - Crear nueva `SesionJuego` con `inicio = now()`
  - Registrar timer en `GameStateStore`
- [ ] Crear endpoint `POST /api/v1/sesiones/iniciar` en `SesionController.java` → 201 con datos de sesión
- [ ] Escribir test unitario para `SesionService.iniciar()`: caso exitoso, tiempo agotado, sesión ya activa
- **Refs:** requirements.md REQ-10, REQ-12, design.md §8

### TASK-020: Temporizador en tiempo real y Force Logout

- [ ] Crear `SessionTimerService.java` en `websocket/` con `@Scheduled(fixedRate = 1000)`:
  - Iterar sobre todos los timers activos en `GameStateStore`
  - Decrementar tiempo restante cada segundo
  - Cada 10 segundos → enviar `DatosTimerUpdate` al cliente vía `/user/queue/timer`
  - Al llegar a 0 → disparar Force Logout
- [ ] Implementar `forzarLogout(Long perfilId)`:
  - Enviar mensaje a `/user/queue/logout` con código `TIME_EXPIRED`
  - Cerrar `WebSocketSession`
  - Actualizar `SesionJuego.fin` y `minutos_jugados` en BD (`@Transactional`)
  - Remover de `GameStateStore`
- [ ] Habilitar `@EnableScheduling` en `PequenosSanosApplication`
- [ ] Escribir test unitario para `SessionTimerService`: timer a 0 → `forzarLogout()` es invocado
- **Refs:** requirements.md REQ-12, REQ-13, design.md §8

### TASK-021: Broadcast de avatares a 30 FPS

- [ ] Crear tarea `@Scheduled(fixedRate = 33)` en `GameSessionHandler.java` (33 ms ≈ 30 FPS):
  - Leer todos los avatares del mapa desde `GameStateStore`
  - Construir `DatosEstadoMapa` (timestamp + lista de AvatarState)
  - Hacer broadcast a `/topic/mapa/{mapId}` vía `SimpMessagingTemplate`
- [ ] Definir records: `DatosMovimientoAvatar` (perfilId, x, y, direccion), `DatosEstadoMapa` (timestamp, avatares), `DatosTimerUpdate` (minutosRestantes, segundosRestantes), `DatosForceLogout` (codigo, mensaje)
- [ ] Escribir test de integración WebSocket: conectar dos clientes, mover avatar 1, verificar que avatar 2 recibe la posición actualizada
- **Refs:** requirements.md REQ-11, NFR-01, NFR-05, design.md §5

---

## Fase 4 — Calidad y Cierre

### TASK-022: Tests de integración end-to-end

- [ ] `@SpringBootTest` flujo completo Módulo 1: registro padre → crear perfil → registrar consumo → verificar saldo de monedas incrementado
- [ ] `@SpringBootTest` flujo completo Módulo 2: segundo registro del mismo alimento en el mismo día → 422 con código `CONSUMO_DUPLICADO`, saldo sin cambios
- [ ] `@SpringBootTest` flujo Módulo 3: iniciar sesión → tiempo agotado → intento de reconexión → `TIEMPO_AGOTADO`
- **Refs:** requirements.md todos los REQs, design.md §10

### TASK-023: Seguridad — pruebas de autorización

- [ ] Test: endpoint con JWT expirado → 403
- [ ] Test: padre A intenta acceder a perfil del padre B → 403
- [ ] Test: niño intenta llamar endpoint de registro de consumo (solo padre) → 403
- [ ] Test: request sin token a endpoint protegido → 401
- **Refs:** requirements.md NFR-04, design.md §7

### TASK-024: Documentación y limpieza final

- [ ] Agregar Javadoc a todos los métodos `public` de controllers, services y repositorios
- [ ] Verificar que todos los endpoints aparecen correctamente en Swagger UI con descripciones
- [ ] Revisar logs: asegurar que ningún endpoint loguea datos sensibles (passwords, tokens)
- [ ] Crear `README.md` en raíz del proyecto con instrucciones de setup (BD, variables de entorno, cómo correr)
- [ ] Verificar que `mvn clean test` pasa sin errores
- **Refs:** steering: core-standards.md (Logging, Javadoc)

---

## Task Summary

| Fase      | Tasks               | Módulo                                     | Requisitos cubiertos |
| --------- | ------------------- | ------------------------------------------ | -------------------- |
| Fase 0    | TASK-001 a TASK-005 | Fundación                                  | NFR-04, NFR-07       |
| Fase 1    | TASK-006 a TASK-015 | Parental y Nutricional + Motor Recompensas | REQ-01 a REQ-09      |
| Fase 2    | TASK-016            | Integridad Transaccional                   | REQ-08, NFR-02       |
| Fase 3    | TASK-017 a TASK-021 | Motor MMO y Tiempo Real                    | REQ-10 a REQ-13      |
| Fase 4    | TASK-022 a TASK-024 | QA y Cierre                                | NFR-01 a NFR-07      |
| **Total** | **24 tareas**       |                                            | **13 REQs + 7 NFRs** |
