<div align="center">

# 🥦 Pequeños Sanos API

> **Plataforma de gamificación nutricional para niños de 2 a 4 años con control parental de tiempo de pantalla y mundo virtual multijugador.**

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=for-the-badge&logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?style=for-the-badge&logo=flyway)
![Swagger](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=for-the-badge&logo=swagger)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-007EC6?style=for-the-badge&logo=socket.io)

[📑 Documentación API](#-documentación-de-la-api) •
[🚀 Inicio Rápido](#-inicio-rápido) •
[🏗️ Arquitectura](#%EF%B8%8F-arquitectura-del-proyecto) •
[🧪 Pruebas](#-ejecución-de-pruebas) •
[📊 Progreso](#-progreso-del-proyecto)

</div>

---

## 📌 Acerca del Proyecto

**Pequeños Sanos** transforma la hora de comer en una experiencia positiva y motivadora. El consumo de alimentos saludables en la vida real se traduce en progreso y recompensas dentro de un mundo virtual multijugador regulado (MMO), mientras un estricto control parental de tiempo de pantalla previene la adicción digital en la primera infancia.

### 🌟 Características Clave

- 🛡️ **Control Parental Activo** — Límite diario de pantalla configurable (5 a 60 min) con Force Logout automático al agotarse.
- 🍎 **Módulo Nutricional** — Registro de consumo de alimentos reales (frutas, verduras, proteínas, cereales) que generan recompensas.
- 🎮 **Motor MMO en Tiempo Real** — Servidor WebSocket (STOMP over SockJS) a 30 FPS con sincronización de avatares.
- 🏆 **Motor Transaccional de Recompensas** — Acreditación ACID de monedas con prevención de duplicados y ledger inmutable.
- 🔒 **Seguridad JWT con Roles** — Autenticación stateless con roles `PADRE` y `NINO` para control de acceso granular.
- 📊 **Reportes para Padres** — Panel con historial de consumo, tiempo jugado y monedas ganadas.

---

## 🛠️ Tech Stack

| Tecnología                      | Categoría     | Uso en el Proyecto                                           |
| :------------------------------ | :------------ | :----------------------------------------------------------- |
| ☕ **Java 21**                  | Lenguaje      | Lógica de negocio, records, sealed classes, pattern matching |
| 🍃 **Spring Boot 3.4**          | Framework     | API REST, Security, WebSockets (STOMP over SockJS)           |
| 🐘 **PostgreSQL 15+**           | Base de Datos | Almacenamiento relacional con constraints ACID               |
| 🦅 **Flyway**                   | Migraciones   | Versionado de esquema (V1–V6)                                |
| 🔐 **Spring Security 6 + JJWT** | Seguridad     | Autenticación Bearer JWT stateless con roles PADRE/NINO      |
| 📜 **SpringDoc OpenAPI 2.x**    | Documentación | Swagger UI con Interface Resource pattern                    |
| 🌐 **Spring WebSocket + STOMP** | Tiempo Real   | Broadcast de avatares a 30 FPS, Force Logout timer           |
| 🧪 **JUnit 5 + Mockito**        | Testing       | Unit, @WebMvcTest, @DataJpaTest, @SpringBootTest             |

---

## 📑 Documentación de la API

Una vez que la aplicación esté ejecutándose, accede a la interfaz interactiva:

| Recurso                | URL                                                                        |
| ---------------------- | -------------------------------------------------------------------------- |
| 🌐 Swagger UI          | [http://localhost:8080/documentation](http://localhost:8080/documentation) |
| 📄 OpenAPI Spec (JSON) | [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)     |

### Endpoints disponibles

| Módulo      | Método | Ruta                                    | Descripción                          |
| ----------- | ------ | --------------------------------------- | ------------------------------------ |
| Auth        | POST   | `/api/v1/auth/registro`                 | Registrar padre/tutor                |
| Auth        | POST   | `/api/v1/auth/login`                    | Autenticarse y obtener JWT           |
| Perfiles    | POST   | `/api/v1/perfiles`                      | Crear perfil infantil                |
| Perfiles    | GET    | `/api/v1/perfiles`                      | Listar perfiles del padre            |
| Perfiles    | PUT    | `/api/v1/perfiles/{id}`                 | Actualizar perfil                    |
| Perfiles    | DELETE | `/api/v1/perfiles/{id}`                 | Desactivar perfil                    |
| Alimentos   | GET    | `/api/v1/alimentos`                     | Catálogo (filtro por categoría)      |
| Alimentos   | GET    | `/api/v1/alimentos/{id}`                | Detalle de alimento                  |
| Consumo     | POST   | `/api/v1/consumos`                      | Registrar consumo + acreditar reward |
| Consumo     | GET    | `/api/v1/consumos/perfil/{id}`          | Historial de consumo                 |
| Recompensas | GET    | `/api/v1/recompensas/perfil/{id}`       | Historial de monedas                 |
| Recompensas | GET    | `/api/v1/recompensas/perfil/{id}/saldo` | Saldo actual                         |
| Reportes    | GET    | `/api/v1/reportes/perfil/{id}/resumen`  | Resumen diario                       |
| Sesiones    | POST   | `/api/v1/sesiones/iniciar/{id}`         | Iniciar sesión de juego              |
| Sesiones    | GET    | `/api/v1/sesiones/perfil/{id}/hoy`      | Estado de sesión hoy                 |

---

## 🚀 Inicio Rápido

### 📋 Requisitos Previos

- **JDK 21** o superior
- **PostgreSQL 15+** en ejecución (local o Docker)
- **Maven 3.9+** (o usa el wrapper `./mvnw` incluido)

### ⚙️ Configuración

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/JimsimroDev/pequenos-sanos.git
   cd pequenos-sanos
   ```

2. **Crear la base de datos:**

   ```sql
   CREATE DATABASE pequenos_sanos_db;
   ```

3. **Configurar variables de entorno:**

   | Variable      | Descripción                                      | Requerida |
   | ------------- | ------------------------------------------------ | --------- |
   | `DB_USERNAME` | Usuario de PostgreSQL                            | Sí        |
   | `DB_PASSWORD` | Contraseña de PostgreSQL                         | Sí        |
   | `JWT_SECRET`  | Clave para firmar tokens JWT (min 32 caracteres) | Sí        |

   En Windows (CMD):

   ```cmd
   set DB_USERNAME=postgres
   set DB_PASSWORD=tu_password
   set JWT_SECRET=mi-clave-secreta-de-al-menos-32-caracteres
   ```

4. **Ejecutar la aplicación:**

   ```bash
   ./mvnw spring-boot:run
   ```

   La API estará disponible en `http://localhost:8080`

---

## 🏗️ Arquitectura del Proyecto

Sigue el patrón **Package by Domain** con subcapas técnicas por módulo:

```
uk/jimsimrodev/pequenos_sanos/
├── config/                     # Configuración global (Security, Swagger, WebSocket)
├── domain/
│   ├── auth/                   # model/, dto/, repositories/
│   ├── perfil/                 # controllers/, services/, repositories/, dto/, model/
│   ├── alimento/               # controllers/, services/, repositories/, dto/, model/
│   ├── consumo/                # controllers/, services/, repositories/, dto/, model/
│   ├── recompensa/             # controllers/, services/, repositories/, dto/, model/
│   └── sesion/                 # controllers/, services/, repositories/, dto/, model/
│       └── websocket/          # GameSessionHandler, SessionTimerService, GameStateStore
├── infra/
│   ├── errores/                # TratadorDeErrores, CodigosError
│   └── security/               # TokenService, SecurityFilter, AutenticacionService
└── Result.java                  # Sealed Result<T> pattern
```

---

## 🧪 Ejecución de Pruebas

```bash
# Ejecutar todos los tests (usa H2 en memoria, no requiere PostgreSQL)
./mvnw clean test
```

**Cobertura de pruebas:**

- 4 unit tests — `TokenService` (JWT generation/validation)
- 4 unit tests — `IUsuarioRepository` (@DataJpaTest)
- 5 tests — `AuthController` (@WebMvcTest)
- 4 tests — `PerfilController` (@WebMvcTest)
- 4 tests — `AlimentoController` (@WebMvcTest)
- 4 tests — `IPerfilInfantilRepository` (@DataJpaTest)
- 4 tests — `IRegistroConsumoRepository` (@DataJpaTest)
- 4 tests — `ITransaccionRecompensaRepository` (@DataJpaTest)
- 4 tests — `ISesionJuegoRepository` (@DataJpaTest)
- 4 tests — `IAlimentoRepository` (@DataJpaTest)
- 4 tests — `RecompensaController` (@WebMvcTest)
- 4 unit tests — `ConsumoServiceImpl` (Mockito)
- 3 unit tests — `SesionServiceImpl` (Mockito)
- 2 unit tests — `RecompensaServiceImpl` (Mockito)
- 2 unit tests — `SessionTimerService` (Mockito)
- 3 integration tests — `ConsumoIntegrationTest` (@SpringBootTest)
- 4 integration tests — `Modulo1/3IntegrationTest` (@SpringBootTest)
- 5 integration tests — `AuthorizationTest` (@SpringBootTest + MockMvc)
- 1 test — `PequenosSanosApplicationTests` (context loads)

---

## 📊 Progreso del Proyecto

### Fase 0 — Fundación del Proyecto ✅

| TASK     | Descripción                                   | Estado        |
| -------- | --------------------------------------------- | ------------- |
| TASK-001 | Inicializar proyecto Spring Boot              | ✅ Completada |
| TASK-002 | Configurar base de datos y migraciones Flyway | ✅ Completada |
| TASK-003 | Implementar infraestructura de seguridad JWT  | ✅ Completada |
| TASK-004 | Implementar manejo global de errores          | ✅ Completada |
| TASK-005 | Configurar Swagger/OpenAPI                    | ✅ Completada |

### Fase 1 — Módulo Parental y Nutricional ✅

| TASK     | Descripción                                          | Estado        |
| -------- | ---------------------------------------------------- | ------------- |
| TASK-006 | Entidad y repositorio Usuario                        | ✅ Completada |
| TASK-007 | Autenticación — registro y login                     | ✅ Completada |
| TASK-008 | Entidad y repositorio PerfilInfantil                 | ✅ Completada |
| TASK-009 | CRUD de perfiles infantiles                          | ✅ Completada |
| TASK-010 | Entidad y repositorio Alimento                       | ✅ Completada |
| TASK-011 | Endpoint de catálogo de alimentos                    | ✅ Completada |
| TASK-012 | Entidad y repositorio RegistroConsumo                | ✅ Completada |
| TASK-013 | Entidad y repositorio TransaccionRecompensa          | ✅ Completada |
| TASK-014 | Motor transaccional — registrar consumo y recompensa | ✅ Completada |
| TASK-015 | Endpoints de recompensas y reportes                  | ✅ Completada |

### Fase 2 — Motor Transaccional de Recompensas ✅

| TASK     | Descripción                       | Estado        |
| -------- | --------------------------------- | ------------- |
| TASK-016 | Tests de integridad transaccional | ✅ Completada |

### Fase 3 — Motor MMO y Tiempo Real ✅

| TASK     | Descripción                                | Estado        |
| -------- | ------------------------------------------ | ------------- |
| TASK-017 | Entidad y repositorio SesionJuego          | ✅ Completada |
| TASK-018 | Configurar WebSocket con STOMP             | ✅ Completada |
| TASK-019 | Servicio de sesión de juego                | ✅ Completada |
| TASK-020 | Temporizador en tiempo real y Force Logout | ✅ Completada |
| TASK-021 | Broadcast de avatares a 30 FPS             | ✅ Completada |

### Fase 4 — Calidad y Cierre ✅

| TASK     | Descripción                         | Estado        |
| -------- | ----------------------------------- | ------------- |
| TASK-022 | Tests de integración end-to-end     | ✅ Completada |
| TASK-023 | Seguridad — pruebas de autorización | ✅ Completada |
| TASK-024 | Documentación y limpieza final      | ✅ Completada |

---

## 🤝 Contribuir

Este proyecto sigue **Git Flow** con convenciones estrictas:

- **Ramas:** `feature/TASK-XXX-descripcion`, `fix/TASK-XXX-descripcion`
- **Commits:** Conventional Commits (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`)
- **PRs:** Siempre contra `develop`, nunca contra `main` directamente
- **Issues:** Se cierran automáticamente con `Closes #N` al hacer merge

Consulta los archivos de steering en `.kiro/steering/` para las reglas completas del proyecto.

---

<div align="center">

Hecho con ❤️ por [JimsimroDev](https://github.com/JimsimroDev)

**MVP completado — 24 tareas en 4 fases**

</div>
