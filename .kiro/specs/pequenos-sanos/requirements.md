# Requirements — Pequeños Sanos

## Overview

**Pequeños Sanos** (NutriWorld MMO) es una plataforma de gamificación nutricional para niños de 2 a 4 años. Transforma el consumo de alimentos saludables en la vida real en recompensas dentro de un mundo virtual multijugador (MMO), mientras el padre gestiona y limita el tiempo de pantalla. El sistema garantiza la integridad transaccional de las recompensas y la desconexión automática al agotarse el tiempo diario permitido.

---

## Actors

| Actor | Tipo | Descripción |
|-------|------|-------------|
| **Padre / Tutor** | Humano | Administrador de la cuenta. Registra alimentos, configura tiempo de pantalla, gestiona perfiles infantiles y consulta reportes. |
| **Niño (2-4 años)** | Humano | Usuario final / Jugador. Interactúa con su avatar en el mapa virtual dentro del tiempo permitido. |
| **Backend Transaccional** | Sistema (Spring Boot) | Núcleo de negocio. Procesa registros de alimentación, otorga recompensas y audita integridad de datos. |
| **Servidor MMO** | Sistema (WebSockets) | Motor en tiempo real. Sincroniza el mapa, monitorea minutos jugados y ejecuta Force Logout al expirar el tiempo. |
| **Base de Datos Relacional** | Sistema (PostgreSQL) | Persiste perfiles, alimentos, transacciones y configuraciones. |

---

## Functional Requirements

### Módulo 1 — Parental y Nutricional (CS-1, CS-3, CS-6)

#### REQ-01: Registro de Usuario Padre/Tutor
- **CU-01 relacionado:** Registrar consumo de alimento saludable
- El sistema debe permitir al Padre/Tutor crear una cuenta con email, contraseña y datos básicos.
- El sistema debe autenticar al Padre/Tutor mediante JWT.
- El sistema debe permitir cerrar sesión e invalidar el token.

#### REQ-02: Gestión de Perfiles Infantiles
- **CU-04:** Gestionar perfil infantil
- El Padre/Tutor debe poder crear, editar y eliminar perfiles infantiles (nombre, edad, avatar).
- Cada perfil infantil debe estar asociado exclusivamente a un padre.
- El sistema debe soportar múltiples perfiles infantiles por cuenta de padre.

#### REQ-03: Catálogo de Alimentos
- **CU-05:** Consultar catálogo de alimentos
- El sistema debe exponer un catálogo de alimentos saludables con nombre, categoría (frutas, verduras, proteínas), valor nutricional y puntos de recompensa asociados.
- El catálogo debe ser consultable por el Padre/Tutor al momento de registrar el consumo.

#### REQ-04: Registro y Validación del Consumo de Alimentos
- **CU-01 → <<include>> → CU-02:** Registrar consumo de alimento saludable → Validar alimento consumido
- El Padre/Tutor debe poder registrar el alimento consumido por el niño seleccionándolo del catálogo.
- El backend debe validar que el alimento exista en el catálogo antes de procesarlo.
- El sistema debe marcar el registro con fecha, hora y perfil infantil.
- Un registro aprobado debe desencadenar automáticamente el otorgamiento de recompensa (CU-07).

#### REQ-05: Configuración del Límite de Tiempo de Pantalla
- **CU-03:** Configurar límite de tiempo de pantalla
- El Padre/Tutor debe poder configurar el límite diario de tiempo de pantalla (`screen_time_limit`) por perfil infantil (mínimo 5 min, máximo 60 min).
- El límite configurado debe persistirse y ser consultado por el Servidor MMO en cada sesión.
- El sistema debe validar el rango permitido del tiempo configurado.

#### REQ-06: Panel de Control Parental y Reportes
- **CU-06:** Consultar reportes de uso
- El Padre/Tutor debe poder consultar el historial de alimentos registrados por perfil infantil.
- El sistema debe mostrar el tiempo de juego consumido vs. el límite configurado por día.
- El sistema debe listar las recompensas acreditadas al perfil infantil.

---

### Módulo 2 — Motor Transaccional de Recompensas (CS-2)

