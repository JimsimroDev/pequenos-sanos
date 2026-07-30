# Exploration: pequenos-sanos-frontend

## Current State

The backend is a fully built Spring Boot 3.4.3 application with:
- JWT-based stateless auth (BCrypt + JJWT 0.12.6)
- 6 domain modules: auth, perfil, alimento, consumo, recompensa, sesion
- REST API on port 5002 with Swagger/OpenAPI docs
- STOMP over SockJS WebSocket at `/game` endpoint for real-time game sessions
- In-memory `GameStateStore` broadcasts map state at ~30 FPS (33ms interval)
- `SessionTimerService` ticks every second, sends timer updates every 10s, force-logouts at 0

**No frontend exists yet.** The frontend will be created as a SIBLING directory at `/mnt/c/Users/jimmis.simanca/Downloads/pequenos-sanos/pequenos-sanos-frontend/` — NOT nested inside the backend repo.

---

## Verified API Contracts (from source code)

### Auth (public)
| Method | Endpoint | Request | Response | Status |
|--------|----------|---------|----------|--------|
| POST | `/api/v1/auth/registro` | `{nombre, email, password}` | `{id, nombre, email}` | 201 |
| POST | `/api/v1/auth/login` | `{email, password}` | `{token}` | 200 / 401 |

### Perfil (authenticated)
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/perfiles` | `{nombre, edadAnios(2-4), avatarCodigo, screenTimeLimit(5-60)}` | `{id, nombre, edadAnios, avatarCodigo, screenTimeLimit, monedasSaldo}` |
| GET | `/api/v1/perfiles` | - | `List<DatosRespuestaPerfil>` |
| PUT | `/api/v1/perfiles/{id}` | Same as POST | Same as POST |
| DELETE | `/api/v1/perfiles/{id}` | - | 200 |

### Alimento (authenticated)
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/alimentos` | `?categoria=FRUTA\|VERDURA\|PROTEINA\|CEREAL` | `List<{id, nombre, categoria, descripcion, puntosReward}>` |
| GET | `/api/v1/alimentos/{id}` | - | `{id, nombre, categoria, descripcion, puntosReward}` |

### Consumo (authenticated)
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/api/v1/consumos` | `{perfilId, alimentoId}` | `{id, nombreAlimento, fechaConsumo, puntosReward, procesado}` |
| GET | `/api/v1/consumos/perfil/{perfilId}` | - | `List<DatosRespuestaConsumo>` |

### Recompensa (authenticated + ownership check)
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/v1/recompensas/perfil/{perfilId}/saldo` | `{perfilId, nombrePerfil, saldo}` |
| GET | `/api/v1/recompensas/perfil/{perfilId}/historial` | `List<{id, monedasAcreditadas, tipo, createdAt, nombreAlimento}>` |

### Reporte (authenticated + ownership check)
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/v1/reportes/perfil/{perfilId}/resumen` | `{perfilId, nombrePerfil, alimentosDelDia[], monedasGanadasHoy, saldoTotal}` |

### Sesion (authenticated)
| Method | Endpoint | Response |
|--------|----------|----------|
| POST | `/api/v1/sesiones/iniciar/{perfilId}` | `{id, perfilId, minutosJugados, limitMinutos, minutosRestantes, estado}` |
| GET | `/api/v1/sesiones/perfil/{perfilId}/hoy` | `{id, perfilId, minutosJugados, limitMinutos, minutosRestantes, estado: ACTIVA\|CERRADA\|SIN_SESION}` |

### WebSocket (STOMP over SockJS)
| Action | Destination | Payload |
|--------|-------------|---------|
| Connect | `ws://localhost:5002/game` (SockJS) | JWT in connect headers |
| Send | `/app/mover` | `{perfilId, x, y, direccion}` |
| Subscribe | `/topic/mapa/mundo-1` | `{timestamp, avatares: [{perfilId, nombre, x, y, direccion}]}` |
| Subscribe | `/user/queue/timer` | `{minutosRestantes, segundosRestantes}` |
| Subscribe | `/user/queue/logout` | `{codigo, mensaje}` |

### Security Notes
- `/api/v1/auth/**` is `permitAll()`; everything else requires JWT
- JWT sent as `Authorization: Bearer {token}` header
- WebSocket: JWT must be passed in STOMP `connectHeaders` (e.g., as `Authorization` header or custom header)
- Some endpoints (recompensas, reportes) enforce ownership — profile must belong to the authenticated user

---

## Key Decisions

### 1. Phaser-React Integration: PhaserGame Wrapper Component

**Decision**: Use a `PhaserGame` React wrapper component that manages the Phaser `Game` instance lifecycle.

**Pattern**:
```
React Router renders <GameView /> → mounts <PhaserGame /> → creates Phaser.Game
on unmount → calls game.destroy(true) to clean up
```

