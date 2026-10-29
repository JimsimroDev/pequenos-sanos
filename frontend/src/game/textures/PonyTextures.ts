import Phaser from 'phaser'

/**
 * PonyTextures — procedural sprite factory for the player characters.
 *
 * Each pony is rendered as two stacked layers:
 *  - `pony-body-*`: body, legs, head and shadow drawn in white/greys so
 *    `setTint` applies the kid-chosen color (white × tint = tint, greys
 *    become natural shading, the black shadow stays black).
 *  - `pony-detail-*`: mane, tail, eyes and cutie mark with fixed colors
 *    that give each character its identity.
 *
 * Three views are generated (`down`, `up`, `side`) — `left` reuses `side`
 * with `flipX`. Four frames per view: 0 = idle, 1..3 = walk cycle.
 */

export const PONY_KEYS = ['TWILIGHT', 'RAINBOW', 'FLUTTERSHY', 'PINKIE'] as const
export type PonyKey = (typeof PONY_KEYS)[number]
export type PonyView = 'down' | 'up' | 'side'
export type Facing = 'left' | 'right' | 'up' | 'down' | 'idle'

const FW = 64
const FH = 48
const CX = FW / 2
const CY = 27

interface PonyPalette {
  mane: number
  mane2: number
  mane3?: number
  iris: number
}

const PALETTES: Record<PonyKey, PonyPalette> = {
  TWILIGHT: { mane: 0x4c1d95, mane2: 0xec4899, iris: 0x7c3aed },
  RAINBOW: { mane: 0xef4444, mane2: 0xf59e0b, mane3: 0x3b82f6, iris: 0xdb2777 },
  FLUTTERSHY: { mane: 0xf9a8d4, mane2: 0xf472b6, iris: 0x0d9488 },
  PINKIE: { mane: 0xdb2777, mane2: 0xf472b6, iris: 0x0284c7 },
}

/** Fallback for legacy avatar codes stored before the MLP roster existed. */
export function normalizePonyKey(codigo?: string): PonyKey {
  return (PONY_KEYS as readonly string[]).includes(codigo || '') ? (codigo as PonyKey) : 'TWILIGHT'
}

/**
 * Idempotent texture + walk-animation generation. Cheap after the first call;
 * every scene that renders ponies should call it at the top of `create()`.
 */
export function ensurePonyTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('pony-body-down-0')) return

  const g = scene.add.graphics()
  const views: PonyView[] = ['down', 'up', 'side']

  for (const view of views) {
    for (let f = 0; f < 4; f++) {
      g.clear()
      drawBody(g, view, f)
      g.generateTexture(`pony-body-${view}-${f}`, FW, FH)
    }
  }
  for (const pony of PONY_KEYS) {
    for (const view of views) {
      for (let f = 0; f < 4; f++) {
        g.clear()
        drawDetail(g, pony, view, f)
        g.generateTexture(`pony-detail-${pony}-${view}-${f}`, FW, FH)
      }
    }
  }
  g.destroy()

  for (const view of views) {
    createWalkAnim(scene, `pony-body-walk-${view}`, 'pony-body', view)
  }
  for (const pony of PONY_KEYS) {
    for (const view of views) {
      createWalkAnim(scene, `pony-detail-walk-${pony}-${view}`, `pony-detail-${pony}`, view)
    }
  }
}

function createWalkAnim(scene: Phaser.Scene, key: string, prefix: string, view: PonyView): void {
  if (scene.anims.exists(key)) return
  scene.anims.create({
    key,
    frames: [1, 2, 3, 2].map((f) => ({ key: `${prefix}-${view}-${f}` })),
    frameRate: 8,
    repeat: -1,
  })
}

/**
 * Plays the walk cycle (or shows the idle frame) on both pony layers,
 * flipping horizontally when facing `left`.
 */
