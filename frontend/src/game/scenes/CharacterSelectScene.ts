import Phaser from 'phaser'
import { COLORES_AVATARES } from '../../store/gameStore'
import { soundManager } from '../SoundManager'

const PERSONAJES = [
  { key: 'TWILIGHT', emoji: '🦄', nombre: 'Twilight Sparkle', frase: '¡La magia de la amistad y las frutas!', color: '#9333ea' },
  { key: 'RAINBOW', emoji: '🌈', nombre: 'Rainbow Dash', frase: '¡Velocidad y verduras para volar alto!', color: '#2563eb' },
  { key: 'FLUTTERSHY', emoji: '🦋', nombre: 'Fluttershy', frase: 'Las proteínas nos hacen fuertes y suaves', color: '#ec4899' },
  { key: 'PINKIE', emoji: '🎉', nombre: 'Pinkie Pie', frase: '¡Fiestas con cereales y mucha risa!', color: '#db2777' },
]

export interface CharacterSelectData {
  perfilId: number
  nombrePerfil: string
  avatarCodigo: string
  avatarColor: string
  settingsMode?: boolean
  onComplete: (key: string, color: string) => void
}

/**
 * CharacterSelectScene — player picks a character and color before entering the map.
 */
export class CharacterSelectScene extends Phaser.Scene {
  private sceneData!: CharacterSelectData
  private selectedChar = 0
  private selectedColor = 0
  private charCards: Phaser.GameObjects.Container[] = []
  private colorDots: Phaser.GameObjects.Arc[] = []

  constructor() {
    super({ key: 'CharacterSelectScene' })
  }

  init(data: CharacterSelectData) {
    this.sceneData = data
    // Pre-select avatar matching profile
    const idx = PERSONAJES.findIndex((p) => p.key === data.avatarCodigo)
    this.selectedChar = idx >= 0 ? idx : 0
    const colorIdx = COLORES_AVATARES.indexOf(data.avatarColor)
    this.selectedColor = colorIdx >= 0 ? colorIdx : 0
  }

  create() {
    const { width, height } = this.scale
    const bg = this.add.rectangle(0, 0, width, height, 0x0f172a)
    bg.setOrigin(0)

    // Stars background
    for (let i = 0; i < 80; i++) {
      this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.8)
      )
    }

    const isSettings = this.sceneData.settingsMode
    this.add.text(width / 2, 50, isSettings ? '⚙️ Cambiar personaje' : '✨ Elige tu personaje', {
      fontSize: '28px',
      color: '#f0fdf4',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    if (isSettings) {
      this.add.text(width / 2, 85, 'Selecciona un nuevo personaje y color', {
        fontSize: '14px',
        color: '#94a3b8',
        fontFamily: 'Arial',
      }).setOrigin(0.5)
    } else {
      this.add.text(width / 2, 85, `Hola, ${this.sceneData.nombrePerfil}! ¿Quién quieres ser hoy?`, {
        fontSize: '15px',
        color: '#86efac',
        fontFamily: 'Arial',
      }).setOrigin(0.5)
    }

    // Character cards — MLP ponies
    const cardW = 150, cardH = 195
    const startX = width / 2 - ((PERSONAJES.length - 1) * (cardW + 20)) / 2
    this.charCards = PERSONAJES.map((p, i) => {
      const x = startX + i * (cardW + 20)
      const y = height / 2 - 40
      const ponyColor = parseInt(p.color.replace('#', ''), 16)

      const container = this.add.container(x, y)

      const bg = this.add.rectangle(0, 0, cardW, cardH, i === this.selectedChar ? 0x065f46 : 0x1e293b, 1)
      bg.setStrokeStyle(3, i === this.selectedChar ? ponyColor : 0x334155)

      // Colored circle with pony emoji
      const ponyCircle = this.add.circle(0, -50, 28, ponyColor)
      ponyCircle.setStrokeStyle(3, 0xffffff)
      const emojiText = this.add.text(0, -50, p.emoji, { fontSize: '24px' }).setOrigin(0.5)
      const nameText = this.add.text(0, -10, p.nombre, {
        fontSize: '13px', color: '#f0fdf4', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5)
      const fraseText = this.add.text(0, 25, p.frase, {
        fontSize: '10px', color: '#cbd5e1', fontFamily: 'Arial', wordWrap: { width: cardW - 16 }, align: 'center',
      }).setOrigin(0.5)

      container.add([bg, ponyCircle, emojiText, nameText, fraseText])
      container.setSize(cardW, cardH)
      container.setInteractive()
      container.on('pointerdown', () => this.selectChar(i))
      container.on('pointerover', () => { if (i !== this.selectedChar) bg.setFillStyle(0x1f2d3d) })
      container.on('pointerout', () => { if (i !== this.selectedChar) bg.setFillStyle(0x1e293b) })

      return container
    })

    // Color picker
    this.add.text(width / 2, height - 170, '🎨 Elige tu color', {
      fontSize: '18px', color: '#f0fdf4', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    const colorStartX = width / 2 - ((COLORES_AVATARES.length - 1) * 50) / 2
    this.colorDots = COLORES_AVATARES.map((hex, i) => {
      const color = parseInt(hex.replace('#', ''), 16)
      const dot = this.add.circle(colorStartX + i * 50, height - 130, 20, color)
      dot.setStrokeStyle(4, i === this.selectedColor ? 0xffffff : 0x334155)
      dot.setInteractive()
      dot.on('pointerdown', () => this.selectColor(i))
      return dot
    })

    // Play / confirm button
    const btnLabel = isSettings ? '✅ ¡Listo!' : '🎮 ¡Comenzar aventura!'
    const playBtn = this.add.rectangle(width / 2, height - 60, 220, 50, 0x10b981)
    playBtn.setStrokeStyle(2, 0x065f46)
    playBtn.setInteractive({ useHandCursor: true })

    const playText = this.add.text(width / 2, height - 60, btnLabel, {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    playBtn.on('pointerover', () => playBtn.setFillStyle(0x059669))
    playBtn.on('pointerout', () => playBtn.setFillStyle(0x10b981))
    playBtn.on('pointerdown', () => this.startGame())

    this.tweens.add({ targets: [playBtn, playText], y: '-=5', duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
  }

  private selectChar(idx: number) {
    this.selectedChar = idx
    const ponyColor = parseInt(PERSONAJES[idx].color.replace('#', ''), 16)
    this.charCards.forEach((card, i) => {
      const bg = card.list[0] as Phaser.GameObjects.Rectangle
      if (i === idx) {
        bg.setFillStyle(0x065f46)
        bg.setStrokeStyle(3, ponyColor)
        this.tweens.add({ targets: card, scaleX: 1.05, scaleY: 1.05, duration: 150, yoyo: true })
      } else {
        bg.setFillStyle(0x1e293b)
        bg.setStrokeStyle(3, 0x334155)
      }
    })
  }

  private selectColor(idx: number) {
    this.selectedColor = idx
    this.colorDots.forEach((dot, i) => {
      dot.setStrokeStyle(4, i === idx ? 0xffffff : 0x334155)
    })
  }

  private startGame() {
    const char = PERSONAJES[this.selectedChar]
    const color = COLORES_AVATARES[this.selectedColor]
    soundManager.playClick()
    this.sceneData.onComplete(char.key, color)

    if (this.sceneData.settingsMode) {
      // Stop ourselves — GameScene handles the resume
      this.scene.stop()
    } else {
      this.scene.start('GameScene', { ...this.sceneData, avatarCodigo: char.key, avatarColor: color })
    }
  }
}