**Rationale**:
- Phaser owns its own canvas and rendering loop. React should NOT try to re-render inside the canvas.
- The wrapper pattern (used by official Phaser React templates) creates the game instance in a `useEffect` with `[]` deps, attaches to a `div` ref, and destroys on cleanup.
- Communication from Phaser → React happens via an event emitter (Phaser's EventBus or a shared Zustand store).
- Communication from React → Phaser happens via Zustand or direct scene reference.

**Key files**:
- `src/game/PhaserGame.tsx` — wrapper component
- `src/game/scenes/BootScene.ts` — asset loading
- `src/game/scenes/GameScene.ts` — main gameplay
- `src/game/EventBus.ts` — Phaser ↔ React event bridge

### 2. Phaser Game Architecture: Scene-Based with Arcade Physics

**Decision**: Use Phaser 3 with Arcade Physics, Tiled JSON tilemap, and three scenes: BootScene → PreloaderScene → GameScene.

**Rationale**:
- Arcade Physics is sufficient for simple 2D movement with boundary and sprite collision. No need for Matter.js complexity.
- Tiled is the standard tilemap editor for Phaser. Export as JSON, load via `this.load.tilemapTiledJSON()`.
- Static tilemap layer for ground/walls (non-walking areas), dynamic layer for food items.
- Avatar sprites with `velocity`-based movement via cursor keys.

**Scene lifecycle**:
1. **BootScene** — loads minimal assets (loading bar), transitions to Preloader
2. **PreloaderScene** — loads all game assets (sprites, tilemap, audio), transitions to GameScene
3. **GameScene** — main game loop: tilemap, avatar, other players, HUD, food items, timer

### 3. HUD Overlay: React DOM Over Phaser Canvas

**Decision**: Use CSS absolute positioning to overlay React DOM elements on top of the Phaser canvas.

**Rationale**:
- Phaser's DOM element support is limited and awkward for complex React components.
- Placing the Phaser `<canvas>` and React HUD `<div>` as siblings inside a relative-positioned container, with the HUD using `absolute` + `pointer-events: none` (except interactive elements), is clean and maintainable.
- The HUD reads from Zustand store which is updated by both React (REST data) and Phaser (game events via EventBus).

**Layout**:
```html
<div class="relative w-[800px] h-[600px]">
  <PhaserGame />         <!-- canvas fills container -->
  <HUDOverlay />         <!-- absolute positioned on top -->
</div>
```

### 4. WebSocket Integration: @stomp/stompjs + sockjs-client

**Decision**: Use `@stomp/stompjs` (v7+) with `sockjs-client` for the WebSocket client, managed by a Zustand store or a dedicated service class.

**Rationale**:
- `@stomp/stompjs` is the modern, maintained STOMP client (not the deprecated `stompjs` package).
- `sockjs-client` provides the SockJS fallback that Spring Boot's `WebSocketConfig` expects (`.withSockJS()`).
- The `Client` class supports `webSocketFactory: () => new SockJS(url)` for SockJS integration.
- JWT token is passed via `connectHeaders: { Authorization: 'Bearer {token}' }`.

**Connection flow**:
1. User logs in → JWT stored in Zustand + localStorage
2. Navigate to `/game/:perfilId` → POST `/api/v1/sesiones/iniciar/{perfilId}` → get session
3. Create STOMP Client with SockJS factory + JWT in connectHeaders
4. Subscribe to `/user/queue/timer`, `/user/queue/logout`, `/topic/mapa/mundo-1`
5. On avatar movement → publish to `/app/mover`
6. On TIME_EXPIRED → disconnect, redirect to `/dashboard`

**Critical**: The WebSocket broadcasts avatar positions at 30 FPS (33ms). The client must handle this rate without performance degradation — render other players as sprites, update positions in the game loop.

### 5. State Management: Zustand Stores

**Decision**: Multiple focused Zustand stores rather than one monolithic store.

**Stores**:
- `useAuthStore` — token, user info, login/logout actions
- `useProfileStore` — child profiles, CRUD actions
- `useGameStore` — session state, timer, other players, food items on map
- `useUIStore` — loading states, error messages, toasts

**Rationale**:
- Zustand is lightweight, no providers needed, works great with TypeScript.
- Separate stores avoid unnecessary re-reactors — game loop updates don't trigger dashboard re-renders.
- `useGameStore` is the bridge between Phaser and React: Phaser writes player positions, React HUD reads timer/countdown.

### 6. File Structure

```
pequenos-sanos-frontend/
├── public/
│   ├── assets/
│   │   ├── maps/           # Tiled JSON tilemaps
│   │   ├── sprites/        # Avatar sprites, food sprites
│   │   └── audio/          # Background music, coin SFX
│   └── index.html
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Router setup
│   ├── api/
│   │   ├── client.ts       # Axios instance with interceptors
│   │   └── endpoints.ts    # API endpoint functions
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── profileStore.ts
│   │   └── gameStore.ts
│   ├── game/
│   │   ├── PhaserGame.tsx   # React wrapper for Phaser
│   │   ├── EventBus.ts     # Phaser ↔ React event bridge
│   │   ├── config.ts       # Phaser.Types.Core.GameConfig
│   │   └── scenes/
│   │       ├── BootScene.ts
│   │       ├── PreloaderScene.ts
│   │       └── GameScene.ts
│   ├── websocket/
│   │   └── stompClient.ts  # STOMP client factory + connection mgmt
│   ├── components/
│   │   ├── ui/             # Button, Input, Card, Toast (atomic)
│   │   ├── layout/         # Header, ProtectedRoute
│   │   ├── auth/           # LoginForm, RegisterForm
│   │   ├── profiles/       # ProfileCard, ProfileForm, ProfileList
│   │   ├── consumption/    # FoodSelector, ConsumptionHistory
│   │   └── game/           # HUDOverlay, TimerDisplay, CoinCounter
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NewProfilePage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── EditProfilePage.tsx
│   │   └── GamePage.tsx
│   └── types/
│       └── api.ts          # TypeScript interfaces matching backend DTOs
├── deploy.sh               # AWS S3 + CloudFront deploy script
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── postcss.config.js
```

### 7. Key Dependencies with Versions

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.x | UI library |
| react-dom | ^18.3.x | DOM renderer |
| react-router-dom | ^6.26.x | Client-side routing |
| typescript | ^5.5.x | Type safety |
| vite | ^5.4.x | Build tool + dev server |
| @vitejs/plugin-react | ^4.3.x | React Fast Refresh |
| tailwindcss | ^3.4.x | Utility CSS |
| zustand | ^5.0.x | State management |
| axios | ^1.7.x | HTTP client |
| phaser | ^3.80.x | 2D game engine |
| @stomp/stompjs | ^7.0.x | STOMP WebSocket client |
| sockjs-client | ^1.6.x | SockJS fallback for WebSocket |

Dev dependencies:
| Package | Version | Purpose |
|---------|---------|---------|
| @types/react | ^18.3.x | React types |
| @types/react-dom | ^18.3.x | React DOM types |
| @types/sockjs-client | ^1.5.x | SockJS types |
| eslint | ^9.x | Linting |
| prettier | ^3.x | Formatting |

---

## Technical Risks and Mitigations

### Risk 1: Phaser Memory Leaks on Route Navigation
**Impact**: High — navigating away from `/game` without proper cleanup causes memory leaks and ghost canvas elements.
**Mitigation**: `PhaserGame.tsx` MUST call `game.destroy(true)` in the `useEffect` cleanup function. All Phaser scenes must use `this.events.once('shutdown', ...)` to clean up listeners, timers, and physics bodies.

### Risk 2: WebSocket 30 FPS Broadcast Rate
**Impact**: Medium — receiving `DatosEstadoMapa` every 33ms with many players could cause jank.
**Mitigation**: Render other players as lightweight sprites (no complex animations). Interpolate positions between updates using Phaser's `lerp`. Throttle HUD updates to 1 Hz (timer already updates every 10s from server).

### Risk 3: JWT Token Expiry During Long Game Sessions
**Impact**: Medium — a child playing for their full `screenTimeLimit` (up to 60 min) may outlast the JWT token.
**Mitigation**: Check backend JWT expiry (verify `TokenService` TTL). If short-lived (< 60 min), implement a silent refresh endpoint or extend token lifetime for active sessions. The WebSocket connection will drop on 401; handle reconnection gracefully.

### Risk 4: Vite Dev Server Proxy for API + WebSocket
**Impact**: Low — CORS in development.
**Mitigation**: Configure `vite.config.ts` with proxy rules:
```ts
server: {
  proxy: {
    '/api': 'http://localhost:5002',
    '/game': { target: 'http://localhost:5002', ws: true }
  }
}
```

### Risk 5: Phaser Asset Loading Time
**Impact**: Low — children (2-4 years old) have short attention spans.
**Mitigation**: BootScene shows a loading bar. Assets are small (simple tilemap, small sprites, short audio loops). Consider lazy-loading audio separately from visual assets.

### Risk 6: Tilemap Design Complexity
**Impact**: Medium — the 800x600 game world needs collision boundaries, walkable areas, and food spawn points.
**Mitigation**: Use Tiled map editor with a simple 2-layer approach: `ground` (walkable) and `walls` (collision). Food items spawn at predefined positions or random walkable tiles. Keep the map small enough to fit in one screen (no camera scrolling needed for MVP).

---

## Recommended Approach Summary

1. **Scaffold** with `npm create vite@latest` (React + TypeScript template)
2. **Add Tailwind** via PostCSS plugin
3. **Build auth flow first** (login, register, Axios interceptors, Zustand auth store)
4. **Build parent dashboard** (profiles, consumption, reports — standard React CRUD)
5. **Integrate Phaser** last (PhaserGame wrapper, scenes, tilemap, WebSocket)
6. **WebSocket** connects in GameScene, not in React — keeps game loop tight
7. **Deploy** with `deploy.sh` pushing to S3 + CloudFront invalidation

---

## Ready for Proposal

**Yes.** All backend API contracts are verified from source code. The Phaser-React integration pattern is well-established. The WebSocket protocol is fully documented in the backend's `WebSocketConfig`, `GameSessionHandler`, and `SessionTimerService`. Risk mitigations are identified. The project is ready for the proposal phase.