#### REQ-07: Otorgamiento de Recompensas
- **CU-07:** Otorgar recompensa por alimento validado
- Tras validar un registro de consumo, el backend debe calcular y acreditar monedas/ítems al perfil infantil.
- El proceso debe ejecutarse de forma atómica (transacción ACID): si falla algún paso, no debe acreditarse nada.
- Las recompensas acreditadas deben quedar registradas con fecha/hora y referencia al registro de consumo.

#### REQ-08: Prevención de Registro Duplicado
- **CU-08:** Prevenir registro duplicado
- El sistema debe garantizar idempotencia: un mismo registro de consumo no puede generar dos transacciones de recompensa.
- Se debe implementar un mecanismo de bloqueo optimista o restricción a nivel de base de datos.
- Si se detecta duplicado, el sistema debe retornar un error controlado sin fallo catastrófico.

#### REQ-09: Acreditación de Monedas al Perfil Infantil
- **CU-09:** Acreditar monedas al perfil infantil
- El saldo de monedas del perfil infantil debe actualizarse de forma consistente.
- El sistema debe mantener un historial de todas las transacciones de monedas (créditos y débitos).
- El saldo nunca puede ser negativo.

---

### Módulo 3 — Motor MMO y Control de Tiempo Real (CS-4, CS-5)

#### REQ-10: Ingreso al Mundo Virtual con Avatar
- **CU-10:** Ingresar al mundo virtual con avatar
- El Niño debe poder autenticarse con su perfil infantil y conectarse al mapa virtual vía WebSocket.
- Al conectarse, el servidor debe consultar el `screen_time_limit` y el tiempo ya consumido en el día.
- Si el tiempo diario ya fue agotado, el servidor debe rechazar la conexión inmediatamente.

#### REQ-11: Sincronización de Avatares en Mapa Virtual
- **CU-11:** Sincronizar avatares en mapa virtual
- El servidor WebSocket debe transmitir posiciones de todos los avatares conectados a 30 FPS.
- Los movimientos del avatar deben sincronizarse con latencia mínima entre todos los clientes conectados.
- El estado del mapa (posiciones) debe mantenerse en memoria (In-Memory Engine).

#### REQ-12: Monitoreo de Tiempo de Sesión
- **CU-12:** Monitorear tiempo de sesión
- El servidor debe mantener un temporizador por sesión activa en RAM.
- El temporizador debe descontar minutos en tiempo real desde el inicio de la sesión.
- El tiempo restante debe ser accesible por el cliente para mostrarlo al Niño.

#### REQ-13: Desconexión Forzada (Force Logout)
- **CU-12 → <<include>> → CU-13:** Monitorear tiempo → Ejecutar desconexión forzada
- Al agotarse el tiempo diario, el servidor debe enviar una señal de Force Logout al cliente.
- La conexión WebSocket debe cerrarse de forma limpia (código de cierre estándar).
- El tiempo consumido debe persistirse en base de datos al finalizar la sesión.
- No debe ser posible reconectarse hasta el día siguiente (reset a medianoche).

---

## Non-Functional Requirements

| ID | Requisito | Métrica |
|----|-----------|---------|
| NFR-01 | Rendimiento del servidor de juego | 30 FPS sostenidos con hasta 50 avatares concurrentes |
| NFR-02 | Integridad transaccional | 0 transacciones de recompensa duplicadas |
| NFR-03 | Disponibilidad del backend | 99.5% uptime en ambiente de producción |
| NFR-04 | Seguridad de autenticación | JWT con expiración, sin almacenamiento de contraseñas en texto plano (BCrypt) |
| NFR-05 | Latencia WebSocket | < 50 ms para sincronización de movimiento de avatares |
| NFR-06 | Escalabilidad | Arquitectura lista para escalar horizontalmente el backend Spring Boot |
| NFR-07 | Trazabilidad | Todos los registros de consumo y transacciones deben ser auditables |

---

## Out of Scope (MVP)

- Tienda virtual para canjear monedas por ítems cosméticos.
- Notificaciones push a dispositivos móviles.
- Integración con sistemas externos de salud o nutrición.
- Panel de administración de contenido del catálogo (se gestiona directo en BD en MVP).
- Modo offline del cliente de juego.
