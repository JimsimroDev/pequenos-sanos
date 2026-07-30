# Design: pequenos-sanos-frontend

## Technical Approach

Greenfield React 18 + TypeScript SPA built with Vite, communicating with the existing Spring Boot backend via REST (Axios) and WebSocket (STOMP/SockJS). Phaser 3 handles the game canvas inside a React wrapper component; HUD overlay uses CSS-positioned React DOM. State managed by three focused Zustand stores (auth, profile, game). All backend DTO contracts are verified from source code (exploration.md).

## Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|---|---|---|---|
| Build tool | CRA vs Vite vs Next.js | **Vite 5** | Fastest HMR, native ESM, no SSR needed for SPA + game canvas |
| HTTP client | fetch + wrapper vs Axios | **Axios 1.7** | Interceptors for JWT injection + 401 redirect built-in; exploration confirmed this |
| State management | Redux Toolkit vs Zustand vs Context | **Zustand 5** | Zero boilerplate, no providers, TypeScript-first, perfect for cross-domain stores |
| Game engine | Phaser 3 vs PixiJS vs Canvas2D | **Phaser 3.80** | Arcade physics, tilemap support, scene lifecycle — matches backend's game protocol |
| STOMP client | stompjs (legacy) vs @stomp/stompjs | **@stomp/stompjs 7** | Modern API, SockJS factory support, TypeScript types |
| CSS | CSS Modules vs Tailwind vs styled-components | **Tailwind 3.4** | Rapid prototyping for hackathon; atomic design components use utility classes |
| Tilemap authoring | Tiled editor vs hand-crafted JSON | **Hand-crafted JSON** | Single-screen 800×600 map, no editor dependency, easy to iterate |

## Data Flow

### Auth Flow
```
LoginPage → authStore.login() → POST /api/v1/auth/login → JWT → localStorage + Zustand
                                                                              ↓
Dashboard ← ProtectedRoute checks authStore.token
```

### Game Session Flow
```
GamePage → POST /api/v1/sesiones/iniciar/{perfilId} → session data
       ↓
PhaserGame creates Phaser.Game
       ↓
BootScene → PreloaderScene (load tilemap + sprites) → GameScene
       ↓
GameScene creates STOMP client → subscribe /topic/mapa/mundo-1, /user/queue/timer, /user/queue/logout
       ↓
Cursor keys → publish /app/mover → server broadcasts at 30 FPS
       ↓
GameScene reads avatar positions → updates other player sprites
Timer updates → gameStore → HUDOverlay React component
```

### HUD React ↔ Phaser Bridge
```
Phaser GameScene ──EventBus──→ gameStore.updatePlayers() ──→ HUDOverlay (React)
                    EventBus──→ gameStore.updateTimer()

React HUD reads: useGameStore(state => state.timer)
Phaser writes: EventBus.emit('timerUpdate', data)
```

## File Changes

All files are NEW — greenfield project at `pequenos-sanos-frontend/`.