export function setPonyAnim(
  body: Phaser.GameObjects.Sprite,
  detail: Phaser.GameObjects.Sprite,
  pony: PonyKey,
  facing: Facing,
  moving: boolean,
): void {
  const view = facingToView(facing)
  const flip = facing === 'left'
  body.setFlipX(flip)
  detail.setFlipX(flip)

  if (moving) {
    body.play(`pony-body-walk-${view}`, true)
    detail.play(`pony-detail-walk-${pony}-${view}`, true)
  } else {
    if (body.anims.isPlaying) body.anims.stop()
    if (detail.anims.isPlaying) detail.anims.stop()
    body.setTexture(`pony-body-${view}-0`)
    detail.setTexture(`pony-detail-${pony}-${view}-0`)
  }
}

function facingToView(facing: Facing): PonyView {
  if (facing === 'left' || facing === 'right') return 'side'
  if (facing === 'idle') return 'down'
  return facing
}

// ---------------------------------------------------------------------------
// Body layer (white/greys — tinted at runtime with the kid-chosen color)
// ---------------------------------------------------------------------------

function drawBody(g: Phaser.GameObjects.Graphics, view: PonyView, frame: number): void {
  // Soft shadow — black multiplied by any tint stays black
  g.fillStyle(0x000000, 0.16)
  g.fillEllipse(CX, 44, 40, 8)

  if (view === 'side') drawBodySide(g, frame)
  else drawBodyFrontBack(g, frame)
}

/** Side view faces RIGHT; `left` is rendered by flipping the sprite. */
function drawBodySide(g: Phaser.GameObjects.Graphics, frame: number): void {
  const bob = frame === 1 || frame === 3 ? -1.5 : 0

  // Legs: diagonal pairs step together (0&2 vs 1&3)
  const legX = [CX - 11, CX - 5, CX + 6, CX + 12]
  for (let i = 0; i < 4; i++) {
    const stepping = (frame === 1 && (i === 0 || i === 2)) || (frame === 3 && (i === 1 || i === 3))
    const lift = stepping ? 3 : 0
    const shift = stepping ? 2.5 : 0
    const far = i === 1 || i === 2
    g.fillStyle(far ? 0xc9c9c9 : 0xffffff)
    g.fillRoundedRect(legX[i] + shift - 3, CY + 6 - lift, 6, 13, 2)
  }

  // Torso + belly shading
  g.fillStyle(0xffffff)
  g.fillEllipse(CX - 2, CY + 1 + bob, 32, 22)
  g.fillStyle(0xe3e3e3)
  g.fillEllipse(CX - 2, CY + 5 + bob, 24, 14)

  // Head + muzzle
  g.fillStyle(0xffffff)
  g.fillCircle(CX + 13, CY - 9 + bob, 10)
  g.fillStyle(0xe3e3e3)
  g.fillEllipse(CX + 20, CY - 4 + bob, 13, 9)

  // Ear
  g.fillStyle(0xffffff)
  g.fillTriangle(CX + 6, CY - 14 + bob, CX + 12, CY - 14 + bob, CX + 9, CY - 22 + bob)
}

function drawBodyFrontBack(g: Phaser.GameObjects.Graphics, frame: number): void {
  const bob = frame === 1 || frame === 3 ? -1.5 : 0
  const liftL = frame === 1 ? 3 : 0
  const liftR = frame === 3 ? 3 : 0

  // Two visible front legs stepping alternately
  g.fillStyle(0xffffff)
  g.fillRoundedRect(CX - 9, CY + 8 - liftL, 6, 13, 2)
  g.fillRoundedRect(CX + 3, CY + 8 - liftR, 6, 13, 2)

  // Torso + belly shading
  g.fillEllipse(CX, CY + 6 + bob, 26, 20)
  g.fillStyle(0xe3e3e3)
  g.fillEllipse(CX, CY + 9 + bob, 18, 12)

  // Head + muzzle
  g.fillStyle(0xffffff)
  g.fillCircle(CX, CY - 8 + bob, 11.5)
  g.fillStyle(0xe3e3e3)
  g.fillEllipse(CX, CY - 2.5 + bob, 11, 8)

  // Ears
  g.fillStyle(0xffffff)
  g.fillTriangle(CX - 11, CY - 14 + bob, CX - 5, CY - 14 + bob, CX - 8, CY - 22 + bob)
  g.fillTriangle(CX + 5, CY - 14 + bob, CX + 11, CY - 14 + bob, CX + 8, CY - 22 + bob)
}

