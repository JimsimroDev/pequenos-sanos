import Phaser from 'phaser'
import { useGameStore } from '../../store/gameStore'
import { ensurePonyTextures, normalizePonyKey } from '../textures/PonyTextures'

interface StartSceneData {
  perfilId: number
  nombrePerfil: string
  avatarCodigo: string
  avatarColor: string
  onComplete: (key: string, color: string) => void
}

/**
 * StartScene — splash shown before entering the game when the player
 * already has an avatar. Shows the chosen pony, name, coin balance and
 * a big "Play" button. Spec: openspec frontend-game spec.md (StartScene).
 */
export class StartScene extends Phaser.Scene {
  private sceneData!: StartSceneData

  constructor() {
    super({ key: 'StartScene' })
  }

  init(data: StartSceneData) {
    this.sceneData = data
  }

  create() {
    ensurePonyTextures(this)

    const { width, height } = this.scale
    this.add.rectangle(0, 0, width, height, 0x0f172a).setOrigin(0)

    // Stars
    for (let i = 0; i < 60; i++) {
      this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.7),
      )
    }

    this.add.text(width / 2, 50, '🌱 Pequeños Sanos', {
      fontSize: '28px', color: '#34d399', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    const pony = normalizePonyKey(this.sceneData.avatarCodigo)
    const colorHex = parseInt(this.sceneData.avatarColor.replace('#', ''), 16)
    const body = this.add.sprite(width / 2, height / 2 - 70, 'pony-body-down-0').setTint(colorHex).setScale(2.2)
    const detail = this.add.sprite(width / 2, height / 2 - 70, `pony-detail-${pony}-down-0`).setScale(2.2)
    body.play('pony-body-walk-down')
    detail.play(`pony-detail-walk-${pony}-down`)

    this.add.text(width / 2, height / 2 + 30, this.sceneData.nombrePerfil, {
      fontSize: '22px', color: '#f0fdf4', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    const saldo = useGameStore.getState().saldo
    this.add.text(width / 2, height / 2 + 62, `🪙 ${saldo}`, {
      fontSize: '18px', color: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    // Play button
    const btn = this.add.rectangle(width / 2, height - 70, 220, 52, 0x10b981)
    btn.setStrokeStyle(2, 0x065f46).setInteractive({ useHandCursor: true })
    this.add.text(width / 2, height - 70, '🎮 ¡Jugar!', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    btn.on('pointerover', () => btn.setFillStyle(0x059669))
    btn.on('pointerout', () => btn.setFillStyle(0x10b981))
    btn.on('pointerdown', () => {
      this.scene.start('GameScene', this.sceneData)
    })

    this.tweens.add({ targets: [btn], y: '-=4', duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
  }
}
