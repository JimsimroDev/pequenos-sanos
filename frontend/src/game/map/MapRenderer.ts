import Phaser from 'phaser'

// === Color palette ===
const GRASS_BASE    = 0x7ec850
const GRASS_LIGHT   = 0x86efac
const GRASS_MED     = 0x6ab840
const GRASS_DARK    = 0x5ca83a
const DIRT_PATH     = 0xd4a574
const DIRT_DARK     = 0xbf8f5a
const SOIL          = 0x5c3d2e
const POND_BLUE     = 0x4292eb
const POND_DEEP     = 0x2171d5
const FOUNTAIN      = 0x6baaf0
const BARN_RED      = 0xcc3333
const BARN_ROOF     = 0x8b4513
const BARN_DOOR     = 0x5c2e00
const GREENHOUSE    = 0xa8e6a8
const GREEN_FRAME   = 0x228b22
const WOOD          = 0x8b5e3c
const WOOD_DARK     = 0x6b3f1f
const POST          = 0x8b5e3c
const ROOF_TILE     = 0xb85c2e
const STALL_RED     = 0xff5555
const STALL_BLUE    = 0x5599ff
const STALL_GREEN   = 0x55cc55
const STALL_YELLOW  = 0xffcc00
const TRUNK         = 0x6b4226
const CANOPY_1      = 0x2d8a2d
const CANOPY_2      = 0x3da33d
const CANOPY_3      = 0x1e6b1e
const CANOPY_DARK   = 0x145214
const CROP_GREEN    = 0x7dcf4a
const CROP_YELLOW   = 0xdaa520
const BUSH_GREEN    = 0x3cb043
const FLOWER_RED    = 0xff6b6b
const FLOWER_YELLOW = 0xffd93d
const FLOWER_PURPLE = 0xbf7fff
const FLOWER_PINK   = 0xff9ff3
const FLOWER_WHITE  = 0xf0f0f0
const HAY           = 0xead2a5
const STONE_GRAY    = 0x999999
const FENCE_POST_C  = 0x8b7355
const FENCE_RAIL_C  = 0xa0895f
const GRILL_BLACK   = 0x333333

// === Layout constants ===
const MAP_W = 1200, MAP_H = 960
const ZONE_CX = 600, ZONE_CY = 480, PATH_W = 28

// Farm
const BARN_X = 250, BARN_Y = 200, BARN_W = 180, BARN_H = 110
const SILO_X = 400, SILO_Y = 170, SILO_R = 18
const PASTURE_X1 = 70, PASTURE_Y1 = 320, PASTURE_X2 = 330, PASTURE_Y2 = 440
const POND_X = 480, POND_Y = 380, POND_R = 42
const WINDMILL_X = 130, WINDMILL_Y = 150

// Orchard
const GH_X = 900, GH_Y = 200, GH_W = 180, GH_H = 100
const ROW_YS = [290, 335, 380, 425]
const ROW_X1 = 680, ROW_X2 = 1120
const COMPOST_X = 720, COMPOST_Y = 310

// Market
const STALL1_X = 280, STALL1_Y = 700
const STALL2_X = 120, STALL2_Y = 750
const STALL3_X = 420, STALL3_Y = 730
const STALL4_X = 200, STALL4_Y = 860
const SIGN_X = 80, SIGN_Y = 560

// Picnic
const TABLE1_X = 760, TABLE1_Y = 620
const TABLE2_X = 940, TABLE2_Y = 720
const TABLE3_X = 1090, TABLE3_Y = 630
const BBQ_X = 1050, BBQ_Y = 830

// ── Helpers ──

function drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  // Trunk
  g.fillStyle(TRUNK)
  g.fillRect(x - 3, y - size * 0.3, 6, size * 0.3)
  // Canopy (two overlapping circles for organic look)
  g.fillStyle(CANOPY_1)
  g.fillCircle(x - size * 0.15, y - size * 0.5, size * 0.35)
  g.fillCircle(x + size * 0.15, y - size * 0.45, size * 0.32)
  g.fillStyle(CANOPY_2)
  g.fillCircle(x, y - size * 0.55, size * 0.3)
}

