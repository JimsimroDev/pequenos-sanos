# Tasks: Pequeños Sanos Frontend

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2800 (greenfield — all new files) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 → PR 6 → PR 7 |
| Delivery strategy | auto-chain |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Scaffold + Types + UI primitives | PR 1 | `npm run dev` starts, renders App | Dev server on port 3000 | Remove `pequenos-sanos-frontend/` dir |
| 2 | Auth flow (API, store, pages, route guard) | PR 2 | `curl -X POST /api/v1/auth/login` returns token; navigate to /dashboard redirects to /login when unauth | Backend on port 5002 + dev server | Remove `src/api/`, `src/stores/authStore.ts`, auth pages |
| 3 | Dashboard (profiles, food, reports) | PR 3 | Create/edit/delete profile via UI; register food; view daily report | Backend + dev server | Remove `src/components/profiles/`, `src/components/consumption/`, dashboard pages |
| 4 | Game shell + core gameplay | PR 4 | Phaser canvas renders tilemap; avatar moves with arrow keys; food collected | Dev server + Phaser canvas visible | Remove `src/game/` dir |
| 5 | WebSocket multiplayer | PR 5 | Open two browsers → both players visible on map; timer counts down | Backend on port 5002 (game session active) | Remove `src/websocket/`, STOMP logic in GameScene |
| 6 | HUD overlay + Audio | PR 6 | HUD shows name/coins/timer over canvas; coin SFX plays on collect | Dev server + Phaser running | Remove `src/components/game/`, audio assets |
| 7 | Deploy script + tilemap asset | PR 7 | `bash deploy.sh` dry-run; `mundo-1.json` loads in game | AWS CLI configured (dry-run) | Remove `deploy.sh`, `public/assets/` |

## Phase 1: Scaffold — Project Setup

- [x] 1.1 Run `npm create vite@latest` with React+TS template in `pequenos-sanos-frontend/`; install deps: react-router-dom, zustand, axios, phaser, @stomp/stompjs, sockjs-client, tailwindcss, postcss, autoprefixer. Configure `vite.config.ts` with React plugin + proxy `/api`→`localhost:5002` + proxy `/game`→`localhost:5002` (ws:true). Files: `package.json`, `vite.config.ts`, `tsconfig.json` — ~60 lines.
- [x] 1.2 Configure TailwindCSS: `tailwind.config.ts` (content paths, game theme colors), `postcss.config.js`, add `@tailwind` directives to `src/index.css`. Files: `tailwind.config.ts`, `postcss.config.js`, `src/index.css` — ~30 lines.
- [x] 1.3 Create TypeScript DTOs matching all backend records. File: `src/types/api.ts` — ~80 lines. Interfaces: DatosLoginUsuario, DatosRegistroUsuario, DatosJWTToken, DatosRespuestaUsuario, DatosRegistroPerfil, DatosRespuestaPerfil, DatosRespuestaAlimento, DatosRegistroConsumo, DatosRespuestaConsumo, DatosSaldoRecompensa, DatosRespuestaRecompensa, DatosResumenDiario, DatosRespuestaSesion, DatosMovimientoAvatar, AvatarState, DatosEstadoMapa, DatosTimerUpdate, DatosForceLogout.
- [x] 1.4 Set up React Router in `src/App.tsx` with routes: `/login`, `/registro`, `/dashboard`, `/perfil/nuevo`, `/perfil/:id`, `/perfil/:id/editar`, `/game/:perfilId`. Entry point `src/main.tsx` renders `<App />`. Files: `src/App.tsx`, `src/main.tsx` — ~50 lines.
- [x] 1.5 Create UI primitive components: `Button` (variants: primary/secondary/danger), `Input` (label + error state), `Card` (container). Files: `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Card.tsx` — ~100 lines.

## Phase 2: Auth — API Client, Store, Pages, Route Guard

