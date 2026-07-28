# frontend-websocket Specification

## Purpose

STOMP/SockJS WebSocket client for real-time multiplayer: avatar position broadcasting, session timer subscription, and force-logout handling.

## Requirements

### Requirement: STOMP Client Factory

The system SHALL provide a factory function that creates a `@stomp/stompjs` `Client` with SockJS WebSocket factory and JWT in `connectHeaders`.

#### Scenario: Client creation with JWT

- GIVEN a user has a valid JWT token
- WHEN `createStompClient(token)` is called
- THEN a STOMP `Client` is created targeting `ws://localhost:5002/game` via SockJS
- AND `connectHeaders` includes `Authorization: Bearer {token}`

### Requirement: Timer Subscription

The system SHALL subscribe to `/user/queue/timer` and update the game store with timer state.

#### Scenario: Timer update received

- GIVEN the STOMP client is connected
- WHEN a `{minutosRestantes, segundosRestantes}` message arrives on `/user/queue/timer`
- THEN the game store updates `timeRemaining` to the total seconds
- AND the HUD `TimerDisplay` re-renders with the new countdown

### Requirement: Force Logout Subscription

The system SHALL subscribe to `/user/queue/logout` and handle `TIME_EXPIRED` signals.

#### Scenario: Force logout received

- GIVEN the STOMP client is connected
- WHEN a `{codigo: "TIME_EXPIRED", mensaje: "..."}` message arrives
- THEN the game session ends
- AND the user is redirected to `/dashboard`

### Requirement: Map State Subscription

The system SHALL subscribe to `/topic/mapa/mundo-1` and update other players' positions.

#### Scenario: Other players received

- GIVEN the STOMP client is connected and subscribed
- WHEN a `{timestamp, avatares: [{perfilId, nombre, x, y, direccion}]}` message arrives
- THEN the game store updates `otherPlayers` array
- AND the Phaser scene renders/updates sprites for each remote player

### Requirement: Movement Publishing

The system SHALL send avatar position updates to `/app/mover` when the local player moves.

#### Scenario: Position broadcast

- GIVEN the game is in `PLAYING` state
- WHEN the avatar moves (arrow key press)
- THEN the client sends `{perfilId, x, y, direccion}` to `/app/mover`
- AND sends are throttled to avoid flooding (e.g. max 10 per second)

### Requirement: Reconnection Handling

The system SHALL attempt to reconnect on unexpected disconnection with exponential backoff.

#### Scenario: Connection dropped

- GIVEN the STOMP connection is lost unexpectedly
- WHEN the client detects disconnection
- THEN it attempts to reconnect with increasing delays (1s, 2s, 4s, max 30s)
- AND on successful reconnection, re-subscribes to all destinations

#### Scenario: Max retries exceeded

- GIVEN reconnection attempts have exceeded a configured maximum
- THEN the game session is ended gracefully with a user-facing message

## TypeScript Types

```typescript
interface AvatarPosition { perfilId: number; nombre: string; x: number; y: number; direccion: string; }
interface MapState { timestamp: number; avatares: AvatarPosition[]; }
interface TimerState { minutosRestantes: number; segundosRestantes: number; }
interface ForceLogout { codigo: string; mensaje: string; }
```
