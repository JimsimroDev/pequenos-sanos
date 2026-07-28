import Phaser from 'phaser'
import { gameSocket } from '../../websocket/gameSocket'
import { alimentoService, AlimentoResponse, SUPERPODERS } from '../../api/alimentoService'
import { consumoService } from '../../api/consumoService'
import { pendingConsumos } from '../../api/pendingConsumos'
import { useGameStore } from '../../store/gameStore'

const TILE = 48
const MAP_COLS = 25
const MAP_ROWS = 20
const PLAYER_SPEED = 160
const FOOD_COUNT = 12
const SUPERPODER_DURATION = 30000

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
  private tileMap: Phaser.GameObjects.Rectangle[][] = []

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

    this.drawTileMap(mapW, mapH)
    this.createDecorations(mapW, mapH)
    this.createPlayer()
    this.createControls()
    this.createHUD()
    this.createPowerOverlay()
    this.createDialogBox()
    this.spawnFoods()
    this.setupWebSocket()
  }

  private drawTileMap(mapW: number, mapH: number) {
    const TILE_COLORS = [0x86efac, 0x6ee7b7, 0x4ade80, 0xa7f3d0]
    for (let r = 0; r < MAP_ROWS; r++) {
      this.tileMap[r] = []
      for (let c = 0; c < MAP_COLS; c++) {
        const color = TILE_COLORS[(r + c) % TILE_COLORS.length]
        const tile = this.add.rectangle(c * TILE + TILE / 2, r * TILE + TILE / 2, TILE - 1, TILE - 1, color)
        this.tileMap[r][c] = tile
      }
    }
    // Paths (lighter stripes)
    for (let c = 0; c < MAP_COLS; c++) {
      this.add.rectangle(c * TILE + TILE / 2, MAP_ROWS * TILE / 2, TILE - 1, TILE - 1, 0xfef9c3)
    }
    for (let r = 0; r < MAP_ROWS; r++) {
      this.add.rectangle(MAP_COLS * TILE / 2, r * TILE + TILE / 2, TILE - 1, TILE - 1, 0xfef9c3)
    }
  }

  private createDecorations(mapW: number, mapH: number) {
    const treeEmojis = ['🌳', '🌲', '🌴', '🌵']
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(TILE, mapW - TILE)
      const y = Phaser.Math.Between(TILE, mapH - TILE)
      this.add.text(x, y, Phaser.Utils.Array.GetRandom(treeEmojis), { fontSize: '28px' }).setOrigin(0.5)
    }
    // Zone signs
    const zones = [
      { x: 200, y: 150, label: '🍎 Zona Frutas' },
      { x: MAP_COLS * TILE - 200, y: 150, label: '🥦 Zona Verduras' },
      { x: 200, y: MAP_ROWS * TILE - 150, label: '🍗 Zona Proteínas' },
      { x: MAP_COLS * TILE - 200, y: MAP_ROWS * TILE - 150, label: '🌾 Zona Cereales' },
    ]
    zones.forEach(({ x, y, label }) => {
      const bg = this.add.rectangle(x, y, 160, 36, 0xfffbeb, 0.9)
      bg.setStrokeStyle(2, 0xf59e0b)
      this.add.text(x, y, label, { fontSize: '13px', color: '#78350f', fontFamily: 'Arial' }).setOrigin(0.5)
    })
  }

  private createPlayer() {
    const cx = (MAP_COLS * TILE) / 2
    const cy = (MAP_ROWS * TILE) / 2
    const colorHex = parseInt(this.sceneData.avatarColor.replace('#', ''), 16)

    // Avatar emoji based on selected character
    const AVATAR_EMOJIS: Record<string, string> = {
      EXPLORER: '🧭', CHEF: '👨‍🍳', ATHLETE: '🏃', SCIENTIST: '🔬',
      ARTIST: '🎨', SUPERHERO: '🦸',
    }
    const avatarEmoji = AVATAR_EMOJIS[this.sceneData.avatarCodigo] || '😊'

    this.playerBody = this.add.circle(0, 0, 20, colorHex)
    this.playerBody.setStrokeStyle(3, 0xffffff)

    const face = this.add.text(0, -2, avatarEmoji, { fontSize: '20px' }).setOrigin(0.5)
    this.playerLabel = this.add.text(0, 28, this.sceneData.nombrePerfil, {
      fontSize: '12px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5)

    this.player = this.add.container(cx, cy, [this.playerBody, face, this.playerLabel])
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

        const container = this.add.container(x, y, [glow, body, emoji, label])

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
          })
        })
      },
    })
  }

  private upsertOtherPlayer(av: { perfilId: number; nombre: string; x: number; y: number; color: string }) {
    const colorHex = parseInt((av.color || '#3b82f6').replace('#', ''), 16)
    if (this.otherPlayers.has(av.perfilId)) {
      const op = this.otherPlayers.get(av.perfilId)!
      this.tweens.add({ targets: op.container, x: av.x, y: av.y, duration: 100 })
    } else {
      const body = this.add.circle(0, 0, 18, colorHex)
      body.setStrokeStyle(2, 0xffffff)
      const face = this.add.text(0, -2, '😄', { fontSize: '16px' }).setOrigin(0.5)
      const nameTag = this.add.text(0, 24, av.nombre, {
        fontSize: '11px', color: '#ffffff', fontFamily: 'Arial', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5)
      const container = this.add.container(av.x, av.y, [body, face, nameTag])
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

    this.dialogTitleText.setText(`${this.getFoodEmoji(alimento.categoria)} ${alimento.nombre}`)
    this.dialogBodyText.setText(alimento.descripcion || 'Un alimento muy nutritivo y delicioso.')
    this.dialogBenefitsText.setText(
      `${pwr?.emoji || '✨'} Superpoder: ${pwr?.nombre || '?'}\n${pwr?.descripcion || ''}`
    )

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
  }

  private async collectFood(food: FoodSprite) {
    if (food.collected || this.dialogVisible) return
    food.collected = true

    // Immediately notify all other clients via WebSocket
    gameSocket.sendAlimentoComido(food.alimento.id, this.sceneData.perfilId, this.sceneData.nombrePerfil)

    // Collect animation
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

      const container = this.add.container(x, y, [glow, body, emoji, label])
      container.setAlpha(0)
      this.tweens.add({ targets: container, alpha: 1, duration: 400 })
      this.tweens.add({ targets: container, y: y - 8, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      this.foods.push({ container, alimento, collected: false })
    } catch { /* ignore */ }
  }

  update(_time: number, delta: number) {
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
