import Phaser from 'phaser'
import { gameSocket } from '../../websocket/gameSocket'
import { alimentoService, AlimentoResponse, SUPERPODERS } from '../../api/alimentoService'
import { consumoService } from '../../api/consumoService'
import { pendingConsumos } from '../../api/pendingConsumos'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { soundManager } from '../SoundManager'
import { MapRenderer } from '../map/MapRenderer'
import { MAP_OBSTACLES, MapObstacle } from '../map/MapRenderer'
import { ensurePonyTextures, normalizePonyKey, setPonyAnim, PonyKey, Facing } from '../textures/PonyTextures'
import { ensureFoodTextures, foodTextureKey } from '../textures/FoodTextures'

const TILE = 48
const MAP_COLS = 25
const MAP_ROWS = 20
const PLAYER_SPEED = 160
const PLAYER_ACCEL = 1400
const PLAYER_FRICTION = 10
const FOOD_COUNT = 12
const SUPERPODER_DURATION = 30000

interface FoodSprite {
  container: Phaser.GameObjects.Container
  body: Phaser.GameObjects.Sprite
  alimento: AlimentoResponse
  collected: boolean
  vx: number
  vy: number
  wanderTimer: number
  flee: boolean
}

interface OtherPlayer {
  container: Phaser.GameObjects.Container
  nameTag: Phaser.GameObjects.Text
  perfilId: number
  body: Phaser.GameObjects.Sprite
  detail: Phaser.GameObjects.Sprite
  pony: PonyKey
  lastDir: Facing
  idleTimer?: Phaser.Time.TimerEvent
}

interface SceneData {
  perfilId: number
  nombrePerfil: string
  avatarCodigo: string
  avatarColor: string
  onComplete: (key: string, color: string) => void
}

/** Fixed (screen-space) game objects with the props the info panel animation uses */
interface ScreenObject extends Phaser.GameObjects.GameObject {
  y: number
  setVisible: (visible: boolean) => this
  setAlpha: (alpha: number) => this
}