| File | Description |
|---|---|
| `package.json` | Dependencies: react, react-dom, react-router-dom, zustand, axios, phaser, @stomp/stompjs, sockjs-client |
| `vite.config.ts` | React plugin, proxy `/api` → `localhost:5002`, proxy `/game` → `localhost:5002` (ws: true) |
| `tsconfig.json` | Strict mode, target ES2020, moduleResolution bundler |
| `tailwind.config.ts` | Content paths, custom colors for game theme |
| `postcss.config.js` | tailwindcss + autoprefixer plugins |
| `index.html` | Vite entry, mounts `#root` |
| `deploy.sh` | `npm run build` → `aws s3 sync dist/ s3://bucket` → `aws cloudfront create-invalidation` |
| `src/main.tsx` | ReactDOM.createRoot, renders `<App />` |
| `src/App.tsx` | BrowserRouter with all routes, layout wrapper |
| `src/types/api.ts` | TypeScript interfaces matching all backend DTOs |
| `src/api/client.ts` | Axios instance: baseURL `/api/v1`, request interceptor injects Bearer, response interceptor catches 401 → redirect |
| `src/api/endpoints.ts` | Functions: login, register, getProfiles, createProfile, updateProfile, deleteProfile, getFoods, registerConsumption, getConsumptionHistory, getSaldo, getHistorial, getResumenDiario, startSession, getTodaysSession |
| `src/stores/authStore.ts` | `useAuthStore`: token, user, login(), logout(), isAuthenticated |
| `src/stores/profileStore.ts` | `useProfileStore`: profiles[], selectedProfile, CRUD actions |
| `src/stores/gameStore.ts` | `useGameStore`: session, timer, players[], myPerfilId — bridge between Phaser and React HUD |
| `src/game/PhaserGame.tsx` | React wrapper: useEffect creates Phaser.Game on div ref, cleanup calls game.destroy(true) |
| `src/game/EventBus.ts` | Typed EventEmitter singleton: Phaser scenes emit, React subscribes |
| `src/game/config.ts` | Phaser.Types.Core.GameConfig: 800×600, Arcade physics, scenes array |
| `src/game/scenes/BootScene.ts` | Minimal loading bar, transition to PreloaderScene |
| `src/game/scenes/PreloaderScene.ts` | Load tilemap JSON + sprite assets, transition to GameScene |
| `src/game/scenes/GameScene.ts` | Main game: tilemap rendering, player avatar (cursor keys → velocity), other player sprites (from WS), food item sprites with overlap detection, game state machine (PLAYING → TIME_EXPIRED) |
| `src/game/sprites/Player.ts` | Phaser.GameObjects.Sprite + Arcade.Body: key-based velocity (200px/s), worldBounds collision, direction state |
| `src/game/sprites/FoodItem.ts` | Phaser.GameObjects.Sprite: static position, overlap callback → emit coin earned |
| `src/websocket/stompClient.ts` | Factory: creates @stomp/stompjs Client with SockJS webSocketFactory, JWT in connectHeaders, returns {client, subscribe, disconnect} |
| `src/components/layout/ProtectedRoute.tsx` | Checks authStore.isAuthenticated, redirects to /login if not |
| `src/components/layout/Header.tsx` | Nav bar with logo, user name, logout button |
| `src/components/ui/Button.tsx` | Reusable button with Tailwind variants (primary, secondary, danger) |
| `src/components/ui/Input.tsx` | Form input with label, error state |
| `src/components/ui/Card.tsx` | Container card component |
| `src/components/ui/Toast.tsx` | Toast notification system (simple, auto-dismiss) |
| `src/components/auth/LoginForm.tsx` | Email + password form, calls authStore.login() |
| `src/components/auth/RegisterForm.tsx` | Name + email + password form, calls API register |
| `src/components/profiles/ProfileCard.tsx` | Child avatar display: name, age, coins, edit/delete |
| `src/components/profiles/ProfileForm.tsx` | Create/edit form: name, age (2-4), avatar code, screen time limit (5-60) |
| `src/components/profiles/ProfileList.tsx` | Grid of ProfileCards with "Add Child" button |
| `src/components/consumption/FoodSelector.tsx` | Category tabs (FRUTA/VERDURA/PROTEINA/CEREAL), food grid with "Register" button |
| `src/components/consumption/ConsumptionHistory.tsx` | Table of consumed foods with date and points |
| `src/components/game/HUDOverlay.tsx` | Absolute-positioned React DOM over Phaser canvas: player name, coins, timer |
| `src/components/game/TimerDisplay.tsx` | Countdown display from gameStore.timer |
| `src/components/game/CoinCounter.tsx` | Coin balance from gameStore / profileStore |
| `src/pages/LoginPage.tsx` | Login form centered layout |
| `src/pages/RegisterPage.tsx` | Registration form centered layout |
| `src/pages/DashboardPage.tsx` | Profile list + today's report summary |
| `src/pages/NewProfilePage.tsx` | Create child profile form |
| `src/pages/ProfilePage.tsx` | Child detail: consumption history + food selector + report |
| `src/pages/EditProfilePage.tsx` | Edit child profile form |
| `src/pages/GamePage.tsx` | PhaserGame wrapper + HUDOverlay, manages session lifecycle |
| `public/assets/maps/mundo-1.json` | Hand-crafted Tiled JSON: 50×37.5 tiles (800×600), ground layer + wall collision layer |
| `public/assets/sprites/player.png` | 16×16 colored rectangle (can be generated as data URI initially) |

## Interfaces / Contracts

### TypeScript DTOs (matching backend records)

