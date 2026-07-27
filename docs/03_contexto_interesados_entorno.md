# VI. CONTEXTO DE INTERESADOS Y DIAGRAMA

### 6.1 TABLA DE INTERESADOS

| INTERESADO | ROL EN EL SISTEMA | INTERÉS |
| :--- | :--- | :--- |
| **Padre / Tutor** | Administrador de la cuenta. | Registrar los alimentos que consume el niño y definir el límite de tiempo de juego diario. |
| **Niño (2 a 4 años)** | Usuario final / Jugador. | Interactuar con su avatar, ver su progreso y jugar dentro del tiempo permitido por el padre. |
| **Backend Transaccional (Spring Boot)** | Núcleo de negocio. | Procesar los registros de alimentación, entregar recompensas y auditar la integridad de datos. |
| **Servidor MMO (WebSockets)** | Motor en tiempo real. | Sincronizar el mapa y descontar los minutos jugados, enviando la orden de cierre de sesión al expirar el tiempo. |

### 6.2 DIAGRAMA DE CONTEXTO

```text
                  +-----------------------+
                  |     Padre / Tutor     |
                  +-----------------------+
                              |
                              | 1. Valida alimento consumido (Ej. Brócoli)
                              | 2. Configura tiempo máximo (Ej. 15 min)
                              v
  +-------------------------------------------------------+
  |                                                       |
  |                    NUTRIWORLD MMO                     |
  |                                                       |
  |  +------------------------+  +---------------------+  |
  |  |  Servidor WebSockets   |  | Motor Transaccional |  |
  |  | (Juego + Temporizador) |  | (Alimentos/Premios) |  |
  |  +------------------------+  +---------------------+  |
  |               ^                         ^             |
  +---------------|-------------------------|-------------+
                  |                         |
  (Juega 15 min / | Force Logout) (Acredita monedas por comida)
                  |                         |
                  v                         v
        +------------------+       +-------------------+
        |  Niño (Avatar)   |       | Base de Datos Rel.|
        |   (Cliente Web)  |       | (PostgreSQL/MySQL)|
        +------------------+       +-------------------+