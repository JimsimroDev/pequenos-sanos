# frontend-audio Specification

## Purpose

Audio layer for the Phaser game: background music loop, coin collect sound effect, and game-over jingle.

## Requirements

### Requirement: Background Music Loop

The system SHALL play a cheerful background music loop during the `PLAYING` game state.

#### Scenario: Music starts on game start

- GIVEN the game transitions from `START` to `PLAYING`
- WHEN `GameScene` becomes active
- THEN the background music starts playing in a continuous loop

#### Scenario: Music stops on game end

- GIVEN the game transitions to `TIME_EXPIRED`
- WHEN `EndScene` loads
- THEN the background music fades out and stops

### Requirement: Coin Collect Sound Effect

The system SHALL play a short sound effect when the avatar collects a food item.

#### Scenario: Coin collected

- GIVEN the avatar overlaps a food item sprite
- WHEN the collection event fires
- THEN the coin collect sound effect plays once
- AND the visual coin increment is visible in the HUD

### Requirement: Game Over Jingle

The system SHALL play a game-over jingle when the session timer expires.

#### Scenario: Timer expired jingle

- GIVEN the session timer reaches 0
- WHEN `EndScene` loads
- THEN the game-over jingle plays once before showing the results

### Requirement: Audio Asset Loading

The system SHALL load all audio assets during `BootScene` and make them available to subsequent scenes.

#### Scenario: Audio loaded before gameplay

- GIVEN `BootScene` is running
- WHEN all audio files are loaded from `public/assets/audio/`
- THEN audio sprites are registered in Phaser's cache
- AND subsequent scenes can call `play()` without loading delays

### Requirement: Audio Mute Toggle (MAY)

The system MAY provide a mute/unmute button on the HUD.

#### Scenario: Mute toggle

- GIVEN audio is playing
- WHEN the user clicks the mute button
- THEN all game audio is silenced
- AND clicking again restores audio