// ---------------------------------------------------------------------------
// Detail layer (fixed colors — mane, tail, eyes, cutie mark)
// ---------------------------------------------------------------------------

function drawDetail(g: Phaser.GameObjects.Graphics, pony: PonyKey, view: PonyView, frame: number): void {
  const pal = PALETTES[pony]
  if (view === 'side') drawDetailSide(g, pony, pal, frame)
  else drawDetailFrontBack(g, pony, pal, frame, view === 'up')
}

function drawDetailSide(g: Phaser.GameObjects.Graphics, pony: PonyKey, pal: PonyPalette, frame: number): void {
  const bob = frame === 1 || frame === 3 ? -1.5 : 0

  // Tail — shrinking circles flowing backwards
  g.fillStyle(pal.mane)
  g.fillCircle(CX - 17, CY - 4, 6)
  g.fillCircle(CX - 21, CY + 3, 5)
  g.fillCircle(CX - 22, CY + 9, 3.5)
  g.fillStyle(pal.mane2)
  g.fillCircle(CX - 19, CY - 1, 2.6)

  // Mane over the head and neck
  g.fillStyle(pal.mane)
  g.fillCircle(CX + 9, CY - 17 + bob, 6)
  g.fillCircle(CX + 15, CY - 18 + bob, 5)
  g.fillCircle(CX + 5, CY - 12 + bob, 4.5)
  g.fillCircle(CX + 3, CY - 6 + bob, 4)
  if (pal.mane3) {
    g.fillStyle(pal.mane2)
    g.fillCircle(CX + 12, CY - 15 + bob, 3.4)
    g.fillStyle(pal.mane3)
    g.fillCircle(CX + 7, CY - 9 + bob, 2.8)
  } else {
    g.fillStyle(pal.mane2)
    g.fillCircle(CX + 12, CY - 14 + bob, 3.2)
  }

  // Inner ear
  g.fillStyle(0xfda4af)
  g.fillTriangle(CX + 7.5, CY - 14.5 + bob, CX + 10.5, CY - 14.5 + bob, CX + 9, CY - 19 + bob)

  // Kawaii eye: white, iris, pupil, sparkle
  g.fillStyle(0xffffff)
  g.fillEllipse(CX + 15.5, CY - 10 + bob, 7.5, 9)
  g.fillStyle(pal.iris)
  g.fillCircle(CX + 16.5, CY - 10 + bob, 2.6)
  g.fillStyle(0x1f2937)
  g.fillCircle(CX + 17, CY - 10 + bob, 1.4)
  g.fillStyle(0xffffff)
  g.fillCircle(CX + 17.8, CY - 11.4 + bob, 0.8)

  // Smile
  g.lineStyle(1.5, 0x000000, 0.35)
  g.beginPath()
  g.arc(CX + 19.5, CY - 3 + bob, 2.6, Phaser.Math.DegToRad(15), Phaser.Math.DegToRad(150))
  g.strokePath()

  drawCutieMark(g, pony, CX - 8, CY - 2)
}