```typescript
// Auth
interface DatosLoginUsuario { email: string; password: string }
interface DatosRegistroUsuario { nombre: string; email: string; password: string }
interface DatosJWTToken { token: string }
interface DatosRespuestaUsuario { id: number; nombre: string; email: string }

// Profiles
interface DatosRegistroPerfil {
  nombre: string; edadAnios: number; avatarCodigo: string; screenTimeLimit: number
}
interface DatosRespuestaPerfil {
  id: number; nombre: string; edadAnios: number; avatarCodigo: string
  screenTimeLimit: number; monedasSaldo: number
}

// Foods
interface DatosRespuestaAlimento {
  id: number; nombre: string; categoria: string; descripcion: string; puntosReward: number
}

// Consumption
interface DatosRegistroConsumo { perfilId: number; alimentoId: number }
interface DatosRespuestaConsumo {
  id: number; nombreAlimento: string; fechaConsumo: string; puntosReward: number; procesado: boolean
}

// Rewards
interface DatosSaldoRecompensa { perfilId: number; nombrePerfil: string; saldo: number }
interface DatosRespuestaRecompensa {
  id: number; monedasAcreditadas: number; tipo: string; createdAt: string; nombreAlimento: string
}

// Reports
interface DatosResumenDiario {
  perfilId: number; nombrePerfil: string
  alimentosDelDia: string[]; monedasGanadasHoy: number; saldoTotal: number
}

// Session
interface DatosRespuestaSesion {
  id: number; perfilId: number; minutosJugados: number; limitMinutos: number
  minutosRestantes: number; estado: 'ACTIVA' | 'CERRADA' | 'SIN_SESION'
}

// WebSocket
interface DatosMovimientoAvatar { perfilId: number; x: number; y: number; direccion: string }
interface AvatarState { perfilId: number; nombre: string; x: number; y: number; direccion: string }
interface DatosEstadoMapa { timestamp: number; avatares: AvatarState[] }
interface DatosTimerUpdate { minutosRestantes: number; segundosRestantes: number }
interface DatosForceLogout { codigo: string; mensaje: string }
```

### Zustand Store Shapes

```typescript
interface AuthState {
  token: string | null;
  user: DatosRespuestaUsuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface ProfileState {
  profiles: DatosRespuestaPerfil[];
  selectedProfile: DatosRespuestaPerfil | null;
  fetchProfiles: () => Promise<void>;
  selectProfile: (id: number) => void;
  createProfile: (data: DatosRegistroPerfil) => Promise<void>;
  updateProfile: (id: number, data: DatosRegistroPerfil) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
}

interface GameState {
  session: DatosRespuestaSesion | null;
  timer: DatosTimerUpdate;
  players: AvatarState[];
  myPerfilId: number | null;
  setSession: (s: DatosRespuestaSesion) => void;
  updateTimer: (t: DatosTimerUpdate) => void;
  updatePlayers: (avatars: AvatarState[]) => void;
  setMyPerfilId: (id: number) => void;
  reset: () => void;
}
```

### STOMP Client Factory

```typescript
interface StompConnection {
  client: Client;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeMap: (callback: (avatars: AvatarState[]) => void) => void;
  subscribeTimer: (callback: (timer: DatosTimerUpdate) => void) => void;
  subscribeLogout: (callback: (msg: DatosForceLogout) => void) => void;
  publishMovement: (perfilId: number, x: number, y: number, direccion: string) => void;
}
```

## Phaser Game Architecture

### Scene Lifecycle

```
BootScene (preload loading bar graphic)
  ↓ start('Preloader')
PreloaderScene (load tilemap JSON, player sprite, food sprites, audio)
  ↓ start('GameScene')
GameScene (main loop)
  ├── creates tilemap + collision layer
  ├── creates Player sprite (myPerfilId) with cursor-key input
  ├── connects STOMP client, subscribes to /topic/mapa/mundo-1
  ├── on map update → upserts other player sprites, removes disconnected ones
  ├── on timer update → emits EventBus → gameStore
  ├── game state machine: PLAYING → TIME_EXPIRED
  └── on shutdown → disconnects STOMP, cleans up all sprites/timers
```

### GameScene Key Logic