function drawBarn(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  const hw = BARN_W / 2, hh = BARN_H / 2
  // Main body
  g.fillStyle(BARN_RED)
  g.fillRect(x - hw, y - hh, BARN_W, BARN_H)
  // Roof triangle
  g.fillStyle(BARN_ROOF)
  g.fillTriangle(x - hw - 10, y - hh, x + hw + 10, y - hh, x, y - hh - 50)
  // Door
  g.fillStyle(BARN_DOOR)
  g.fillRect(x - 18, y + 6, 36, hh - 6)
}

function drawGreenhouse(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  const hw = GH_W / 2, hh = GH_H / 2
  // Glass body
  g.fillStyle(GREENHOUSE)
  g.fillRect(x - hw, y - hh, GH_W, GH_H)
  // Frame
  g.lineStyle(2, GREEN_FRAME)
  g.strokeRect(x - hw, y - hh, GH_W, GH_H)
  // Roof
  g.fillStyle(GREEN_FRAME)
  g.fillTriangle(x - hw - 5, y - hh, x + hw + 5, y - hh, x, y - hh - 35)
  // Window dividers (vertical)
  g.lineBetween(x - hw / 2, y - hh + 8, x - hw / 2, y + hh - 8)
  g.lineBetween(x + hw / 2, y - hh + 8, x + hw / 2, y + hh - 8)
  // Horizontal divider
  g.lineBetween(x - hw + 8, y, x + hw - 8, y)
}

function drawStall(g: Phaser.GameObjects.Graphics, x: number, y: number, awning: number): void {
  // Posts
  g.fillStyle(POST)
  g.fillRect(x - 35, y - 10, 6, 50)
  g.fillRect(x + 29, y - 10, 6, 50)
  // Counter
  g.fillStyle(WOOD)
  g.fillRect(x - 32, y + 10, 64, 12)
  // Awning
  g.fillStyle(awning)
  g.fillTriangle(x - 40, y - 10, x + 40, y - 10, x, y - 40)
  // Awning stripes
  g.lineStyle(2, 0xffffff)
  g.lineBetween(x - 20, y - 10, x - 10, y - 35)
  g.lineBetween(x + 20, y - 10, x + 10, y - 35)
}

function drawPicnicTable(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(WOOD)
  // Table top
  g.fillRect(x - 30, y - 8, 60, 12)
  // Legs
  g.fillStyle(WOOD_DARK)
  g.fillRect(x - 24, y + 4, 6, 16)
  g.fillRect(x + 18, y + 4, 6, 16)
  // Left bench
  g.fillStyle(WOOD)
  g.fillRect(x - 28, y + 22, 24, 6)
  g.fillStyle(WOOD_DARK)
  g.fillRect(x - 24, y + 28, 4, 10)
  g.fillRect(x - 8, y + 28, 4, 10)
  // Right bench
  g.fillStyle(WOOD)
  g.fillRect(x + 4, y + 22, 24, 6)
  g.fillStyle(WOOD_DARK)
  g.fillRect(x + 4, y + 28, 4, 10)
  g.fillRect(x + 20, y + 28, 4, 10)
}

function drawFence(
  g: Phaser.GameObjects.Graphics,
  x1: number, y1: number, x2: number, y2: number
): void {
  const posts = 6
  g.fillStyle(FENCE_POST_C)
  g.lineStyle(3, FENCE_RAIL_C)
  for (let i = 0; i <= posts; i++) {
    const t = i / posts
    const px = x1 + (x2 - x1) * t
    const py = y1 + (y2 - y1) * t
    g.fillRect(px - 3, py - 12, 6, 24)
    // Top rail
    if (i < posts) {
      const nx = x1 + (x2 - x1) * ((i + 1) / posts)
      const ny = y1 + (y2 - y1) * ((i + 1) / posts)
      g.lineBetween(px, py - 8, nx, ny - 8)
      g.lineBetween(px, py + 6, nx, ny + 6)
    }
  }
}