- [x] 2.1 Create shared Axios instance with request interceptor (inject `Authorization: Bearer {token}` from localStorage) and response interceptor (401 → clear token → redirect `/login`). File: `src/api/client.ts` — ~40 lines.
- [x] 2.2 Create API endpoint functions: `login()`, `register()`. File: `src/api/endpoints.ts` — ~25 lines. (Extends later in Phase 3.)
- [x] 2.3 Create Zustand auth store: `useAuthStore` with `token`, `user`, `isAuthenticated`, `login(token, user)`, `logout()`. Persist token to localStorage. File: `src/stores/authStore.ts` — ~40 lines.
- [x] 2.4 Create `LoginForm` component: email + password fields, calls `authStore.login()` on submit, shows error on failure. File: `src/components/auth/LoginForm.tsx` — ~50 lines.
- [x] 2.5 Create `RegisterForm` component: name + email + password fields, calls register API, redirects to `/login` on success. File: `src/components/auth/RegisterForm.tsx` — ~50 lines.
- [x] 2.6 Create `ProtectedRoute` wrapper: checks `authStore.isAuthenticated`, redirects to `/login` if not. File: `src/components/layout/ProtectedRoute.tsx` — ~20 lines.
- [x] 2.7 Create `Header` component: nav bar with logo, user name, logout button. File: `src/components/layout/Header.tsx` — ~30 lines.
- [x] 2.8 Create `LoginPage` and `RegisterPage` pages wrapping their forms in centered layouts. Files: `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx` — ~30 lines.
- [x] 2.9 Update `src/App.tsx`: wrap protected routes with `ProtectedRoute`, add `Header` layout. ~15 lines added.

## Phase 3: Dashboard — Profiles, Food, Reports

- [x] 3.1 Extend `src/api/endpoints.ts` with profile CRUD, food listing, consumption, rewards, and report functions. ~60 lines added.
- [x] 3.2 Create Zustand profile store: `useProfileStore` with profiles[], selectedProfile, fetchProfiles, createProfile, updateProfile, deleteProfile. File: `src/stores/profileStore.ts` — ~50 lines.
- [x] 3.3 Create `ProfileCard` component: displays name, age, coins, edit/delete buttons with confirmation. File: `src/components/profiles/ProfileCard.tsx` — ~40 lines.
- [x] 3.4 Create `ProfileForm` component: name, edadAnios (2–4), avatarCodigo, screenTimeLimit (5–60) with inline validation. File: `src/components/profiles/ProfileForm.tsx` — ~50 lines.
- [x] 3.5 Create `ProfileList` component: grid of ProfileCards + "Add Child" button; empty state message. File: `src/components/profiles/ProfileList.tsx` — ~35 lines.
- [x] 3.6 Create `FoodSelector` component: category tabs (FRUTA/VERDURA/PROTEINA/CEREAL), food grid with "Register" button calling consumption API. File: `src/components/consumption/FoodSelector.tsx` — ~50 lines.
- [x] 3.7 Create `ConsumptionHistory` component: table of consumed foods with food name, time, points. File: `src/components/consumption/ConsumptionHistory.tsx` — ~35 lines.
- [x] 3.8 Create dashboard pages: `DashboardPage` (profile list + daily summary), `NewProfilePage`, `ProfilePage` (food selector + history + report), `EditProfilePage`. Files: `src/pages/DashboardPage.tsx`, `src/pages/NewProfilePage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/EditProfilePage.tsx` — ~120 lines.

## Phase 4: Game Shell + Core Gameplay

- [x] 4.1 Create Phaser config: 800×600, Arcade Physics, scenes array. File: `src/game/config.ts` — ~25 lines.
- [x] 4.2 Create `EventBus` typed EventEmitter singleton for Phaser↔React communication. File: `src/game/EventBus.ts` — ~10 lines.
- [x] 4.3 Create `PhaserGame` React wrapper: useEffect creates Phaser.Game on div ref, cleanup calls `game.destroy(true)`. File: `src/game/PhaserGame.tsx` — ~35 lines.
- [x] 4.4 Create `BootScene`: minimal loading bar graphic, transitions to Preloader. File: `src/game/scenes/BootScene.ts` — ~30 lines.
- [x] 4.5 Create `PreloaderScene`: programmatic sprite generation (no external assets), show progress text, transition to StartScene. File: `src/game/scenes/PreloaderScene.ts` — ~100 lines.
- [x] 4.6 Create hand-crafted map data as 2D number array (deviation from Tiled JSON — programmatic generation for hackathon simplicity). 50×38 grid (16px tiles = 800×608), ground layer + wall collision layer. File: `src/game/scenes/mapData.ts` — ~60 lines.
- [x] 4.7 Create `Player` sprite class: Phaser.Physics.Arcade.Sprite, cursor-key velocity (160px/s), direction state (NORTE/SUR/ESTE/OESTE), worldBounds collision. File: `src/game/sprites/Player.ts` — ~50 lines.
- [x] 4.8 Create `FoodItem` sprite class: static position, overlap callback emits 'coinEarned' via EventBus. File: `src/game/sprites/FoodItem.ts` — ~25 lines.
- [x] 4.9 Create `StartScene`: splash screen with child name, coin balance, "Empezar a jugar" button → transitions to GameScene. File: `src/game/scenes/StartScene.ts` — ~80 lines.
- [x] 4.10 Create `GameScene`: tilemap rendering, Player avatar, food item placement, overlap detection, game state machine (PLAYING→TIME_EXPIRED). File: `src/game/scenes/GameScene.ts` — ~190 lines.
- [x] 4.11 Create `GamePage`: starts session via REST, renders PhaserGame + relative container, manages session lifecycle. File: `src/pages/GamePage.tsx` — ~90 lines.

