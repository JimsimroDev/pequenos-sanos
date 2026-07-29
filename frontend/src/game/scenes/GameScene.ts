import Phaser from 'phaser'
import { gameSocket } from '../../websocket/gameSocket'
import { alimentoService, AlimentoResponse, SUPERPODERS } from '../../api/alimentoService'
import { consumoService } from '../../api/consumoService'
import { pendingConsumos } from '../../api/pendingConsumos'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { soundManager } from '../SoundManager'
import { MapRenderer } from '../map/MapRenderer'

const TILE = 48
const MAP_COLS = 25
const MAP_ROWS = 20
const PLAYER_SPEED = 160
const FOOD_COUNT = 12
const SUPERPODER_DURATION = 30000

/** Map avatar codes to their pony emoji and color */
const PONY_EMOJIS: Record<string, string> = {
  TWILIGHT: '🦄', RAINBOW: '🌈', FLUTTERSHY: '🦋', PINKIE: '🎉',
  EXPLORER: '🧭', CHEF: '👨‍🍳', ATHLETE: '🏃', SCIENTIST: '🔬',
}
const PONY_COLORS: Record<string, string> = {
  TWILIGHT: '#9333ea', RAINBOW: '#2563eb', FLUTTERSHY: '#ec4899', PINKIE: '#db2777',
  EXPLORER: '#ef4444', CHEF: '#f59e0b', ATHLETE: '#3b82f6', SCIENTIST: '#10b981',
}

/** Derive a pony emoji from color or avatarCodigo */
function getPonyEmoji(avatarCodigo?: string, color?: string): string {
  if (avatarCodigo && PONY_EMOJIS[avatarCodigo]) return PONY_EMOJIS[avatarCodigo]
  if (color) {
    // Fallback: map color back to pony
    const match = Object.entries(PONY_COLORS).find(([, c]) => c === color)
    if (match) return PONY_EMOJIS[match[0]] || '🦄'
  }
  return '🦄'
}

interface FoodSprite {
  container: Phaser.GameObjects.Container
  alimento: AlimentoResponse
  collected: boolean
}

interface OtherPlayer {
  container: Phaser.GameObjects.Container
  nameTag: Phaser.GameObjects.Text
  perfilId: number
}

interface SceneData {
  perfilId: number
  nombrePerfil: string
  avatarCodigo: string
  avatarColor: string
  onComplete: (key: string, color: string) => void
}

