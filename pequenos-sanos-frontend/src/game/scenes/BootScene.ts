import Phaser from 'phaser'

/**
 * BootScene — loads all assets and shows a loading bar before transitioning.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    const { width, height } = this.scale

    // Loading bar background
    const barBg = this.add.rectangle(width / 2, height / 2, 400, 24, 0xdddddd)
    barBg.setOrigin(0.5)

    const bar = this.add.rectangle(width / 2 - 200, height / 2, 0, 24, 0x10b981)
    bar.setOrigin(0, 0.5)

    const title = this.add.text(width / 2, height / 2 - 60, '🌱 Pequeños Sanos', {
      fontSize: '32px',
      color: '#065f46',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const loadingText = this.add.text(width / 2, height / 2 + 40, 'Cargando aventura...', {
      fontSize: '16px',
      color: '#6b7280',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      bar.width = 400 * value
      loadingText.setText(`Cargando... ${Math.floor(value * 100)}%`)
    })

    this.load.on('complete', () => {
      loadingText.setText('¡Listo!')
    })

    // Generate all textures programmatically (no external assets needed)
    this.generateAssets()
  }

  private generateAssets() {
    // All textures are generated in create() via Phaser graphics
    // Just a small delay simulation
    this.load.image('dummy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
  }

  create() {
    this.scene.start('CharacterSelectScene')
  }
}