## Phase 5: WebSocket — Multiplayer Integration

- [x] 5.1 Create STOMP client factory: `createStompClient(token)` returns Client with SockJS webSocketFactory, connect/subscribe/disconnect helpers, JWT in connectHeaders. File: `src/websocket/stompClient.ts` — ~70 lines.
- [x] 5.2 Create Zustand game store: `useGameStore` with session, timer, players[], myPerfilId, coinsEarned, setSession, updateTimer, updatePlayers, reset. File: `src/stores/gameStore.ts` — ~40 lines.
- [x] 5.3 Integrate STOMP into GameScene: connect on create(), subscribe to `/topic/mapa/mundo-1` (update other player sprites), `/user/queue/timer` (emit EventBus 'timerUpdate'), `/user/queue/logout` (TIME_EXPIRED → EndScene). Publish movement to `/app/mover` throttled at 30 FPS. ~80 lines added to GameScene.
- [x] 5.4 Create `EndScene`: "¡Tiempo terminado! 🌙", coins earned display, "Volver al inicio" button → navigate('/dashboard'). File: `src/game/scenes/EndScene.ts` — ~40 lines.
- [x] 5.5 Add reconnection handling with exponential backoff (1s→2s→4s→max 30s), max retries → graceful session end. ~30 lines added to stompClient.

## Phase 6: HUD Overlay + Audio

- [x] 6.1 Create `TimerDisplay` component: countdown in MM:SS format from gameStore.timeRemaining. File: `src/components/game/TimerDisplay.tsx` — ~20 lines.
- [x] 6.2 Create `CoinCounter` component: coin balance with 🪙 icon from gameStore.coinsEarned. File: `src/components/game/CoinCounter.tsx` — ~15 lines.
- [x] 6.3 Create `HUDOverlay` component: absolute-positioned React DOM over canvas (pointer-events-none), renders PlayerName + CoinCounter + TimerDisplay. File: `src/components/game/HUDOverlay.tsx` — ~30 lines.
- [x] 6.4 Wire HUD into GamePage: add HUDOverlay as sibling to PhaserGame inside relative 800×600 container. ~15 lines added to GamePage.
- [x] 6.5 Load audio assets in PreloaderScene (bgm loop, coin SFX, game-over jingle) from `public/assets/audio/`. Play BGM in GameScene on PLAYING, coin SFX on food collect, jingle in EndScene. ~40 lines added across PreloaderScene + GameScene + EndScene.
- [x] 6.6 Create placeholder audio files using Web Audio API or royalty-free placeholders. Files: `public/assets/audio/bgm.mp3`, `public/assets/audio/coin.mp3`, `public/assets/audio/gameover.mp3` — asset files, ~0 code lines.

## Phase 7: Deploy + Final Wiring

- [x] 7.1 Create `deploy.sh`: `npm run build` → `aws s3 sync dist/ s3://bucket` → `aws cloudfront create-invalidation`. File: `deploy.sh` — ~20 lines.
- [x] 7.2 Update `src/api/endpoints.ts`: ensure all remaining endpoints (profiles CRUD, food, consumption, rewards, reports, sessions) are implemented. ~40 lines added.
- [x] 7.3 Final integration test: verify full flow — register → login → create profile → register food → view report → start game → play → timer expire → back to dashboard. Manual verification checklist.

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| Total estimated changed lines | ~2800 |
| Number of PRs needed | 7 |
| Chained PRs recommended | Yes |
| Delivery strategy | auto-chain |
| 400-line budget risk | High |

### Risk Assessment per Task

| Task | Risk | Notes |
|------|------|-------|
| 1.1-1.5 (Scaffold) | Low | Standard Vite setup, no integration risk |
| 2.1-2.9 (Auth) | Low | JWT interceptor + Zustand store are straightforward |
| 3.1-3.8 (Dashboard) | Low | Standard React CRUD, all REST endpoints verified |
| 4.1-4.11 (Game shell+core) | High | Phaser integration is the riskiest area; memory leaks on unmount, tilemap JSON correctness |
| 5.1-5.5 (WebSocket) | High | STOMP/SockJS + JWT auth, 30 FPS broadcast handling, reconnection logic |
| 6.1-6.6 (HUD+Audio) | Medium | CSS positioning over canvas; audio asset availability |
| 7.1-7.3 (Deploy) | Low | Simple S3 sync script; final integration is manual verification |