function drawPond(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
  g.fillStyle(POND_BLUE)
  g.fillCircle(x, y, r)
  g.fillStyle(POND_DEEP)
  g.fillCircle(x - r * 0.2, y - r * 0.15, r * 0.55)
  g.fillCircle(x + r * 0.15, y + r * 0.12, r * 0.4)
  // Edge grass
  g.fillStyle(GRASS_DARK)
  for (let a = 0; a < 360; a += 30) {
    const rad = a * (Math.PI / 180)
    const ex = x + Math.cos(rad) * (r + 4)
    const ey = y + Math.sin(rad) * (r + 4)
    g.fillCircle(ex, ey, 5)
  }
}

// ── Main ──

export class MapRenderer {
  /** Single entry point: draws full map across 5 depth layers. */
  static draw(scene: Phaser.Scene): void {
    const g0 = scene.add.graphics()
    MapRenderer.drawBaseGround(g0)
    g0.setDepth(0)

    const g1 = scene.add.graphics()
    MapRenderer.drawTerrain(g1)
    g1.setDepth(1)

    const g2 = scene.add.graphics()
    MapRenderer.drawBuildings(g2)
    g2.setDepth(2)

    const g3 = scene.add.graphics()
    MapRenderer.drawVegetation(g3)
    g3.setDepth(3)

    const g4 = scene.add.graphics()
    MapRenderer.drawFineDecorations(g4)
    g4.setDepth(4)

    MapRenderer.drawLabels(scene)
  }