/**
 * GameScene — main gameplay: avatar movement, food collection, superpowers, multiplayer.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container
  private playerBody!: Phaser.GameObjects.Arc
  private playerLabel!: Phaser.GameObjects.Text
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>
  private foods: FoodSprite[] = []
  private otherPlayers: Map<number, OtherPlayer> = new Map()
  private sceneData!: SceneData
  private lastMoveTime = 0
  private activePower: string | null = null
  private powerTimer: Phaser.Time.TimerEvent | null = null
  private powerOverlay!: Phaser.GameObjects.Rectangle
  private powerText!: Phaser.GameObjects.Text
  // Dialog elements as individual fixed objects (not container) to avoid scrollFactor hitbox issues
  private dialogBg!: Phaser.GameObjects.Rectangle
  private dialogTitleText!: Phaser.GameObjects.Text
  private dialogBodyText!: Phaser.GameObjects.Text
  private dialogBenefitsBg!: Phaser.GameObjects.Rectangle
  private dialogBenefitsText!: Phaser.GameObjects.Text
  private dialogCloseBtn!: Phaser.GameObjects.Rectangle
  private dialogCloseBtnText!: Phaser.GameObjects.Text
  private dialogObjects: Phaser.GameObjects.GameObject[] = []
  private dialogVisible = false
  private score = 0
  private scoreText!: Phaser.GameObjects.Text
  // Settings / pause
  private settingsBtn!: Phaser.GameObjects.Text
  private isPaused = false
  private pauseOverlay!: Phaser.GameObjects.Rectangle

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: SceneData) {
    this.sceneData = data
  }

  create() {
    const mapW = MAP_COLS * TILE
    const mapH = MAP_ROWS * TILE
    this.cameras.main.setBounds(0, 0, mapW, mapH)
    this.physics.world.setBounds(0, 0, mapW, mapH)

    MapRenderer.draw(this)
    this.createPlayer()
    this.createControls()
    this.createHUD()
    this.createSettingsUI()
    this.createPowerOverlay()
    this.createDialogBox()
    this.spawnFoods()
    this.setupWebSocket()
  }

  private createPlayer() {
    const cx = (MAP_COLS * TILE) / 2
    const cy = (MAP_ROWS * TILE) / 2
    const colorHex = parseInt(this.sceneData.avatarColor.replace('#', ''), 16)

    // Avatar emoji based on selected MLP pony character
    const avatarEmoji = getPonyEmoji(this.sceneData.avatarCodigo, this.sceneData.avatarColor)

    this.playerBody = this.add.circle(0, 0, 20, colorHex)
    this.playerBody.setStrokeStyle(3, 0xffffff)

    const face = this.add.text(0, -2, avatarEmoji, { fontSize: '20px' }).setOrigin(0.5)
    this.playerLabel = this.add.text(0, 28, this.sceneData.nombrePerfil, {
      fontSize: '12px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5)

    this.player = this.add.container(cx, cy, [this.playerBody, face, this.playerLabel]).setDepth(5)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
  }

  private createControls() {
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
  }

  private createHUD() {
    this.scoreText = this.add.text(16, 16, '🪙 0', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#065f46', strokeThickness: 4,
    }).setScrollFactor(0).setDepth(100)
  }

  /** Creates the settings gear button and pause overlay */
  private createSettingsUI() {
    // Gear button in top-right corner
    this.settingsBtn = this.add.text(this.scale.width - 20, 16, '⚙️', {
      fontSize: '24px',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(110)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.openSettings())
      .on('pointerover', () => this.settingsBtn.setAlpha(0.7))
      .on('pointerout', () => this.settingsBtn.setAlpha(1))

    // Pause overlay — darkens the screen
    this.pauseOverlay = this.add.rectangle(
      this.scale.width / 2, this.scale.height / 2,
      this.scale.width, this.scale.height,
      0x000000, 0
    ).setScrollFactor(0).setDepth(190).setVisible(false)
  }

  /** Opens the character select in settings mode */
  private openSettings() {
    if (this.isPaused) return
    this.isPaused = true

    // Dim overlay with animation
    this.pauseOverlay.setVisible(true).setAlpha(0)
    this.tweens.add({ targets: this.pauseOverlay, alpha: 0.5, duration: 300 })

    // Launch CharacterSelectScene on top
    this.scene.launch('CharacterSelectScene', {
      perfilId: this.sceneData.perfilId,
      nombrePerfil: this.sceneData.nombrePerfil,
      avatarCodigo: this.sceneData.avatarCodigo,
      avatarColor: this.sceneData.avatarColor,
      settingsMode: true,
      onComplete: (key: string, color: string) => {
        this.updateAvatar(key, color)
        this.scene.stop('CharacterSelectScene')
        // Remove dim overlay
        this.tweens.add({
          targets: this.pauseOverlay, alpha: 0, duration: 200,
          onComplete: () => this.pauseOverlay.setVisible(false),
        })
        this.isPaused = false
      },
    })
  }

  /** Updates the local player avatar and broadcasts to other players */
  private updateAvatar(key: string, color: string) {
    // Update scene data
    this.sceneData.avatarCodigo = key
    this.sceneData.avatarColor = color

    // Persist
    useAuthStore.getState().setAvatarCodigo(key)
    useAuthStore.getState().setAvatarColor(color)
    useGameStore.getState().setAvatarColor(color)

    // Recreate player visuals
    const oldX = this.player.x
    const oldY = this.player.y
    this.player.destroy()
    this.createPlayer()
    this.player.setPosition(oldX, oldY)

    // Broadcast avatar change to other players via WS
    gameSocket.sendAvatarChange(this.sceneData.perfilId, key, color)

    soundManager.playClick()
  }

  private createPowerOverlay() {
    this.powerOverlay = this.add.rectangle(
      this.scale.width / 2, this.scale.height - 50, 320, 44, 0x000000, 0.7
    ).setScrollFactor(0).setDepth(100).setVisible(false)

    this.powerText = this.add.text(this.scale.width / 2, this.scale.height - 50, '', {
      fontSize: '16px', color: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(101).setOrigin(0.5).setVisible(false)
  }

  private createDialogBox() {
    const W = this.scale.width
    const H = this.scale.height
    const cx = W / 2
    const cy = H / 2

    // All elements fixed to camera via setScrollFactor(0) — no container
    this.dialogBg = this.add.rectangle(cx, cy, 420, 290, 0x0f172a)
      .setStrokeStyle(3, 0x10b981)
      .setScrollFactor(0).setDepth(200).setVisible(false)

    this.dialogTitleText = this.add.text(cx, cy - 110, '', {
      fontSize: '22px', color: '#34d399', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false)

    this.dialogBodyText = this.add.text(cx, cy - 30, '', {
      fontSize: '13px', color: '#e2e8f0', fontFamily: 'Arial',
      wordWrap: { width: 380 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false)

    this.dialogBenefitsBg = this.add.rectangle(cx, cy + 55, 380, 72, 0x1e3a2f)
      .setScrollFactor(0).setDepth(201).setVisible(false)

    this.dialogBenefitsText = this.add.text(cx, cy + 55, '', {
      fontSize: '12px', color: '#86efac', fontFamily: 'Arial',
      wordWrap: { width: 360 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setVisible(false)

    this.dialogCloseBtn = this.add.rectangle(cx, cy + 115, 160, 38, 0x10b981)
      .setStrokeStyle(2, 0x065f46)
      .setScrollFactor(0).setDepth(202).setVisible(false)
      .setInteractive({ useHandCursor: true })

    this.dialogCloseBtnText = this.add.text(cx, cy + 115, '✅ ¡Comer!', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203).setVisible(false)

    this.dialogCloseBtn.on('pointerover', () => this.dialogCloseBtn.setFillStyle(0x059669))
    this.dialogCloseBtn.on('pointerout', () => this.dialogCloseBtn.setFillStyle(0x10b981))
    this.dialogCloseBtn.on('pointerdown', () => this.closeDialog())

    this.dialogObjects = [
      this.dialogBg, this.dialogTitleText, this.dialogBodyText,
      this.dialogBenefitsBg, this.dialogBenefitsText,
      this.dialogCloseBtn, this.dialogCloseBtnText,
    ]
  }

  private async spawnFoods() {
    try {
      const alimentos = await alimentoService.listar()
      const selected = Phaser.Utils.Array.Shuffle([...alimentos]).slice(0, FOOD_COUNT)
      const mapW = MAP_COLS * TILE
      const mapH = MAP_ROWS * TILE

      selected.forEach((alimento) => {
        const x = Phaser.Math.Between(80, mapW - 80)
        const y = Phaser.Math.Between(80, mapH - 80)
        const pwr = SUPERPODERS[alimento.categoria]
        const colorHex = parseInt(pwr.color.replace('#', ''), 16)

        const glow = this.add.circle(0, 0, 32, colorHex, 0.25)
        const body = this.add.circle(0, 0, 22, colorHex)
        body.setStrokeStyle(2, 0xffffff)
        const emoji = this.add.text(0, -2, this.getFoodEmoji(alimento.categoria), { fontSize: '20px' }).setOrigin(0.5)
        const label = this.add.text(0, 30, alimento.nombre, {
          fontSize: '10px', color: '#ffffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5)

        const container = this.add.container(x, y, [glow, body, emoji, label]).setDepth(5)

        this.tweens.add({ targets: glow, scaleX: 1.3, scaleY: 1.3, alpha: 0.1, duration: 1000, yoyo: true, repeat: -1 })
        this.tweens.add({ targets: container, y: y - 8, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: Math.random() * 600 })

        this.foods.push({ container, alimento, collected: false })
      })
    } catch (e) {
      console.error('Error al cargar alimentos:', e)
    }
  }

  private getFoodEmoji(categoria: string): string {
    const map: Record<string, string> = {
      FRUTA: '🍎', VERDURA: '🥦', PROTEINA: '🍗', CEREAL: '🌾',
    }
    return map[categoria] || '🍽️'
  }

  /** Returns a random fun message based on food category */
  private getFunMessage(categoria: string, nombre: string): string {
    const mensajes: Record<string, string[]> = {
      FRUTA: [
        `${nombre} te da alas para volar! 🕊️`,
        `${nombre} tiene vitamina C para que no te enfermes 💪`,
        `Mmm... ${nombre} es como un caramelo natural 🍬`,
        `Una ${nombre} al día mantiene al doctor en la lejanía 🏥`,
        `${nombre} tiene antioxidantes que cuidan tu corazón ❤️`,
      ],
      VERDURA: [
        `${nombre} te da un escudo verde protector! 🛡️`,
        `Las verduras como ${nombre} te hacen crecer fuerte 🌱`,
        `${nombre} tiene calcio para tus huesos 🦴`,
        `Come ${nombre} y tus músculos te lo agradecerán 💪`,
        `${nombre} tiene fibra para que tu pancita feliz 😊`,
      ],
      PROTEINA: [
        `${nombre} construye tus músculos! 🏋️`,
        `La proteína de ${nombre} te da súper fuerza 💪`,
        `${nombre} te ayuda a crecer alto como un árbol 🌳`,
        `Con ${nombre} tendrás energía para jugar todo el día ⚡`,
        `${nombre} repara tus tejidos y te hace fuerte 🦸`,
      ],
      CEREAL: [
        `${nombre} alimenta tu cerebro! 🧠`,
        `Los carbohidratos de ${nombre} son tu gasolina ⛽`,
        `${nombre} te da energía duradera como una batería 🔋`,
        `Come ${nombre} para pensar más rápido en clase 📚`,
        `${nombre} tiene fibra que limpia tu cuerpo 🧹`,
      ],
    }
    const opts = mensajes[categoria] || [`${nombre} es súper nutritivo! 🌟`]
    return Phaser.Utils.Array.GetRandom(opts)
  }

  private setupWebSocket() {
    // Process incoming map broadcasts
    gameSocket.onMapa((estado) => {
      estado.avatares.forEach((av) => {
        if (av.perfilId === this.sceneData.perfilId) return
        this.upsertOtherPlayer(av)
      })
    })

    // Remove food when another player eats it
    gameSocket.onAlimentoComido((evento) => {
      if (evento.perfilId === this.sceneData.perfilId) return // own event, already handled
      const food = this.foods.find(f => f.alimento.id === evento.alimentoId && !f.collected)
      if (!food) return
      food.collected = true
      // Fly-off animation then destroy
      this.tweens.add({
        targets: food.container,
        y: food.container.y - 80,
        alpha: 0,
        duration: 600,
        onComplete: () => food.container.destroy(),
      })
      // Show a brief toast "Keren comió Manzana"
      const toast = this.add.text(
        food.container.x, food.container.y - 30,
        `${evento.nombre} comió ${food.alimento.nombre}! ✨`,
        { fontSize: '12px', color: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
          stroke: '#000', strokeThickness: 2 }
      ).setOrigin(0.5).setDepth(150)
      this.tweens.add({ targets: toast, y: toast.y - 40, alpha: 0, duration: 1500,
        onComplete: () => toast.destroy() })
      // Respawn a new food after 5 seconds
      this.time.delayedCall(5000, () => this.spawnSingleFood())
    })

    gameSocket.onLogout(() => {
      this.scene.start('EndScene', { score: this.score, reason: 'timeout', perfilId: this.sceneData.perfilId })
    })

    // Poll Zustand store every 200ms as fallback for other players
    this.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        const otros = useGameStore.getState().otrosJugadores
        otros.forEach((av) => {
          if (av.perfilId === this.sceneData.perfilId) return
          this.upsertOtherPlayer({
            perfilId: av.perfilId,
            nombre: av.nombre,
            x: av.x,
            y: av.y,
            color: av.color,
            avatarCodigo: av.avatarCodigo,
          })
        })
      },
    })
  }

  private upsertOtherPlayer(av: { perfilId: number; nombre: string; x: number; y: number; color: string; avatarCodigo?: string }) {
    const colorHex = parseInt((av.color || '#3b82f6').replace('#', ''), 16)
    if (this.otherPlayers.has(av.perfilId)) {
      const op = this.otherPlayers.get(av.perfilId)!
      this.tweens.add({ targets: op.container, x: av.x, y: av.y, duration: 100 })
      // Update avatar emoji if it changed
      const existingFace = op.container.list[1] as Phaser.GameObjects.Text
      if (existingFace && av.avatarCodigo) {
        const newEmoji = getPonyEmoji(av.avatarCodigo, av.color)
        if (existingFace.text !== newEmoji) existingFace.setText(newEmoji)
      }
    } else {
      const body = this.add.circle(0, 0, 18, colorHex)
      body.setStrokeStyle(2, 0xffffff)
      const ponyEmoji = getPonyEmoji(av.avatarCodigo, av.color)
      const face = this.add.text(0, -2, ponyEmoji, { fontSize: '16px' }).setOrigin(0.5)
      const nameTag = this.add.text(0, 24, av.nombre, {
        fontSize: '11px', color: '#ffffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5)
      const container = this.add.container(av.x, av.y, [body, face, nameTag]).setDepth(5)
      this.otherPlayers.set(av.perfilId, { container, nameTag, perfilId: av.perfilId })
    }
  }

  private showPower(categoria: string) {
    const pwr = SUPERPODERS[categoria as keyof typeof SUPERPODERS]
    if (!pwr) return

    this.activePower = categoria
    this.powerOverlay.setVisible(true)
    this.powerText.setText(`${pwr.emoji} ${pwr.nombre} activo! (30s)`).setVisible(true)
    this.powerOverlay.setFillStyle(parseInt(pwr.color.replace('#', ''), 16), 0.4)

    soundManager.playPowerUp()

    if (this.powerTimer) this.powerTimer.remove()
    this.powerTimer = this.time.delayedCall(SUPERPODER_DURATION, () => {
      this.activePower = null
      this.powerOverlay.setVisible(false)
      this.powerText.setVisible(false)
    })

    // Flash effect on player
    this.tweens.add({ targets: this.playerBody, alpha: 0.3, duration: 100, yoyo: true, repeat: 5 })
  }

  private showDialog(alimento: AlimentoResponse) {
    if (this.dialogVisible) return
    this.dialogVisible = true

    const pwr = SUPERPODERS[alimento.categoria as keyof typeof SUPERPODERS]
    const catColor = pwr?.color ? parseInt(pwr.color.replace('#', ''), 16) : 0x10b981

    // Dynamic banner — food category color
    this.dialogBg.setStrokeStyle(3, catColor)
    this.dialogTitleText.setText(`${this.getFoodEmoji(alimento.categoria)} ${alimento.nombre}`)

    // Varied dialogue — use API descripcion + fun message
    const funMsg = this.getFunMessage(alimento.categoria, alimento.nombre)
    const desc = alimento.descripcion || 'Un alimento muy nutritivo y delicioso.'
    this.dialogBodyText.setText(`${desc}\n\n${funMsg}`)

    // Benefits with category-colored background
    this.dialogBenefitsBg.setFillStyle(catColor, 0.2)
    this.dialogBenefitsBg.setStrokeStyle(1, catColor)
    this.dialogBenefitsText.setText(
      `${pwr?.emoji || '✨'} Superpoder: ${pwr?.nombre || '?'}\n${pwr?.descripcion || ''}`
    )

    // Category-colored close button
    this.dialogCloseBtn.setFillStyle(catColor)
    this.dialogCloseBtn.setStrokeStyle(2, 0x000000, 0.2)

    // Sound
    soundManager.playCollect()

    // Show all dialog elements
    this.dialogObjects.forEach(o => (o as Phaser.GameObjects.GameObject & { setVisible: (v: boolean) => void }).setVisible(true))

    // Pop-in animation on the background
    this.dialogBg.setScale(0.85)
    this.tweens.add({
      targets: [this.dialogBg, this.dialogTitleText, this.dialogBodyText,
                this.dialogBenefitsBg, this.dialogBenefitsText,
                this.dialogCloseBtn, this.dialogCloseBtnText],
      alpha: { from: 0, to: 1 },
      duration: 200,
    })
    this.tweens.add({
      targets: this.dialogBg,
      scaleX: 1, scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut',
    })
  }

  private closeDialog() {
    this.dialogVisible = false
    this.dialogObjects.forEach(o => (o as Phaser.GameObjects.GameObject & { setVisible: (v: boolean) => void }).setVisible(false))
    soundManager.playClick()
  }

  private async collectFood(food: FoodSprite) {
    if (food.collected || this.dialogVisible) return
    food.collected = true

    // Immediately notify all other clients via WebSocket
    gameSocket.sendAlimentoComido(food.alimento.id, this.sceneData.perfilId, this.sceneData.nombrePerfil)

    // Munch sound + collect animation
    soundManager.playMunch()
    this.tweens.add({ targets: food.container, y: food.container.y - 60, alpha: 0, duration: 500,
      onComplete: () => food.container.destroy() })

    // Score
    this.score += food.alimento.puntosReward
    this.scoreText.setText(`🪙 ${this.score}`)
    useGameStore.getState().setSaldo(this.score)

    this.tweens.add({ targets: this.scoreText, scaleX: 1.4, scaleY: 1.4, duration: 150, yoyo: true })

    // Show dialog then register with backend
    this.showDialog(food.alimento)
    this.showPower(food.alimento.categoria)

    // Queue the consumption BEFORE the HTTP call so it survives tab close
    pendingConsumos.add(this.sceneData.perfilId, food.alimento.id)

    try {
      await consumoService.registrar({ perfilId: this.sceneData.perfilId, alimentoId: food.alimento.id })
      // Success — remove from pending queue
      pendingConsumos.remove(this.sceneData.perfilId, food.alimento.id)
    } catch (e) {
      console.warn('Error al registrar consumo (quedó en cola para reintento):', e)
    }

    // Respawn a new food after 5 seconds
    this.time.delayedCall(5000, () => this.spawnSingleFood())
  }

  private async spawnSingleFood() {
    try {
      const alimentos = await alimentoService.listar()
      const alimento = Phaser.Utils.Array.GetRandom(alimentos)
      const mapW = MAP_COLS * TILE
      const mapH = MAP_ROWS * TILE
      const x = Phaser.Math.Between(80, mapW - 80)
      const y = Phaser.Math.Between(80, mapH - 80)
      const pwr = SUPERPODERS[alimento.categoria as keyof typeof SUPERPODERS]
      const colorHex = parseInt(pwr.color.replace('#', ''), 16)

      const glow = this.add.circle(0, 0, 32, colorHex, 0.25)
      const body = this.add.circle(0, 0, 22, colorHex)
      body.setStrokeStyle(2, 0xffffff)
      const emoji = this.add.text(0, -2, this.getFoodEmoji(alimento.categoria), { fontSize: '20px' }).setOrigin(0.5)
      const label = this.add.text(0, 30, alimento.nombre, {
        fontSize: '10px', color: '#ffffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5)

      const container = this.add.container(x, y, [glow, body, emoji, label]).setDepth(5)
      container.setAlpha(0)
      this.tweens.add({ targets: container, alpha: 1, duration: 400 })
      this.tweens.add({ targets: container, y: y - 8, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      this.foods.push({ container, alimento, collected: false })
    } catch { /* ignore */ }
  }

  update(_time: number, delta: number) {
    if (this.isPaused) return // Don't move when settings are open

    const speed = this.activePower === 'FRUTA' ? PLAYER_SPEED * 1.6 : PLAYER_SPEED
    let dx = 0, dy = 0
    let dir = 'idle'

    if (this.cursors.left.isDown || this.wasd.left.isDown) { dx = -speed; dir = 'left' }
    else if (this.cursors.right.isDown || this.wasd.right.isDown) { dx = speed; dir = 'right' }

    if (this.cursors.up.isDown || this.wasd.up.isDown) { dy = -speed; dir = 'up' }
    else if (this.cursors.down.isDown || this.wasd.down.isDown) { dy = speed; dir = 'down' }

    const newX = Phaser.Math.Clamp(this.player.x + dx * (delta / 1000), 24, MAP_COLS * TILE - 24)
    const newY = Phaser.Math.Clamp(this.player.y + dy * (delta / 1000), 24, MAP_ROWS * TILE - 24)

    this.player.setPosition(newX, newY)

    // Send move via WebSocket every 100ms regardless of movement (heartbeat)
    const now = Date.now()
    if (now - this.lastMoveTime > 100) {
      this.lastMoveTime = now
      gameSocket.sendMove(this.sceneData.perfilId, this.sceneData.nombrePerfil, newX, newY, dir)
    }

    // Check food collisions
    const COLLECT_RADIUS = 40
    this.foods.forEach((food) => {
      if (food.collected) return
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        food.container.x, food.container.y
      )
      if (dist < COLLECT_RADIUS) {
        this.collectFood(food)
      }
    })
  }

  shutdown() {
    gameSocket.disconnect()
  }
}
