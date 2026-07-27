# III. OBJETIVOS DEL SISTEMA

| ID | Objetivo |
| :--- | :--- |
| **OBJ-1** | Incentivar la ingesta de alimentos saludables en niños de 2 a 4 años a través de mecánicas de gamificación. |
| **OBJ-2** | Proveer a los padres un panel intuitivo para registrar, validar y motivar el progreso alimenticio de sus hijos. |
| **OBJ-3** | Prevenir la adicción digital infantil limitando el tiempo de juego diario (ej. 15 min) mediante desconexión automática. |
| **OBJ-4** | Garantizar la integridad transaccional al adjudicar recompensas por alimentos validados sin permitir registros duplicados. |
| **OBJ-5** | Mantener una experiencia multijugador interactiva y fluida (30 FPS) durante la ventana de tiempo permitida. |

---

# IV. CARACTERÍSTICAS DEL SISTEMA

| ID | CARACTERÍSTICA | PRIORIDAD | ID DE OBJETIVO |
| :--- | :--- | :---: | :---: |
| **CS-1** | Módulo de validación de consumo de alimentos saludables por parte del padre/tutor. | Alta | OBJ-1, OBJ-2 |
| **CS-2** | Motor transaccional de recompensas (monedas/accesorios) por metas alimenticias cumplidas. | Alta | OBJ-1, OBJ-4 |
| **CS-3** | Configuración de límite de tiempo en pantalla diario (`screen_time_limit`) por perfil infantil. | Alta | OBJ-3 |
| **CS-4** | Monitoreo de tiempo en el servidor y expulsión automática (*Force Logout*) al llegar al límite (ej. 15 min). | Alta | OBJ-3, OBJ-5 |
| **CS-5** | Sincronización en tiempo real de avatares en un mapa virtual interactivo vía WebSockets. | Media | OBJ-1, OBJ-5 |
| **CS-6** | Panel de control parental para la gestión de perfiles, catálogo de alimentos y reportes de uso. | Media | OBJ-2 |

---

# V. ALCANCE DEL SISTEMA

| ENTREGABLE | CARACTERÍSTICAS INCLUIDAS |
| :--- | :--- |
| **Entregable 1: Módulo Parental y Nutricional** | **CS-1, CS-3, CS-6:** Gestión de usuarios, perfiles infantiles, catálogo de alimentos y configuración del tiempo de juego diario. |
| **Entregable 2: Motor Transaccional de Recompensas** | **CS-2:** Lógica de adjudicación de monedas/premios con aislamiento ACID y prevención de doble cobro. |
| **Entregable 3: Motor MMO y Control de Tiempo Real** | **CS-4, CS-5:** Servidor WebSocket a 30 FPS, movimiento de avatares y temporizador en RAM con desconexión forzada. |