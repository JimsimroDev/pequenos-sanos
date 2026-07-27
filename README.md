<div align="center">

# 🥦 Pequeños Sanos API

> **Plataforma de gamificación nutricional para niños de 2 a 4 años con control parental de tiempo de pantalla y mundo virtual multijugador.**

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=for-the-badge&logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?style=for-the-badge&logo=flyway)
![Swagger](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=for-the-badge&logo=swagger)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens)

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

- 🛡️ **Control Parental Activo** — Límite diario de pantalla configurable (5 a 60 min) con desconexión automática al agotarse.
- 🍎 **Módulo Nutricional** — Registro de consumo de alimentos reales (frutas, verduras, proteínas, cereales) que generan recompensas.
- 🎮 **Motor MMO en Tiempo Real** — Servidor WebSocket a 30 FPS con sincronización de avatares y Force Logout.
- 🏆 **Motor Transaccional de Recompensas** — Acreditación ACID de monedas con prevención de duplicados.
- 🔒 **Seguridad JWT con Roles** — Autenticación stateless con roles `PADRE` y `NINO` para control de acceso granular.
- 📊 **Reportes para Padres** — Panel con historial de consumo, tiempo jugado y monedas ganadas.

---

## 🛠️ Tech Stack

| Tecnología                      | Categoría     | Uso en el Proyecto                                           |
| :------------------------------ | :------------ | :----------------------------------------------------------- |
| ☕ **Java 21**                  | Lenguaje      | Lógica de negocio, records, sealed classes, pattern matching |
| 🍃 **Spring Boot 3.4**          | Framework     | API REST, Security, WebSockets (STOMP over SockJS)           |
| 🐘 **PostgreSQL 15+**           | Base de Datos | Almacenamiento relacional con constraints ACID               |
| 🦅 **Flyway**                   | Migraciones   | Versionado de esquema de base de datos                       |
| 🔐 **Spring Security 6 + JJWT** | Seguridad     | Autenticación Bearer JWT stateless                           |
| 📜 **SpringDoc OpenAPI 2.x**    | Documentación | Swagger UI interactivo con esquema Bearer                    |
| 🧪 **JUnit 5 + Mockito**        | Testing       | Unit tests, @WebMvcTest, @DataJpaTest                        |

---

## 📑 Documentación de la API

Una vez que la aplicación esté ejecutándose, accede a la interfaz interactiva:

| Recurso                | URL                                                                        |
| ---------------------- | -------------------------------------------------------------------------- |
| 🌐 Swagger UI          | [http://localhost:8080/documentation](http://localhost:8080/documentation) |
| 📄 OpenAPI Spec (JSON) | [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)     |

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

   | Variable      | Descripción                                      | Requerida | Default |
   | ------------- | ------------------------------------------------ | --------- | ------- |
   | `DB_USERNAME` | Usuario de PostgreSQL                            | Sí        | —       |
   | `DB_PASSWORD` | Contraseña de PostgreSQL                         | Sí        | —       |
   | `JWT_SECRET`  | Clave para firmar tokens JWT (min 32 caracteres) | Sí        | —       |

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

```
uk/jimsimrodev/pequenos_sanos/
├── config/              # Configuración global (Security, Swagger, WebSocket, CORS)
├── controller/          # Controladores REST (thin controllers)
│   └── resource/        # Interfaces Resource con documentación OpenAPI
├── domain/              # Entidades JPA, DTOs y Repositorios por feature
│   ├── usuario/         # Usuario, Rol, IUsuarioRepository, DTOs
│   ├── perfil/          # PerfilInfantil, DTOs, Repository
│   ├── alimento/        # Alimento, CategoriaAlimento, DTOs
│   ├── consumo/         # RegistroConsumo, DTOs, Repository
│   ├── recompensa/      # TransaccionRecompensa, DTOs, Repository
│   └── sesion/          # SesionJuego, DTOs, Repository
├── infra/               # Infraestructura transversal
│   ├── errores/         # TratadorDeErrores, CodigosError
│   └── security/        # TokenService, SecurityFilter, AutenticacionService
├── service/             # Lógica de negocio (Result<T> pattern)
└── websocket/           # Motor MMO en tiempo real (30 FPS)
```

---

## 🧪 Ejecución de Pruebas

```bash
# Ejecutar todos los tests (usa H2 en memoria, no requiere PostgreSQL)
./mvnw clean test

# Ejecutar solo tests de un módulo específico
./mvnw test -Dtest=TokenServiceTest
```

Los tests de integración (`@SpringBootTest`) usan el perfil `test` con H2 automáticamente.

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

### Fase 1 — Módulo Parental y Nutricional 🔄

| TASK     | Descripción                                          | Estado        |
| -------- | ---------------------------------------------------- | ------------- |
| TASK-006 | Entidad y repositorio Usuario                        | ✅ Completada |
| TASK-007 | Autenticación — registro y login                     | ⏳ Pendiente  |
| TASK-008 | Entidad y repositorio PerfilInfantil                 | ⏳ Pendiente  |
| TASK-009 | CRUD de perfiles infantiles                          | ⏳ Pendiente  |
| TASK-010 | Entidad y repositorio Alimento                       | ⏳ Pendiente  |
| TASK-011 | Endpoint de catálogo de alimentos                    | ⏳ Pendiente  |
| TASK-012 | Entidad y repositorio RegistroConsumo                | ⏳ Pendiente  |
| TASK-013 | Entidad y repositorio TransaccionRecompensa          | ⏳ Pendiente  |
| TASK-014 | Motor transaccional — registrar consumo y recompensa | ⏳ Pendiente  |
| TASK-015 | Endpoints de recompensas y reportes                  | ⏳ Pendiente  |

### Fase 2 — Motor Transaccional de Recompensas ⏳

| TASK     | Descripción                       | Estado       |
| -------- | --------------------------------- | ------------ |
| TASK-016 | Tests de integridad transaccional | ⏳ Pendiente |

### Fase 3 — Motor MMO y Tiempo Real ⏳

| TASK     | Descripción                                | Estado       |
| -------- | ------------------------------------------ | ------------ |
| TASK-017 | Entidad y repositorio SesionJuego          | ⏳ Pendiente |
| TASK-018 | Configurar WebSocket con STOMP             | ⏳ Pendiente |
| TASK-019 | Servicio de sesión de juego                | ⏳ Pendiente |
| TASK-020 | Temporizador en tiempo real y Force Logout | ⏳ Pendiente |
| TASK-021 | Broadcast de avatares a 30 FPS             | ⏳ Pendiente |

### Fase 4 — Calidad y Cierre ⏳

| TASK     | Descripción                         | Estado       |
| -------- | ----------------------------------- | ------------ |
| TASK-022 | Tests de integración end-to-end     | ⏳ Pendiente |
| TASK-023 | Seguridad — pruebas de autorización | ⏳ Pendiente |
| TASK-024 | Documentación y limpieza final      | ⏳ Pendiente |

---

## 🤝 Contribuir

Este proyecto sigue **Git Flow** con convenciones estrictas:

- **Ramas:** `feature/TASK-XXX-descripcion`, `fix/TASK-XXX-descripcion`
- **Commits:** Conventional Commits (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`)
- **PRs:** Siempre contra `develop`, nunca contra `main` directamente
- **Merge:** Squash merge preferido

Consulta los archivos de steering en `.kiro/steering/` para las reglas completas.

---

<div align="center">

Hecho con ❤️ por [JimsimroDev](https://github.com/JimsimroDev)

</div>
