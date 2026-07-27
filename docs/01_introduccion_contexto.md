# I. INTRODUCCIÓN (Visión y alcance del sistema)

El proyecto **Pequeños sanos** es una plataforma tecnológica diseñada para acompañar a los padres de familia en el proceso de alimentación de niños de 2 a 4 años. En esta etapa del desarrollo infantil son muy frecuentes dificultades como la falta de apetito, el rechazo a probar alimentos nuevos (neofobia alimentaria) y la desmotivación para consumir dietas saludables (frutas, verduras, proteínas).

La **visión del sistema** es transformar el momento de la alimentación en una experiencia positiva y motivadora mediante la gamificación: el consumo de alimentos saludables en la vida real se traduce en progreso y recompensas dentro de un mundo virtual multijugador.

Para garantizar un desarrollo infantil equilibrado y evitar que la solución genere una adición a las pantallas, el sistema incorpora un **Control Parental Estricto de Tiempo de Pantalla**, limitando el acceso al juego a sesiones breves (ej. 10 a 15 minutos diarios) configuradas y gestionadas por los padres.

El **alcance inicial del sistema (MVP)** comprende:
1. Módulo de administración parental para el registro y validación del consumo de alimentos reales.
2. Motor de recompensas transaccional que convierte hábitos alimenticios en monedas/ítems virtuales.
3. Servidor de juego en tiempo real (WebSockets a 30 FPS) para la interacción del avatar infantil.
4. Temporizador de sesión en tiempo real que ejecuta una desconexión forzada (*Force Logout*) al agotarse el tiempo diario permitido por el padre.

---

# II. CONTEXTO DEL SISTEMA

La alimentación en la primera infancia es determinante para el crecimiento. Sin embargo, lograr que un niño de 2 a 4 años mantenga una dieta balanceada suele generar fricción diaria en el hogar. Por otro lado, el uso no regulado de dispositivos móviles a esta edad representa un riesgo de adicción temprana.

**Pequeños sanos** resuelve esta problemática uniendo dos componentes principales:

1. **Gestión Nutricional y Transaccional (Spring Boot + RDBMS):**
   El padre valida desde su panel los alimentos consumidos por el niño. El backend procesa la transacción de forma atómica y le otorga recompensas al perfil infantil sin duplicidades.
2. **Entorno Virtual Regulado (In-Memory Engine + WebSockets):**
   El niño ingresa con su avatar al mapa multijugador para disfrutar sus logros. El servidor monitorea en tiempo real los minutos consumidos y cierra la sesión automáticamente al alcanzar el límite configurado (ej. 15 minutos).