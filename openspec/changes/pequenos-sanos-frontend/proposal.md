# Proposal: pequenos-sanos-frontend

## Intent

Build the complete frontend for "Pequeños Sanos" — a gamified nutrition platform where parents register children, track healthy food consumption, and kids play a Phaser 3 tile-based game earning coins for good nutrition. This is a hackathon submission: fully playable, JWT-authenticated, real-time multiplayer via WebSocket.

## Scope

### In Scope
- Vite + React 18 + TypeScript + TailwindCSS scaffolding (NOT CRA)
- Axios API client with JWT interceptor + 401 redirect
- Auth pages: login, register
- Parent dashboard: child profile CRUD, food registration, consumption history, daily report view
- Phaser 3 game: tilemap, avatar movement (arcade physics), collision boundaries, game states (START → PLAYING → TIME_EXPIRED)
- WebSocket integration: STOMP over SockJS, real-time avatar positions, session timer, force-logout
- HUD overlay: React DOM positioned over Phaser canvas (name, coins, timer)
- Audio: background music loop, coin SFX, game-over jingle
- Zustand stores (auth, profile, game)
- Deploy script (AWS S3 + CloudFront)

### Out of Scope
- Backend modifications
- Complex pixel art (simple colored shapes/sprites acceptable)
- E2E testing, CI/CD pipeline
- Internationalization
- Camera scrolling (game fits one screen: 800x600)
- Token refresh mechanism (verify JWT TTL first)

## Capabilities

### New Capabilities
- `frontend-auth`: Login/register pages, JWT token storage, Axios interceptor for Bearer injection, Zustand auth store, ProtectedRoute wrapper
- `frontend-dashboard`: Parent dashboard with child profile CRUD, food selection and registration, consumption history, daily report view
- `frontend-game`: Phaser 3 game engine integration (PhaserGame wrapper, BootScene → PreloaderScene → GameScene), tilemap loading, avatar movement, arcade physics collision, game state machine
- `frontend-websocket`: STOMP/SockJS client for real-time multiplayer, avatar position broadcasting, session timer subscription, force-logout handling
- `frontend-hud`: React DOM overlay on Phaser canvas displaying player name, coin balance, countdown timer
- `frontend-audio`: Background music, coin collect SFX, game-over jingle

### Modified Capabilities

None — greenfield frontend, no existing specs.

## Approach

**Build order** (each layer is independently verifiable):

1. **Scaffold** — `npm create vite@latest`, add Tailwind, React Router, Zustand, Axios, Phaser, STOMP/SockJS
2. **API + Auth** — Axios instance (`src/api/client.ts`), Zustand auth store, login/register pages, ProtectedRoute
3. **Dashboard** — Profile CRUD, food selection, consumption registration, daily report — standard React pages calling REST endpoints
4. **Game shell** — PhaserGame wrapper component, EventBus bridge, BootScene + PreloaderScene with loading bar
5. **Game core** — GameScene with tilemap (Tiled JSON), avatar sprite with cursor-key movement, collision layer, food item sprites
6. **WebSocket** — STOMP client in GameScene, subscribe to map state + timer, publish movement, handle TIME_EXPIRED
7. **HUD + Audio** — React overlay (name, coins, timer), Zustand gameStore as bridge, audio sprites for BGM/SFX
8. **Deploy** — `deploy.sh` for S3 + CloudFront invalidation

**Key architectural decisions** (from exploration):
- Phaser owns its canvas; React never re-renders inside it
- Communication via EventBus + Zustand stores (Phaser → React)
- HUD is CSS-absolute-positioned React DOM over the `<canvas>`
- WebSocket connects in GameScene, not in React component lifecycle
- Multiple focused Zustand stores prevent cross-domain re-renders

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `pequenos-sanos-frontend/` | New | Entire frontend project — new directory tree |
| `vite.config.ts` | New | Proxy `/api` and `/game` to `localhost:5002` |
| `src/api/client.ts` | New | Axios instance with JWT interceptor |
| `src/game/scenes/GameScene.ts` | New | Core game loop, tilemap, avatar, food items |
| `src/websocket/stompClient.ts` | New | STOMP/SockJS connection factory |
| `deploy.sh` | New | S3 + CloudFront deployment |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Phaser memory leaks on route navigation | High | `game.destroy(true)` in useEffect cleanup; scenes use `shutdown` event for listener cleanup |
| WebSocket 30 FPS broadcast causes jank | Medium | Lightweight sprites for other players; throttle HUD to 1 Hz; lerp position interpolation |
| JWT expires during long game sessions | Medium | Verify backend TTL; if < 60 min, extend or add silent refresh |
| Tilemap design complexity | Medium | Simple 2-layer Tiled map (ground + walls), single-screen, no scrolling |
| Vite proxy misconfiguration | Low | Explicit proxy rules for `/api` and `/game` (ws: true) |

## Rollback Plan

- **No deployment risk**: Frontend is a separate directory, does not touch backend
- **Git rollback**: Single branch, revert commit if needed
- **If game is broken**: Disable `/game` route, dashboard + auth remain functional
- **If WebSocket fails**: Game runs in single-player mode (avatar moves, no multiplayer, timer managed client-side)

## Dependencies

- Backend running on port 5002 with all endpoints verified (see exploration.md)
- Node.js 18+ / npm
- Tiled map editor (one-time asset creation, or hand-craft JSON)
- Audio files (can use royalty-free placeholder assets)

## Success Criteria

- [ ] `npm run dev` starts on port 3000, proxies API/WebSocket to backend
- [ ] User can register, login, see protected dashboard
- [ ] Parent can create/edit/delete child profiles
- [ ] Parent can register food consumption for a child
- [ ] Parent can view daily report (food eaten, coins earned)
- [ ] Child can start a game session → tilemap renders → avatar moves with arrow keys
- [ ] Other players appear on the map in real-time via WebSocket
- [ ] Timer counts down in HUD; game transitions to TIME_EXPIRED when timer hits 0
- [ ] Coins earned in game reflect in dashboard balance
- [ ] `deploy.sh` pushes to S3 and invalidates CloudFront
