import Phaser from 'phaser'

interface EndSceneData {
  score: number
  reason: 'timeout' | 'manual'
  perfilId: number
}

/**
 * EndScene — shown when the session timer expires or player quits.
 * Displays final score and lets the player return to the dashboard.
 */
export class EndScene extends Phaser.Scene {
  private endData!: EndSceneData

  constructor() {
    super({ key: 'EndScene' })
  }

  init(data: EndSceneData) {
    this.endData = data
  }

  create() {
    const { width, height } = this.scale

    // Dark background
    this.add.rectangle(0, 0, width, height, 0x0f172a).setOrigin(0)

    // Stars
    for (let i = 0; i < 60; i++) {
      this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.9)
      )
    }

    const isTimeout = this.endData.reason === 'timeout'

    // Trophy or clock
    this.add.text(width / 2, 100, isTimeout ? '⏰' : '🏆', { fontSize: '72px' }).setOrigin(0.5)

    this.add.text(width / 2, 190, isTimeout ? '¡Tiempo de pantalla completado!' : '¡Sesión terminada!', {
      fontSize: '24px', color: '#f0fdf4', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    if (isTimeout) {
      this.add.text(width / 2, 230, 'Descansa tus ojos y come algo saludable 🥗', {
        fontSize: '16px', color: '#86efac', fontFamily: 'Arial',
      }).setOrigin(0.5)
    }

    // Score display
    const scoreBg = this.add.rectangle(width / 2, 310, 280, 80, 0x1e293b)
    scoreBg.setStrokeStyle(2, 0xf59e0b)
    this.add.text(width / 2, 295, 'Monedas ganadas hoy', {
      fontSize: '13px', color: '#94a3b8', fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.add.text(width / 2, 322, `🪙 ${this.endData.score}`, {
      fontSize: '28px', color: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    // Fun food facts
    const facts = [
      '🍎 Las manzanas tienen vitamina C que fortalece tus defensas',
      '🥦 El brócoli tiene más calcio que la leche',
      '🥕 Las zanahorias mejoran tu visión nocturna',
      '🍌 El plátano te da energía para jugar todo el día',
      '🫐 Los arándanos protegen tu cerebro y memoria',
    ]
    const fact = Phaser.Utils.Array.GetRandom(facts)
    const factBg = this.add.rectangle(width / 2, 420, 460, 60, 0x1e3a2f)
    factBg.setStrokeStyle(1, 0x34d399)
    this.add.text(width / 2, 420, fact, {
      fontSize: '13px', color: '#86efac', fontFamily: 'Arial',
      wordWrap: { width: 440 }, align: 'center',
    }).setOrigin(0.5)

    // Action buttons
    const btnBg = this.add.rectangle(width / 2, height - 80, 240, 48, 0x10b981)
    btnBg.setStrokeStyle(2, 0x065f46)
    btnBg.setInteractive({ useHandCursor: true })
    this.add.text(width / 2, height - 80, '🏠 Volver al panel', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5)

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x059669))
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x10b981))
    btnBg.on('pointerdown', () => {
      // Signal React to navigate to dashboard
      window.dispatchEvent(new CustomEvent('game:exit'))
    })

    // Countdown text
    let countdown = 10
    const cdText = this.add.text(width / 2, height - 40, `Redirigiendo en ${countdown}s...`, {
      fontSize: '12px', color: '#64748b', fontFamily: 'Arial',
    }).setOrigin(0.5)

    this.time.addEvent({
      delay: 1000,
      repeat: countdown - 1,
      callback: () => {
        countdown--
        cdText.setText(countdown > 0 ? `Redirigiendo en ${countdown}s...` : '')
        if (countdown === 0) {
          window.dispatchEvent(new CustomEvent('game:exit'))
        }
      },
    })

    // Bounce-in animation on main elements
    this.tweens.add({
      targets: [scoreBg],
      scaleX: { from: 0, to: 1 },
      scaleY: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    })
  }
}
