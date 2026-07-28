# frontend-hud Specification

## Purpose

React DOM overlay positioned over the Phaser canvas, displaying player name, coin balance, and countdown timer. Reads state from Zustand game store.

## Requirements

### Requirement: HUD Overlay Component

The system SHALL render a `HUDOverlay` as a React DOM element positioned absolutely over the 800×600 Phaser canvas container.

#### Scenario: Overlay positioning

- GIVEN the game page renders `PhaserGame` and `HUDOverlay` as siblings inside a `relative` container
- WHEN both mount
- THEN `HUDOverlay` is positioned `absolute inset-0` over the canvas
- AND HUD elements have `pointer-events-none` (except interactive buttons)

### Requirement: Timer Display

The system SHALL display a countdown timer in `MM:SS` format, driven by the WebSocket timer subscription.

#### Scenario: Timer countdown

- GIVEN `timeRemaining` in the game store is 300 (5 minutes)
- WHEN the HUD renders
- THEN the timer displays "05:00"
- AND updates as `timeRemaining` decrements

#### Scenario: Timer expired

- GIVEN `timeRemaining` reaches 0
- THEN the timer displays "00:00"
- AND the game transitions to `TIME_EXPIRED` state

### Requirement: Coin Counter

The system SHALL display the child's current coin balance with a 🪙 icon.

#### Scenario: Coin balance displayed

- GIVEN the child has 15 coins
- WHEN the HUD renders
- THEN it shows "🪙 15"

#### Scenario: Coins earned during game

- GIVEN the child collects a food item worth 5 coins
- WHEN the game store updates `coinsEarned`
- THEN the HUD counter increments to reflect the new balance

### Requirement: Player Name Display

The system SHALL display the child's name on the HUD.

#### Scenario: Name displayed

- GIVEN the child profile has `nombre: "Lucía"`
- WHEN the HUD renders
- THEN "Lucía" is displayed on the overlay

## Component Props

```typescript
interface HUDOverlayProps {
  perfilId: number;
}
interface TimerDisplayProps {
  seconds: number;
}
interface CoinCounterProps {
  coins: number;
}
```

## TypeScript Types

```typescript
interface GameHUDState {
  playerName: string;
  coinsEarned: number;
  timeRemaining: number;
}
```