  // ── Layer 0: Base ground ──
  private static drawBaseGround(g: Phaser.GameObjects.Graphics): void {
    // Solid base
    g.fillStyle(GRASS_BASE)
    g.fillRect(0, 0, MAP_W, MAP_H)
    // Alternating grass texture blocks (48×48 grid)
    // Slightly different greens for visual variety
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 25; c++) {
        const shade = (r + c) % 3
        if (shade === 0) {
          g.fillStyle(GRASS_LIGHT, 0.5)
          g.fillRect(c * 48, r * 48, 46, 46)
        } else if (shade === 1) {
          g.fillStyle(GRASS_MED, 0.3)
          g.fillRect(c * 48, r * 48, 46, 46)
        }
      }
    }
  }

  // ── Layer 1: Paths, water, tilled soil ──
  private static drawTerrain(g: Phaser.GameObjects.Graphics): void {
    // Main horizontal path
    g.fillStyle(DIRT_PATH)
    g.fillRect(0, ZONE_CY - PATH_W / 2, MAP_W, PATH_W)
    // Main vertical path
    g.fillRect(ZONE_CX - PATH_W / 2, 0, PATH_W, MAP_H)
    // Center plaza
    g.fillStyle(DIRT_DARK)
    g.fillCircle(ZONE_CX, ZONE_CY, 50)
    g.fillStyle(FOUNTAIN)
    g.fillCircle(ZONE_CX, ZONE_CY, 30)
    // Farm internal path
    g.fillRect(240, ZONE_CY, 40, 60)
    // Orchard internal path
    g.fillRect(780, ZONE_CY - 40, 50, 40)
    g.fillRect(880, ZONE_CY - 40, 40, 60)
    // Market internal paths
    g.fillRect(200, ZONE_CY, 40, 120)
    g.fillRect(280, 600, 40, 100)
    // Picnic internal paths
    g.fillRect(750, ZONE_CY, 40, 100)
    g.fillRect(940, ZONE_CY, 40, 140)
    // Pond
    drawPond(g, POND_X, POND_Y, POND_R)
    // Tilled soil rows (orchard)
    g.fillStyle(SOIL)
    for (const ry of ROW_YS) {
      g.fillRect(ROW_X1, ry, ROW_X2 - ROW_X1, 28)
    }
  }

  // ── Layer 2: Buildings and structures ──
  private static drawBuildings(g: Phaser.GameObjects.Graphics): void {
    // ── Farm ──
    drawBarn(g, BARN_X, BARN_Y)
    // Silo
    g.fillStyle(ROOF_TILE)
    g.fillRect(SILO_X - SILO_R, SILO_Y, SILO_R * 2, 70)
    g.fillStyle(BARN_ROOF)
    g.fillCircle(SILO_X, SILO_Y, SILO_R)
    g.fillCircle(SILO_X, SILO_Y + 70, SILO_R)
    // Windmill
    g.fillStyle(WOOD_DARK)
    g.fillRect(WINDMILL_X - 4, WINDMILL_Y, 8, 50)           // tower
    g.fillStyle(0xdddddd)
    g.fillCircle(WINDMILL_X, WINDMILL_Y, 14)                 // hub
    g.fillStyle(0xcccccc)
    // Blades: 4 triangles
    for (let i = 0; i < 4; i++) {
      const angle = i * (Math.PI / 2)
      const bx = WINDMILL_X + Math.cos(angle) * 30
      const by = WINDMILL_Y + Math.sin(angle) * 30
      g.fillTriangle(
        WINDMILL_X, WINDMILL_Y,
        bx - Math.sin(angle) * 6, by + Math.cos(angle) * 6,
        bx + Math.sin(angle) * 6, by - Math.cos(angle) * 6
      )
    }
    // Fence corral
    drawFence(g, PASTURE_X1, PASTURE_Y1, PASTURE_X2, PASTURE_Y1)  // top
    drawFence(g, PASTURE_X2, PASTURE_Y1, PASTURE_X2, PASTURE_Y2)  // right
    drawFence(g, PASTURE_X2, PASTURE_Y2, PASTURE_X1, PASTURE_Y2)  // bottom
    drawFence(g, PASTURE_X1, PASTURE_Y2, PASTURE_X1, PASTURE_Y1)  // left

    // ── Orchard ──
    drawGreenhouse(g, GH_X, GH_Y)
    // Compost bin
    g.fillStyle(WOOD_DARK)
    g.fillRect(COMPOST_X - 20, COMPOST_Y - 15, 40, 30)
    g.fillStyle(SOIL)
    g.fillRect(COMPOST_X - 15, COMPOST_Y - 10, 30, 20)

    // ── Market ──
    drawStall(g, STALL1_X, STALL1_Y, STALL_RED)
    drawStall(g, STALL2_X, STALL2_Y, STALL_BLUE)
    drawStall(g, STALL3_X, STALL3_Y, STALL_GREEN)
    drawStall(g, STALL4_X, STALL4_Y, STALL_YELLOW)
    // Market sign
    g.fillStyle(WOOD_DARK)
    g.fillRect(SIGN_X - 30, SIGN_Y - 25, 60, 50)
    g.fillStyle(BARN_ROOF)
    g.fillTriangle(SIGN_X - 35, SIGN_Y - 25, SIGN_X + 35, SIGN_Y - 25, SIGN_X, SIGN_Y - 40)

    // ── Picnic ──
    drawPicnicTable(g, TABLE1_X, TABLE1_Y)
    drawPicnicTable(g, TABLE2_X, TABLE2_Y)
    drawPicnicTable(g, TABLE3_X, TABLE3_Y)
    // BBQ grill
    g.fillStyle(GRILL_BLACK)
    g.fillRect(BBQ_X - 20, BBQ_Y - 10, 40, 20)
    g.fillStyle(0x555555)
    g.fillRect(BBQ_X - 16, BBQ_Y - 6, 32, 3)
    g.fillRect(BBQ_X - 16, BBQ_Y, 32, 3)
    // Legs
    g.fillStyle(WOOD_DARK)
    g.fillRect(BBQ_X - 16, BBQ_Y + 10, 4, 14)
    g.fillRect(BBQ_X + 12, BBQ_Y + 10, 4, 14)
  }

  // ── Layer 3: Vegetation ──
  private static drawVegetation(g: Phaser.GameObjects.Graphics): void {
    // ── Farm trees ──
    drawTree(g, 80, 120, 60)
    drawTree(g, 380, 80, 55)
    drawTree(g, 500, 160, 50)
    // Hay bales
    g.fillStyle(HAY)
    g.fillCircle(160, 360, 12)
    g.fillCircle(190, 358, 14)
    g.fillCircle(175, 375, 13)
    // Pasture bushes
    g.fillStyle(BUSH_GREEN)
    g.fillCircle(250, 350, 10)
    g.fillCircle(270, 355, 8)
    g.fillCircle(300, 340, 11)

    // ── Orchard trees ──
    drawTree(g, 780, 100, 55)
    drawTree(g, 950, 80, 60)
    drawTree(g, 1080, 120, 50)
    drawTree(g, 1050, 280, 55)
    drawTree(g, 680, 160, 50)
    // Crop rows
    for (const ry of ROW_YS) {
      for (let cx = ROW_X1 + 10; cx < ROW_X2; cx += 40) {
        const isYellow = ((cx / 40) + ry) % 2 === 0
        g.fillStyle(isYellow ? CROP_YELLOW : CROP_GREEN)
        g.fillRect(cx, ry + 4, 20, 20)
      }
    }

    // ── Market trees ──
    drawTree(g, 500, 600, 45)
    drawTree(g, 80, 830, 50)
    drawTree(g, 420, 850, 45)

    // ── Picnic trees ──
    const picnicTrees: [number, number, number][] = [
      [670, 560, 60], [820, 850, 55], [960, 570, 65],
      [1120, 880, 55], [760, 760, 50],
    ]
    for (const [tx, ty, ts] of picnicTrees) {
      drawTree(g, tx, ty, ts)
    }
    // Bushes
    g.fillStyle(BUSH_GREEN)
    g.fillCircle(700, 650, 12)
    g.fillCircle(720, 655, 10)
    g.fillCircle(1100, 700, 11)
  }

  // ── Layer 4: Fine decorations ──
  private static drawFineDecorations(g: Phaser.GameObjects.Graphics): void {
    const flowerClusters: [number, number, number][] = [
      // Farm
      [100, 300, FLOWER_RED], [120, 310, FLOWER_YELLOW],
      [350, 120, FLOWER_PINK], [360, 130, FLOWER_WHITE],
      // Orchard
      [700, 230, FLOWER_PURPLE], [720, 240, FLOWER_PINK],
      [1000, 350, FLOWER_YELLOW], [1020, 360, FLOWER_RED],
      // Market
      [150, 620, FLOWER_WHITE], [170, 630, FLOWER_PURPLE],
      [450, 620, FLOWER_RED], [460, 635, FLOWER_YELLOW],
      // Picnic
      [720, 680, FLOWER_PINK], [740, 690, FLOWER_WHITE],
      [1000, 830, FLOWER_YELLOW], [1020, 840, FLOWER_RED],
      [850, 600, FLOWER_PURPLE],
    ]
    for (const [fx, fy, color] of flowerClusters) {
      g.fillStyle(color)
      g.fillCircle(fx, fy, 3)
      g.fillCircle(fx + 6, fy + 2, 3)
      g.fillCircle(fx - 5, fy + 3, 3)
      g.fillCircle(fx + 3, fy - 4, 2)
      // Center
      g.fillStyle(FLOWER_YELLOW)
      g.fillCircle(fx, fy, 1.5)
    }

    // Stones
    g.fillStyle(STONE_GRAY)
    const stones: [number, number, number][] = [
      [200, 300, 3], [300, 420, 4], [750, 400, 3],
      [500, 650, 4], [900, 800, 3], [600, 480, 2],
    ]
    for (const [sx, sy, sr] of stones) {
      g.fillCircle(sx, sy, sr)
    }

    // Grass tufts (small triangles)
    g.fillStyle(GRASS_DARK)
    const tufts: [number, number][] = [
      [50, 50], [150, 80], [550, 50], [700, 50], [1100, 50],
      [50, 400], [550, 420], [650, 420], [50, 900], [550, 900],
      [650, 900], [1150, 900], [800, 500], [1000, 500],
    ]
    for (const [tx, ty] of tufts) {
      g.fillTriangle(tx, ty - 6, tx - 4, ty, tx + 4, ty)
    }
  }

  // ── Zone labels (Text at depth 4) ──
  private static drawLabels(scene: Phaser.Scene): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '16px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }
    const labels: { x: number; y: number; text: string }[] = [
      { x: 200, y: 30, text: '🐄 Granja' },
      { x: 900, y: 30, text: '🌱 Huerta' },
      { x: 200, y: 510, text: '🏪 Mercado' },
      { x: 900, y: 510, text: '🧺 Picnic' },
    ]
    for (const { x, y, text } of labels) {
      const label = scene.add.text(x, y, text, style).setOrigin(0.5)
      label.setDepth(4)
    }
  }
}