- **Tilemap**: Single 50×37.5 grid (16px tiles = 800×600). Two layers: `ground` (walkable, decorative) and `walls` (collision, `collide: true`).
- **Player**: `Phaser.Physics.Arcade.Sprite` with `setVelocity` based on cursor keys (200px/s diagonal clamped). Direction string (NORTE/SUR/ESTE/OESTE) tracks facing. Position published to `/app/mover` on every frame (throttled to 30 FPS via `this.time.addEvent`).
- **Other players**: Map of `perfilId → Phaser.Physics.Arcade.Sprite`. On each `/topic/mapa/mundo-1` message, update positions via `sprite.setPosition()`. Add sprites for new players, destroy sprites for disconnected ones.
- **Food items**: Static sprites placed at predefined tile positions. Overlap detection: `this.physics.add.overlap(player, foodItems, collectFood)` → emit 'coinEarned' via EventBus, remove food sprite.
- **State machine**: `gameState: 'PLAYING' | 'TIME_EXPIRED'`. On `/user/queue/logout` message → set `TIME_EXPIRED`, disable player input, show "Time's up!" text after 2s delay, then `navigate('/dashboard')`.

### EventBus Bridge Pattern

```typescript
// EventBus.ts
import Phaser from 'phaser';
export const EventBus = new Phaser.Events.EventEmitter();

// PhaserGame.tsx (React)
useEffect(() => {
  const onTimer = (data: DatosTimerUpdate) => gameStore.getState().updateTimer(data);
  EventBus.on('timerUpdate', onTimer);
  return () => { EventBus.off('timerUpdate', onTimer); };
}, []);

// GameScene.ts (Phaser)
// In update loop or STOMP callback:
EventBus.emit('timerUpdate', { minutosRestantes, segundosRestantes });
```

## WebSocket Design

### Connection Lifecycle

1. `GamePage` mounts → starts session via REST → stores session in `gameStore`
2. `PhaserGame` creates `GameScene` → `GameScene.create()` calls `createStompClient(token)`
3. `connect()` resolves → `subscribeMap()`, `subscribeTimer()`, `subscribeLogout()` registered
4. On cursor key movement → `publishMovement()` throttled at 30 FPS
5. On `/user/queue/logout` → disconnect + redirect to `/dashboard`
6. `GameScene.shutdown` event → `disconnect()` STOMP client

### Error Handling Pattern

```typescript
// All API calls follow this pattern:
try {
  const data = await someEndpoint();
  store.setState(data);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) { authStore.getState().logout(); navigate('/login'); }
    else { toast.showError(error.response?.data?.mensaje || 'Error'); }
  }
}
```

## HUD Design

```html
<div class="relative w-[800px] h-[600px] mx-auto">
  <PhaserGame />                           <!-- fills container, pointer-events: auto -->
  <HUDOverlay class="absolute inset-0"     <!-- pointer-events: none -->
    pointer-events-auto on interactive elements>
    <PlayerName />                         <!-- top-left -->
    <CoinCounter />                        <!-- top-right -->
    <TimerDisplay />                       <!-- top-center -->
  </HUDOverlay>
</div>
```

HUD reads from `useGameStore` via Zustand selectors — no re-render storms because only specific slices are subscribed. Timer display updates at most once per second (throttled in Zustand).

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Zustand store actions, API endpoint functions, utility functions | Vitest + React Testing Library for components |
| Integration | Auth flow (login → redirect → dashboard), Profile CRUD flow | Mock API responses, render page components, assert navigation |
| Game | Phaser scene creation/destruction, EventBus bridge | Phaser test utils; verify no memory leaks on unmount |
| Manual | Full game session (start → play → timer expire → redirect) | Deploy to staging, manual browser testing |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. The `deploy.sh` script is a simple sequential build+upload with no user input, no subprocess spawning from the app, and no executable classification risk.

## Migration / Rollout

No migration required. This is a greenfield frontend that does not modify the backend. Deployment is independent: `deploy.sh` pushes static assets to S3, CloudFront serves them. No feature flags needed — the game route can be disabled by removing it from the router if the game is broken.

## Open Questions

- [ ] JWT expiration duration: need to verify `api.security.token.expiration` value in backend config. If < 60 min, either extend or add silent refresh. For MVP hackathon, assume 24h TTL.
- [ ] Avatar codes: what values does `avatarCodigo` accept? Backend validates as a string but no enum constraint visible. Frontend should offer a simple set (e.g., "red", "blue", "green", "yellow") matching sprite generation.
- [ ] Audio assets: confirm if royalty-free placeholder assets are acceptable or if specific audio is needed. For MVP, use Web Audio API to generate simple tones (coin beep, game over jingle).
