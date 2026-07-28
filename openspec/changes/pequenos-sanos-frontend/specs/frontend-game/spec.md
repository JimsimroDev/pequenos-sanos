# frontend-game Specification

## Purpose

Phaser 3 game engine integration: React wrapper, scene lifecycle, tilemap rendering, avatar movement with arcade physics, collectible food items, and game state machine.

## Requirements

### Requirement: GamePage React Component

The system SHALL provide a `GamePage.tsx` that renders a `PhaserGame` wrapper inside an 800×600 container.

#### Scenario: Page mount

- GIVEN a user navigates to `/game/:perfilId`
- WHEN the component mounts
- THEN it starts a game session via `POST /api/v1/sesiones/iniciar/{perfilId}`
- AND renders `PhaserGame` with the session context

#### Scenario: Page unmount

- GIVEN a user navigates away from `/game/:perfilId`
- WHEN the component unmounts
- THEN the Phaser instance is destroyed via `game.destroy(true)`

### Requirement: PhaserGame Wrapper

The system SHALL manage a Phaser `Game` instance lifecycle within a React component using a `div` ref and `useEffect`.

#### Scenario: Game creation

- GIVEN `PhaserGame` is mounted with a `div` ref
- WHEN the `useEffect` fires
- THEN a `Phaser.Game` is created targeting the ref element with 800×600 dimensions and Arcade Physics

#### Scenario: Game cleanup

- GIVEN the Phaser game is running
- WHEN the component unmounts
- THEN `game.destroy(true)` is called and the canvas is removed

### Requirement: EventBus Bridge

The system SHALL provide an `EventBus` (EventEmitter) for Phaser ↔ React communication.

#### Scenario: Phaser emits event to React

- GIVEN Phaser emits a `coins-updated` event on EventBus
- WHEN a React listener is registered
- THEN the React component receives the new coin value and updates Zustand game store

### Requirement: BootScene

The system SHALL display a minimal loading scene with a progress bar while assets load.

#### Scenario: Asset loading

- GIVEN the game starts
- WHEN `BootScene` runs
- THEN it loads essential assets and shows a progress bar
- AND transitions to `StartScene` on completion

### Requirement: StartScene

The system SHALL display a splash screen with the child's name, coin balance, and a play button.

#### Scenario: Start screen displayed

- GIVEN `StartScene` is active
- WHEN it finishes initialization
- THEN it shows the child's name, current coin balance, and an "Empezar a jugar" button
- AND transitioning to `GameScene` when the button is pressed

### Requirement: GameScene Core Gameplay

The system SHALL render a Tiled JSON tilemap with ground and wall layers, the child's avatar sprite, other players, and food items.

#### Scenario: Avatar movement

- GIVEN `GameScene` is active with the avatar loaded
- WHEN the user presses arrow keys
- THEN the avatar moves with Arcade Physics velocity (e.g. 160 px/s)
- AND is constrained by tilemap collision boundaries

#### Scenario: Food item collection

- GIVEN food item sprites are placed on walkable tiles
- WHEN the avatar overlaps a food item
- THEN the food item is collected (removed from scene)
- AND coins-earned count is incremented in the game store

#### Scenario: Game time expired

- GIVEN the session timer reaches 0 (received via WebSocket)
- WHEN `TIME_EXPIRED` event fires
- THEN the scene transitions to `EndScene`

### Requirement: EndScene

The system SHALL display a game-over screen with coins earned and a return button.

#### Scenario: End screen displayed

- GIVEN the game has ended
- WHEN `EndScene` loads
- THEN it shows "¡Tiempo terminado! 🌙", coins earned, and a "Volver al inicio" button
- AND pressing the button navigates back to `/dashboard`

### Requirement: Game State Machine

The system SHALL manage game states as START → PLAYING → TIME_EXPIRED.

#### Scenario: State transitions

- GIVEN the game is in `START` state
- WHEN the player presses play
- THEN state becomes `PLAYING`
- AND when timer expires, state becomes `TIME_EXPIRED`

## TypeScript Types

```typescript
type GameState = 'START' | 'PLAYING' | 'TIME_EXPIRED';
interface GameConfig { perfilId: number; token: string; screenTimeLimit: number; }
```