/**
 * GameScene — main gameplay: avatar movement, food collection, superpowers, multiplayer.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container
  private playerBodySprite!: Phaser.GameObjects.Sprite
  private playerDetailSprite!: Phaser.GameObjects.Sprite
  private playerLabel!: Phaser.GameObjects.Text
  private playerPony: PonyKey = 'TWILIGHT'
  private lastDir: Facing = 'down'
  private velX = 0
  private velY = 0
  private obstacles: MapObstacle[] = MAP_OBSTACLES
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>
  private foods: FoodSprite[] = []
  private otherPlayers: Map<number, OtherPlayer> = new Map()
  private sceneData!: SceneData
  private lastMoveTime = 0
  private lastStepTime = 0
  private activePower: string | null = null
  private powerTimer: Phaser.Time.TimerEvent | null = null
  private powerOverlay!: Phaser.GameObjects.Rectangle
  private powerText!: Phaser.GameObjects.Text
  // Info panel (right-side drawer) — replaces the old centered modal
  private infoPanelBg!: Phaser.GameObjects.Rectangle
  private infoPanelTitle!: Phaser.GameObjects.Text
  private infoPanelBody!: Phaser.GameObjects.Text
  private infoPanelBenefitsBg!: Phaser.GameObjects.Rectangle
  private infoPanelBenefitsText!: Phaser.GameObjects.Text
  private infoPanelEatBtn!: Phaser.GameObjects.Rectangle
  private infoPanelEatBtnText!: Phaser.GameObjects.Text
  private infoPanelCloseBtn!: Phaser.GameObjects.Rectangle
  private infoPanelCloseBtnText!: Phaser.GameObjects.Text
  private infoPanelObjects: ScreenObject[] = []
  private infoPanelAnimObjects: ScreenObject[] = []
  private infoTextObjects: ScreenObject[] = []
  private infoToggleBtn!: Phaser.GameObjects.Rectangle
  private infoToggleBtnText!: Phaser.GameObjects.Text
  private infoToggleKey!: Phaser.Input.Keyboard.Key
  private blurOverlay!: Phaser.GameObjects.RenderTexture
  private blurFallback!: Phaser.GameObjects.Rectangle
  private dialogVisible = false
  private infoPanelHiddenByUser = false
  private lastFood: AlimentoResponse | null = null
  private infoPanelTargetY = 0
  private infoPanelHeight = 0
  private score = 0
  private scoreText!: Phaser.GameObjects.Text
  // Settings / pause
  private settingsBtn!: Phaser.GameObjects.Text
  private muteBtn!: Phaser.GameObjects.Text
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

    // Procedural pony sprites — idempotent, safe if BootScene already ran
    ensurePonyTextures(this)

    // Food sprites (idempotent)
    ensureFoodTextures(this)

    // Spark texture for collect particles (idempotent)
    if (!this.textures.exists('spark')) {
      const g = this.add.graphics()
      g.fillStyle(0xffffff)
      g.fillCircle(4, 4, 4)
      g.generateTexture('spark', 8, 8)
      g.destroy()
    }

    MapRenderer.draw(this)
    MapRenderer.animate(this)
    this.createPlayer()
    this.createControls()
    this.createHUD()
    this.createSettingsUI()
    this.createPowerOverlay()
    this.createInfoPanel()
    this.spawnFoods()
    this.setupWebSocket()

    // Start background music and reset step timer
    soundManager.startMusic()
    this.lastStepTime = 0
  }

  private createPlayer() {
    const cx = (MAP_COLS * TILE) / 2
    const cy = (MAP_ROWS * TILE) / 2
    const colorHex = parseInt(this.sceneData.avatarColor.replace('#', ''), 16)
    this.playerPony = normalizePonyKey(this.sceneData.avatarCodigo)

    // Procedural pony: tintable body layer + fixed-color detail layer (mane, eyes, cutie mark)
    this.playerBodySprite = this.add.sprite(0, -4, 'pony-body-down-0').setTint(colorHex)
    this.playerDetailSprite = this.add.sprite(0, -4, `pony-detail-${this.playerPony}-down-0`)

    this.playerLabel = this.add.text(0, 26, this.sceneData.nombrePerfil, {
      fontSize: '12px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5)

    this.player = this.add.container(cx, cy, [
      this.playerBodySprite, this.playerDetailSprite, this.playerLabel,
    ]).setDepth(5)
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
    // Toggle key for the info panel — 'I' is free (not used for movement)
    this.infoToggleKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.I)

    // Touch/click-to-move: tap anywhere on the map to walk there (arrive steering)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isPaused || this.dialogVisible) return
      // Ignore taps on interactive UI (buttons, panel)
      const hits = this.input.hitTestPointer(pointer)
      if (hits.length > 0) return
      const wp = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      this.targetX = Phaser.Math.Clamp(wp.x, 24, MAP_COLS * TILE - 24)
      this.targetY = Phaser.Math.Clamp(wp.y, 24, MAP_ROWS * TILE - 24)
      this.hasTarget = true
      if (!this.targetMarker) {
        this.targetMarker = this.add.circle(this.targetX, this.targetY, 12, 0xffffff, 0.45).setDepth(4)
        this.tweens.add({ targets: this.targetMarker, scale: 1.7, alpha: 0.15, duration: 650, yoyo: true, repeat: -1 })
      } else {
        this.targetMarker.setPosition(this.targetX, this.targetY).setVisible(true).setAlpha(0.45).setScale(1)
      }
    })
  }

  private createHUD() {
    this.scoreText = this.add.text(16, 16, '🪙 0', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#065f46', strokeThickness: 4,
    }).setScrollFactor(0).setDepth(100)
  }

  /** Creates the settings gear button, mute button and pause overlay */
  private createSettingsUI() {
    // Mute button (left of the gear)
    this.muteBtn = this.add.text(this.scale.width - 60, 16, soundManager.isMuted() ? '🔇' : '🔊', {
      fontSize: '22px',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(110)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const m = soundManager.toggleMute()
        this.muteBtn.setText(m ? '🔇' : '🔊')
        soundManager.playClick()
      })
      .on('pointerover', () => this.muteBtn.setAlpha(0.7))
      .on('pointerout', () => this.muteBtn.setAlpha(1))

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
    ).setScrollFactor(0).setDepth(196).setVisible(false)

    this.powerText = this.add.text(this.scale.width / 2, this.scale.height - 50, '', {
      fontSize: '16px', color: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(197).setOrigin(0.5).setVisible(false)
  }

  /** Builds the right-side info panel drawer (replaces the old centered modal). */
  private createInfoPanel() {
    const W = this.scale.width
    const H = this.scale.height
    const PW = Math.min(380, W * 0.45)
    const PH = H * 0.7
    const px = W - PW / 2
    const cy = H * 0.57
    const top = cy - PH / 2

    // Panel background — anchored to the right edge
    this.infoPanelBg = this.add.rectangle(px, cy, PW, PH, 0x0f172a, 0.95)
      .setStrokeStyle(3, 0x10b981)
      .setScrollFactor(0).setDepth(200).setVisible(false)

    this.infoPanelTitle = this.add.text(px, top + PH * 0.15, '', {
      fontSize: '18px', color: '#34d399', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setVisible(false)

    this.infoPanelBody = this.add.text(px - PW / 2 + 20, top + PH * 0.3, '', {
      fontSize: '13px', color: '#e2e8f0', fontFamily: 'Arial',
      wordWrap: { width: PW - 40 }, align: 'left',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(201).setVisible(false)

    this.infoPanelBenefitsBg = this.add.rectangle(px, top + PH * 0.65, PW - 32, 72, 0x1e3a2f)
      .setScrollFactor(0).setDepth(201).setVisible(false)

    this.infoPanelBenefitsText = this.add.text(px, top + PH * 0.65, '', {
      fontSize: '12px', color: '#86efac', fontFamily: 'Arial',
      wordWrap: { width: PW - 60 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(202).setVisible(false)

    // Eat button — completes the flow (consumption/coins/power are registered on collect)
    this.infoPanelEatBtn = this.add.rectangle(px, top + PH * 0.9, 190, 40, 0x10b981)
      .setStrokeStyle(2, 0x065f46)
      .setScrollFactor(0).setDepth(202).setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.infoPanelEatBtn.setFillStyle(0x059669))
      .on('pointerout', () => this.infoPanelEatBtn.setFillStyle(0x10b981))
      .on('pointerdown', () => this.hideInfoPanel(false))

    this.infoPanelEatBtnText = this.add.text(px, top + PH * 0.9, '✅ ¡Comer!', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203).setVisible(false)

    // Close '×' button — top-right corner of the panel; hides it and remembers the preference
    this.infoPanelCloseBtn = this.add.rectangle(W - 26, top + 24, 32, 32, 0x1e293b)
      .setStrokeStyle(1, 0x475569)
      .setScrollFactor(0).setDepth(202).setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.infoPanelCloseBtn.setFillStyle(0x334155))
      .on('pointerout', () => this.infoPanelCloseBtn.setFillStyle(0x1e293b))
      .on('pointerdown', () => this.hideInfoPanel(true))

    this.infoPanelCloseBtnText = this.add.text(W - 26, top + 24, '×', {
      fontSize: '22px', color: '#cbd5e1', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203).setVisible(false)

    this.infoPanelObjects = [
      this.infoPanelBg, this.infoPanelTitle, this.infoPanelBody,
      this.infoPanelBenefitsBg, this.infoPanelBenefitsText,
      this.infoPanelEatBtn, this.infoPanelEatBtnText,
      this.infoPanelCloseBtn, this.infoPanelCloseBtnText,
    ]
    this.infoPanelAnimObjects = [...this.infoPanelObjects]
    this.infoTextObjects = [
      this.infoPanelTitle, this.infoPanelBody, this.infoPanelBenefitsText,
      this.infoPanelEatBtnText, this.infoPanelCloseBtnText,
    ]

    // Floating '📋 Info' toggle — visible only while the panel is hidden by the player
    this.infoToggleBtn = this.add.rectangle(W - 12, H / 2, 96, 40, 0x0f172a, 0.9)
      .setStrokeStyle(2, 0x334155)
      .setOrigin(1, 0.5)
      .setScrollFactor(0).setDepth(205).setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.infoToggleBtn.setStrokeStyle(2, 0x64748b))
      .on('pointerout', () => this.infoToggleBtn.setStrokeStyle(2, 0x334155))
      .on('pointerdown', () => this.toggleInfoPanel())

    this.infoToggleBtnText = this.add.text(W - 24, H / 2, '📋 Info', {
      fontSize: '13px', color: '#e2e8f0', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(206).setVisible(false)

    // Blur overlay — RenderTexture snapshot of the world, blurred with postFX (WebGL only)
    this.blurOverlay = this.add.renderTexture(0, 0, W, H)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(195).setVisible(false)
    this.blurOverlay.postFX.addBlur(1, 0, 0, 12, 0xffffff, 6)

    // Fallback overlay for non-WebGL renderers: dark translucent fill
    this.blurFallback = this.add.rectangle(W / 2, H / 2, W, H, 0x0f172a, 0.65)
      .setScrollFactor(0).setDepth(195).setVisible(false)

    this.layoutInfoPanel()
  }

  /** (Re)positions the panel based on the current viewport size. */
  private layoutInfoPanel() {
    const W = this.scale.width
    const H = this.scale.height
    const PW = Math.min(380, W * 0.45)
    const PH = H * 0.7
    const px = W - PW / 2
    const cy = H * 0.57
    const top = cy - PH / 2
    const bottom = cy + PH / 2
    const btnW = Math.min(190, PW - 32)

    this.infoPanelTargetY = cy
    this.infoPanelHeight = PH

    this.infoPanelBg.setPosition(px, cy).setSize(PW, PH)
    this.infoPanelCloseBtn.setPosition(W - 26, top + 24)
    this.infoPanelCloseBtnText.setPosition(W - 26, top + 24)
    this.infoPanelTitle.setPosition(px, top + PH * 0.15)
    this.infoPanelTitle.setWordWrapWidth(Math.max(60, PW - 70))

    const bodyX = px - PW / 2 + 20
    const bodyY = top + PH * 0.3
    this.infoPanelBody.setPosition(bodyX, bodyY)
    this.infoPanelBody.setWordWrapWidth(PW - 40)

    // Benefits card sits below the body text, eat button below that
    const benefitsY = Math.min(bodyY + this.infoPanelBody.height + 24, bottom - 120)
    const eatY = benefitsY + 56

    this.infoPanelBenefitsBg.setPosition(px, benefitsY).setSize(PW - 32, 72)
    this.infoPanelBenefitsText.setPosition(px, benefitsY)
    this.infoPanelBenefitsText.setWordWrapWidth(PW - 60)
    this.infoPanelEatBtn.setPosition(px, eatY).setSize(btnW, 40)
    this.infoPanelEatBtnText.setPosition(px, eatY)

    this.infoToggleBtn.setPosition(W - 12, H / 2)
    this.infoToggleBtnText.setPosition(W - 24, H / 2)
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
        const pwr = SUPERPODERS[alimento.categoria as keyof typeof SUPERPODERS]
        const colorHex = parseInt((pwr?.color ?? '#10b981').replace('#', ''), 16)

        const glow = this.add.circle(0, 0, 26, colorHex, 0.22)
        const body = this.add.sprite(0, 0, foodTextureKey(alimento.categoria)).setScale(1.1)
        const label = this.add.text(0, 30, alimento.nombre, {
          fontSize: '10px', color: '#ffffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5)

        const container = this.add.container(x, y, [glow, body, label]).setDepth(5)

        this.tweens.add({ targets: glow, scaleX: 1.35, scaleY: 1.35, alpha: 0.08, duration: 1100, yoyo: true, repeat: -1 })
        this.tweens.add({ targets: container, y: y - 6, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: Math.random() * 700 })
        this.tweens.add({ targets: body, angle: { from: -6, to: 6 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

        // Wander behaviour: small random velocity, changes direction every ~2s
        const ang = Math.random() * Math.PI * 2
        const spd = 12 + Math.random() * 18
        this.foods.push({
          container, body, alimento, collected: false,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          wanderTimer: 1500 + Math.random() * 1500,
          flee: alimento.categoria === 'FRUTA',
        })
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
      // Animate based on the movement delta before tweening to the new position
      const dx = av.x - op.container.x
      const dy = av.y - op.container.y
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        const dir: Facing = Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up')
        op.lastDir = dir
        setPonyAnim(op.body, op.detail, op.pony, dir, true)
        op.idleTimer?.remove()
        op.idleTimer = this.time.delayedCall(180, () => {
          setPonyAnim(op.body, op.detail, op.pony, op.lastDir, false)
        })
      }
      this.tweens.add({ targets: op.container, x: av.x, y: av.y, duration: 100 })
      // Refresh avatar identity (pony or color) if it changed
      const pony = normalizePonyKey(av.avatarCodigo)
      if (pony !== op.pony) {
        op.pony = pony
        setPonyAnim(op.body, op.detail, op.pony, op.lastDir, false)
      }
      op.body.setTint(colorHex)
    } else {
      const pony = normalizePonyKey(av.avatarCodigo)
      const body = this.add.sprite(0, -4, 'pony-body-down-0').setTint(colorHex)
      const detail = this.add.sprite(0, -4, `pony-detail-${pony}-down-0`)
      const nameTag = this.add.text(0, 26, av.nombre, {
        fontSize: '11px', color: '#ffffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5)
      const container = this.add.container(av.x, av.y, [body, detail, nameTag]).setDepth(5)
      this.otherPlayers.set(av.perfilId, {
        container, nameTag, perfilId: av.perfilId, body, detail, pony, lastDir: 'down',
      })
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

    // Flash effect on player (both sprite layers)
    this.tweens.add({
      targets: [this.playerBodySprite, this.playerDetailSprite],
      alpha: 0.3, duration: 100, yoyo: true, repeat: 5,
    })
  }

  private showInfoPanel(alimento: AlimentoResponse, forceShow = false) {
    if (this.dialogVisible) return
    this.lastFood = alimento

    const pwr = SUPERPODERS[alimento.categoria as keyof typeof SUPERPODERS]
    const catColor = pwr?.color ? parseInt(pwr.color.replace('#', ''), 16) : 0x10b981

    // Dynamic banner — food category color
    this.infoPanelBg.setStrokeStyle(3, catColor)
    this.infoPanelTitle.setText(`${this.getFoodEmoji(alimento.categoria)} ${alimento.nombre}`)

    // Varied dialogue — use API descripcion + fun message
    const funMsg = this.getFunMessage(alimento.categoria, alimento.nombre)
    const desc = alimento.descripcion || 'Un alimento muy nutritivo y delicioso.'
    this.infoPanelBody.setText(`${desc}\n\n${funMsg}`)

    // Benefits with category-colored background
    this.infoPanelBenefitsBg.setFillStyle(catColor, 0.2)
    this.infoPanelBenefitsBg.setStrokeStyle(1, catColor)
    this.infoPanelBenefitsText.setText(
      `${pwr?.emoji || '✨'} Superpoder: ${pwr?.nombre || '?'}\n${pwr?.descripcion || ''}`
    )

    // Category-colored eat button
    this.infoPanelEatBtn.setFillStyle(catColor)
    this.infoPanelEatBtn.setStrokeStyle(2, 0x000000, 0.2)

    // Sound
    soundManager.playCollect()

    // Respect the player's manual-hide preference: refresh content but keep it hidden
    if (this.infoPanelHiddenByUser && !forceShow) return

    this.infoPanelHiddenByUser = false
    this.dialogVisible = true

    this.layoutInfoPanel()
    // Hide the floating toggle BEFORE capturing, so it never appears ghosted in the blur
    this.infoToggleBtn.setVisible(false)
    this.infoToggleBtnText.setVisible(false)
    this.captureBlurOverlay()
    this.showInfoPanelObjects(true)
    this.animateInfoPanelSlide()
  }

  /** Captures the current view behind the panel: real blur (WebGL) or dark fallback (Canvas). */
  private captureBlurOverlay() {
    const cam = this.cameras.main
    const W = this.scale.width
    const H = this.scale.height

    if (this.renderer.type === Phaser.WEBGL) {
      // Real Gaussian blur via RenderTexture + postFX
      if (this.blurOverlay.width !== W || this.blurOverlay.height !== H) {
        this.blurOverlay.resize(W, H)
      }
      // Keep the overlay invisible while drawing so it is not captured into itself
      this.blurOverlay.setVisible(false)
      this.blurOverlay.camera.setScroll(cam.scrollX, cam.scrollY)
      this.blurOverlay.clear()
      this.blurOverlay.draw(this.children, 0, 0)
      this.blurOverlay.setVisible(true).setAlpha(0)
      this.tweens.add({ targets: this.blurOverlay, alpha: 1, duration: 250 })
      this.blurFallback.setVisible(false)
      this.infoPanelBg.setFillStyle(0x0f172a, 0.95)
    } else {
      // Fallback: postFX is WebGL-only, so darken the screen instead
      this.blurFallback.setPosition(W / 2, H / 2).setSize(W, H)
      this.blurFallback.setVisible(true).setAlpha(0)
      this.tweens.add({ targets: this.blurFallback, alpha: 0.65, duration: 250 })
      this.blurOverlay.setVisible(false)
      this.infoPanelBg.setFillStyle(0x0f172a, 0.85)
    }
  }

  /** Slides the panel up from the bottom edge with ease, then fades the text in. */
  private animateInfoPanelSlide() {
    // Distance each object must travel: from below the screen to its layout position.
    // The layout Y positions differ per object, so we shift them down by `offset` and
    // then tween back up with a RELATIVE '-=' value that preserves every object's offset.
    const offset = this.scale.height + this.infoPanelHeight - this.infoPanelTargetY

    this.infoPanelAnimObjects.forEach(o => { o.y += offset })
    this.infoTextObjects.forEach(o => o.setAlpha(0))

    this.tweens.add({
      targets: this.infoPanelAnimObjects,
      y: `-=${offset}`,
      duration: 350,
      ease: 'Back.easeOut',
    })
    this.tweens.add({
      targets: this.infoTextObjects,
      alpha: 1,
      delay: 350,
      duration: 300,
    })
  }

  private showInfoPanelObjects(visible: boolean) {
    this.infoPanelObjects.forEach(o => o.setVisible(visible))
  }

  private hideInfoPanel(userInitiated: boolean) {
    if (!this.dialogVisible && !userInitiated) return
    this.dialogVisible = false
    if (userInitiated) this.infoPanelHiddenByUser = true

    this.showInfoPanelObjects(false)
    this.blurOverlay.setVisible(false)
    this.blurFallback.setVisible(false)

    if (this.infoPanelHiddenByUser) {
      this.layoutInfoPanel()
      this.infoToggleBtn.setVisible(true)
      this.infoToggleBtnText.setVisible(true)
    }
    soundManager.playClick()
  }

  /** Toggles the panel: hides it if visible, re-shows the last food if hidden by the player. */
  private toggleInfoPanel() {
    if (this.dialogVisible) {
      this.hideInfoPanel(true)
    } else if (this.infoPanelHiddenByUser && this.lastFood) {
      this.showInfoPanel(this.lastFood, true)
    }
  }

  private async collectFood(food: FoodSprite) {
    if (food.collected || this.dialogVisible) return
    food.collected = true

    // Immediately notify all other clients via WebSocket
    gameSocket.sendAlimentoComido(food.alimento.id, this.sceneData.perfilId, this.sceneData.nombrePerfil)

    // Munch sound + collect animation
    soundManager.playMunch()

    // Juice: squash & stretch before fly-off
    this.tweens.add({ targets: food.container, scaleX: 1.35, scaleY: 0.6, duration: 70, yoyo: true })

    // Juice: spark burst in the food's category color
    const pwr = SUPERPODERS[food.alimento.categoria as keyof typeof SUPERPODERS]
    const colorHex = parseInt((pwr?.color ?? '#10b981').replace('#', ''), 16)
    const burst = this.add.particles(food.container.x, food.container.y, 'spark', {
      speed: { min: 90, max: 240 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.3, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 520,
      quantity: 20,
      tint: colorHex,
      gravityY: 140,
      emitting: false,
    })
    burst.explode(20)
    this.time.delayedCall(620, () => burst.destroy())

    // Juice: floating score popup
    const popup = this.add.text(food.container.x, food.container.y - 24,
      `+${food.alimento.puntosReward} 🪙`, {
        fontSize: '16px', color: '#fbbf24', fontFamily: 'Arial', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(150)
    this.tweens.add({
      targets: popup, y: popup.y - 56, alpha: 0, duration: 900, ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy(),
    })

    // Juice: subtle screen shake
    this.cameras.main.shake(110, 0.003)

    this.tweens.add({ targets: food.container, y: food.container.y - 60, alpha: 0, duration: 500,
      onComplete: () => food.container.destroy() })

    // Score
    this.score += food.alimento.puntosReward
    this.scoreText.setText(`🪙 ${this.score}`)
    useGameStore.getState().setSaldo(this.score)

    this.tweens.add({ targets: this.scoreText, scaleX: 1.4, scaleY: 1.4, duration: 150, yoyo: true })

    // Show info panel then register with backend
    this.showInfoPanel(food.alimento)
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
      const colorHex = parseInt((pwr?.color ?? '#10b981').replace('#', ''), 16)

      const glow = this.add.circle(0, 0, 26, colorHex, 0.22)
      const body = this.add.sprite(0, 0, foodTextureKey(alimento.categoria)).setScale(1.1)
      const label = this.add.text(0, 30, alimento.nombre, {
        fontSize: '10px', color: '#ffffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5)

      const container = this.add.container(x, y, [glow, body, label]).setDepth(5)
      container.setAlpha(0)
      this.tweens.add({ targets: container, alpha: 1, duration: 400 })
      this.tweens.add({ targets: container, y: y - 6, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      this.tweens.add({ targets: body, angle: { from: -6, to: 6 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

      const ang = Math.random() * Math.PI * 2
      const spd = 12 + Math.random() * 18
      this.foods.push({
        container, body, alimento, collected: false,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        wanderTimer: 1500 + Math.random() * 1500,
        flee: alimento.categoria === 'FRUTA',
      })
    } catch { /* ignore */ }
  }

  update(_time: number, delta: number) {
    if (this.isPaused) return // Don't move when settings are open

    // Toggle the info panel (I key) — independent of movement
    if (Phaser.Input.Keyboard.JustDown(this.infoToggleKey)) this.toggleInfoPanel()

    const speed = this.activePower === 'FRUTA' ? PLAYER_SPEED * 1.6 : PLAYER_SPEED
    const kbX = (this.cursors.right.isDown || this.wasd.right.isDown ? 1 : 0) - (this.cursors.left.isDown || this.wasd.left.isDown ? 1 : 0)
    const kbY = (this.cursors.down.isDown || this.wasd.down.isDown ? 1 : 0) - (this.cursors.up.isDown || this.wasd.up.isDown ? 1 : 0)

    // Keyboard input cancels any touch target
    if (kbX !== 0 || kbY !== 0) {
      this.hasTarget = false
      if (this.targetMarker) this.targetMarker.setVisible(false)
    }

    let ix = 0, iy = 0
    let dir: Facing = 'idle'

    if (kbX !== 0 || kbY !== 0) {
      ix = kbX; iy = kbY
      const len = Math.hypot(ix, iy)
      if (len > 0) { ix /= len; iy /= len }
      if (ix < 0) dir = 'left'
      else if (ix > 0) dir = 'right'
      else if (iy < 0) dir = 'up'
      else if (iy > 0) dir = 'down'
    } else if (this.hasTarget) {
      const dx = this.targetX - this.player.x
      const dy = this.targetY - this.player.y
      const dist = Math.hypot(dx, dy)
      if (dist < 10) {
        // Arrived — stop
        this.hasTarget = false
        if (this.targetMarker) this.targetMarker.setVisible(false)
        this.velX = 0
        this.velY = 0
      } else {
        const nx = dx / dist
        const ny = dy / dist
        // Arrive steering: slow down near the target
        const slowRadius = 90
        const scale = dist < slowRadius ? dist / slowRadius : 1
        ix = nx * scale
        iy = ny * scale
        if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left'
        else dir = dy > 0 ? 'down' : 'up'
      }
    }

    // Physics model: acceleration + exponential friction + velocity integration
    this.velX += ix * PLAYER_ACCEL * (delta / 1000)
    this.velY += iy * PLAYER_ACCEL * (delta / 1000)
    if (ix === 0) this.velX *= Math.exp(-PLAYER_FRICTION * (delta / 1000))
    if (iy === 0) this.velY *= Math.exp(-PLAYER_FRICTION * (delta / 1000))

    // Clamp to max speed
    const vLen = Math.hypot(this.velX, this.velY)
    if (vLen > speed) {
      this.velX = (this.velX / vLen) * speed
      this.velY = (this.velY / vLen) * speed
    }
    // Kill drift below threshold
    if (Math.abs(this.velX) < 2) this.velX = 0
    if (Math.abs(this.velY) < 2) this.velY = 0

    // Integrate position
    const dt = delta / 1000
    let newX = this.player.x + this.velX * dt
    let newY = this.player.y + this.velY * dt
    const maxX = MAP_COLS * TILE - 24
    const maxY = MAP_ROWS * TILE - 24
    if (newX < 24 || newX > maxX) this.velX = 0
    if (newY < 24 || newY > maxY) this.velY = 0
    newX = Phaser.Math.Clamp(newX, 24, maxX)
    newY = Phaser.Math.Clamp(newY, 24, maxY)

    // Resolve collisions against map obstacles (circle vs rect/circle, 3 passes)
    const beforeX = this.player.x
    const beforeY = this.player.y
    const R = 18
    for (let pass = 0; pass < 3; pass++) {
      for (const o of this.obstacles) {
        if (o.type === 'rect') {
          const rw = o.w ?? 0
          const rh = o.h ?? 0
          const closestX = Phaser.Math.Clamp(newX, o.x, o.x + rw)
          const closestY = Phaser.Math.Clamp(newY, o.y, o.y + rh)
          const dx = newX - closestX
          const dy = newY - closestY
          const distSq = dx * dx + dy * dy
          if (distSq < R * R) {
            if (distSq === 0) {
              const toL = newX - o.x
              const toR = o.x + rw - newX
              const toT = newY - o.y
              const toB = o.y + rh - newY
              const m = Math.min(toL, toR, toT, toB)
              if (m === toL) newX = o.x - R
              else if (m === toR) newX = o.x + rw + R
              else if (m === toT) newY = o.y - R
              else newY = o.y + rh + R
            } else {
              const dist = Math.sqrt(distSq)
              const overlap = R - dist
              newX += (dx / dist) * overlap
              newY += (dy / dist) * overlap
            }
          }
        } else {
          const dx = newX - o.x
          const dy = newY - o.y
          const dist = Math.hypot(dx, dy)
          const minDist = R + (o.r ?? 0)
          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist
            newX += (dx / dist) * overlap
            newY += (dy / dist) * overlap
          } else if (dist === 0) {
            newX += minDist
          }
        }
      }
    }
    // Re-clamp to world after push-out
    newX = Phaser.Math.Clamp(newX, 24, maxX)
    newY = Phaser.Math.Clamp(newY, 24, maxY)

    // Kill velocity on axes where movement was blocked by an obstacle
    if (Math.abs(newX - beforeX) < 0.5 && Math.abs(this.velX) > 0) this.velX = 0
    if (Math.abs(newY - beforeY) < 0.5 && Math.abs(this.velY) > 0) this.velY = 0

    this.player.setPosition(newX, newY)

    // Step sound while moving
    if (dir !== 'idle') {
      const now = Date.now()
      if (now - this.lastStepTime > 350) {
        this.lastStepTime = now
        soundManager.playStep()
      }
    }

    // Walk animation + facing (keeps last direction when idle)
    if (dir !== 'idle') this.lastDir = dir
    setPonyAnim(
      this.playerBodySprite, this.playerDetailSprite, this.playerPony,
      this.lastDir, dir !== 'idle',
    )

    // Send move via WebSocket every 100ms regardless of movement (heartbeat)
    const now = Date.now()
    if (now - this.lastMoveTime > 100) {
      this.lastMoveTime = now
      gameSocket.sendMove(this.sceneData.perfilId, this.sceneData.nombrePerfil, newX, newY, dir)
    }

    // Move foods (wander + flee from player)
    const mapW = MAP_COLS * TILE
    const mapH = MAP_ROWS * TILE
    this.foods.forEach((food) => {
      if (food.collected) return
      // flee if player is close and food is a fruit
      if (food.flee) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, food.container.x, food.container.y)
        if (d < 120 && d > 0) {
          const fx = (food.container.x - this.player.x) / d
          const fy = (food.container.y - this.player.y) / d
          food.vx = fx * 60
          food.vy = fy * 60
        }
      }
      // wander timer
      food.wanderTimer -= delta
      if (food.wanderTimer <= 0) {
        food.wanderTimer = 1500 + Math.random() * 1500
        if (!food.flee || Phaser.Math.Distance.Between(this.player.x, this.player.y, food.container.x, food.container.y) > 120) {
          const ang = Math.random() * Math.PI * 2
          const spd = 12 + Math.random() * 18
          food.vx = Math.cos(ang) * spd
          food.vy = Math.sin(ang) * spd
        }
      }
      // integrate
      food.container.x = Phaser.Math.Clamp(food.container.x + food.vx * (delta / 1000), 60, mapW - 60)
      food.container.y = Phaser.Math.Clamp(food.container.y + food.vy * (delta / 1000), 60, mapH - 60)
      if (food.container.x <= 60 || food.container.x >= mapW - 60) food.vx *= -1
      if (food.container.y <= 60 || food.container.y >= mapH - 60) food.vy *= -1
    })

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
    soundManager.stopMusic()
    gameSocket.disconnect()
  }
}