function drawDetailFrontBack(
  g: Phaser.GameObjects.Graphics,
  pony: PonyKey,
  pal: PonyPalette,
  frame: number,
  isBack: boolean,
): void {
  const bob = frame === 1 || frame === 3 ? -1.5 : 0

  // Tail peeking out to one side
  g.fillStyle(pal.mane)
  g.fillCircle(CX + 13, CY + 8, 4.5)
  g.fillCircle(CX + 15, CY + 13, 3.5)

  if (isBack) {
    // Big mane covering the whole head (seen from behind)
    g.fillStyle(pal.mane)
    g.fillCircle(CX, CY - 13 + bob, 7.5)
    g.fillCircle(CX - 6, CY - 9 + bob, 5.5)
    g.fillCircle(CX + 6, CY - 9 + bob, 5.5)
    g.fillCircle(CX, CY - 4 + bob, 4.5)
    g.fillStyle(pal.mane2)
    g.fillCircle(CX + 3, CY - 11 + bob, 3)
    return
  }

  // Mane on top + fringe streak
  g.fillStyle(pal.mane)
  g.fillCircle(CX - 4, CY - 16 + bob, 5.5)
  g.fillCircle(CX + 4, CY - 16 + bob, 5)
  g.fillCircle(CX, CY - 12 + bob, 5)
  g.fillStyle(pal.mane2)
  g.fillCircle(CX + 2, CY - 14 + bob, 2.8)

  // Inner ears
  g.fillStyle(0xfda4af)
  g.fillTriangle(CX - 9.5, CY - 14.5 + bob, CX - 6.5, CY - 14.5 + bob, CX - 8, CY - 19 + bob)
  g.fillTriangle(CX + 6.5, CY - 14.5 + bob, CX + 9.5, CY - 14.5 + bob, CX + 8, CY - 19 + bob)

  // Eyes
  for (const sx of [-1, 1]) {
    g.fillStyle(0xffffff)
    g.fillEllipse(CX + sx * 5, CY - 9 + bob, 6.8, 8.5)
    g.fillStyle(pal.iris)
    g.fillCircle(CX + sx * 5, CY - 9 + bob, 2.4)
    g.fillStyle(0x1f2937)
    g.fillCircle(CX + sx * 5, CY - 9 + bob, 1.3)
    g.fillStyle(0xffffff)
    g.fillCircle(CX + sx * 5 + 0.9, CY - 10.3 + bob, 0.75)
  }

  // Nostrils + smile
  g.fillStyle(0x000000, 0.3)
  g.fillCircle(CX - 2, CY - 2.5 + bob, 0.8)
  g.fillCircle(CX + 2, CY - 2.5 + bob, 0.8)
  g.lineStyle(1.5, 0x000000, 0.35)
  g.beginPath()
  g.arc(CX, CY - 1 + bob, 3, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160))
  g.strokePath()
}

function drawCutieMark(g: Phaser.GameObjects.Graphics, pony: PonyKey, x: number, y: number): void {
  switch (pony) {
    case 'TWILIGHT': {
      drawStar(g, x, y, 5, 4.5, 2, 0xec4899)
      drawStar(g, x + 5, y + 3.5, 4, 2, 1, 0xf9a8d4)
      break
    }
    case 'RAINBOW': {
      // Lightning bolt
      g.fillStyle(0xfbbf24)
      g.fillPoints(
        [
          { x: x + 1, y: y - 5 }, { x: x - 2.5, y: y + 1 },
          { x: x - 0.2, y: y + 1 }, { x: x - 1.5, y: y + 5 },
          { x: x + 2.5, y: y - 0.5 }, { x: x + 0.4, y: y - 0.5 },
        ],
        true,
      )
      break
    }
    case 'FLUTTERSHY': {
      // Butterfly: two wing ellipses + body line
      g.fillStyle(0xf9a8d4)
      g.fillEllipse(x - 2.5, y - 1, 5, 6.5)
      g.fillEllipse(x + 2.5, y + 0.5, 4.5, 5.5)
      g.lineStyle(1.2, 0xbe185d)
      g.lineBetween(x, y - 4, x + 0.5, y + 3)
      break
    }
    case 'PINKIE': {
      // Balloon + string
      g.fillStyle(0x60a5fa)
      g.fillCircle(x, y - 2, 3.6)
      g.fillTriangle(x - 1.5, y + 0.8, x + 1.5, y + 0.8, x, y + 2.6)
      g.lineStyle(1, 0x1e3a8a, 0.7)
      g.lineBetween(x, y + 2.6, x + 1, y + 6)
      break
    }
  }
}

/** Regular star polygon with `points` outer vertices. */
function drawStar(
  g: Phaser.GameObjects.Graphics,
  x: number, y: number,
  points: number, outer: number, inner: number,
  color: number,
): void {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / points) * i - Math.PI / 2
    pts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r })
  }
  g.fillStyle(color)
  g.fillPoints(pts, true)
}
