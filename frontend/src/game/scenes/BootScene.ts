import Phaser from 'phaser'
import { ensurePonyTextures } from '../textures/PonyTextures'

/**
 * BootScene — splash shown on startup while all procedural character
 * textures and animations are generated. PhaserGame's `ready` handler
 * starts the real first scene (CharacterSelect or Game) with its data.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  create() {
    const { width, height } = this.scale

    this.add.text(width / 2, height / 2 - 20, '🌱 Pequeños Sanos', {
      fontSize: '32px', color: '#34d399', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 30, 'Preparando aventura...', {
      fontSize: '16px', color: '#94a3b8', fontFamily: 'Arial',
    }).setOrigin(0.5)

    // Generate every pony sprite (4 characters x 3 views x 4 frames, body +
    // detail layers) and their walk animations — fully programmatic, no assets.
    ensurePonyTextures(this)
  }
}
