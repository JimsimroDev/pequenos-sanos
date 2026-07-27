# Diagramas de Casos de Uso — Pequeños Sanos

Diagramas UML 2.x generados con Excalidraw. Cada archivo cubre un módulo
funcional del sistema derivado de los documentos de requisitos.

## Archivos

| Archivo | Contenido | Casos de Uso |
|---------|-----------|-------------|
| `01_Diagrama_General.excalidraw` | Vista general del sistema: actores, módulos y relaciones principales | CU-01, CU-03, CU-06, CU-07, CU-09, CU-10, CU-12, CU-13 |
| `02_Modulo_Parental_y_Nutricional.excalidraw` | Módulo de gestión parental y nutricional | CU-01 a CU-06 |
| `03_Modulo_Motor_Recompensas.excalidraw` | Motor transaccional de recompensas | CU-07 a CU-09 |
| `04_Modulo_MMO_Control_Tiempo.excalidraw` | Motor MMO y control de tiempo real | CU-10 a CU-13 |

## Actores

| Actor | Tipo |
|-------|------|
| Padre / Tutor | Humano |
| Niño (2-4 años) | Humano |
| Backend Transaccional (Spring Boot) | Sistema |
| Servidor MMO (WebSockets) | Sistema |
| Base de Datos Relacional (PostgreSQL) | Sistema |

## Trazabilidad

Los casos de uso en estos diagramas están trazados con:
- `docs/01_introduccion_contexto.md`
- `docs/02_objetivos_caracteristicas_alcance.md`
- `docs/03_contexto_interesados_entorno.md`
- `.kiro/specs/pequenos-sanos/requirements.md`
