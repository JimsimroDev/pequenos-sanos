import Phaser from 'phaser'

/**
 * FoodTextures — procedural sprites for food items, one per category.
 * Replaces the emoji-on-a-circle placeholder with a small cartoon icon.
 */

export const FOOD_CATEGORIES = ['FRUTA', 'VERDURA', 'PROTEINA', 'CEREAL'] as const
export type FoodCategory = (typeof FOOD_CATEGORIES)[number]

const FW = 48
const FH = 48
const CX = FW / 2
const CY = FH / 2

export function ensureFoodTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('food-FRUTA')) return
  const g = scene.add.graphics()

  // FRUTA — red apple with leaf
  g.clear()
  g.fillStyle(0xef4444)
  g.fillCircle(CX, CY + 2, 16)
  g.fillStyle(0xdc2626)
  g.fillCircle(CX - 4, CY + 6, 6)
  g.fillStyle(0x22c55e)
  g.fillEllipse(CX + 6, CY - 14, 10, 6)
  g.fillStyle(0x78350f)
  g.fillRect(CX - 1, CY - 16, 2, 6)
  g.fillStyle(0xffffff, 0.35)
  g.fillCircle(CX - 6, CY - 4, 4)
  g.generateTexture('food-FRUTA', FW, FH)

  // VERDURA — carrot
  g.clear()
  g.fillStyle(0xf97316)
  g.fillTriangle(CX, CY + 16, CX - 9, CY - 6, CX + 9, CY - 6)
  g.fillStyle(0xea580c)
  g.fillTriangle(CX, CY + 12, CX - 6, CY - 2, CX + 6, CY - 2)
  g.fillStyle(0x22c55e)
  g.fillTriangle(CX - 6, CY - 6, CX - 2, CY - 18, CX + 2, CY - 6)
  g.fillTriangle(CX + 6, CY - 6, CX + 2, CY - 18, CX - 2, CY - 6)
  g.fillStyle(0x16a34a)
  g.fillRect(CX - 1, CY - 20, 2, 6)
  g.generateTexture('food-VERDURA', FW, FH)

  // PROTEINA — chicken drumstick
  g.clear()
  g.fillStyle(0xd97706)
  g.fillEllipse(CX, CY + 2, 18, 12)
  g.fillStyle(0xb45309)
  g.fillEllipse(CX - 2, CY + 4, 12, 8)
  g.fillStyle(0xfef3c7)
  g.fillCircle(CX + 12, CY - 4, 6)
  g.fillStyle(0xd97706)
  g.fillRect(CX + 8, CY - 2, 4, 8)
  g.fillStyle(0xffffff, 0.25)
  g.fillCircle(CX - 6, CY - 2, 3)
  g.generateTexture('food-PROTEINA', FW, FH)

  // CEREAL — wheat ear
  g.clear()
  g.fillStyle(0xca8a04)
  g.fillRect(CX - 1, CY - 18, 2, 32)
  for (let i = 0; i < 6; i++) {
    const y = CY - 14 + i * 5
    g.fillStyle(0xeab308)
    g.fillEllipse(CX - 5, y, 8, 4)
    g.fillEllipse(CX + 5, y + 2, 8, 4)
  }
  g.fillStyle(0xa16207)
  g.fillCircle(CX, CY + 14, 3)
  g.generateTexture('food-CEREAL', FW, FH)

  g.destroy()
}

export function foodTextureKey(categoria: string): string {
  return FOOD_CATEGORIES.includes(categoria as FoodCategory) ? `food-${categoria}` : 'food-FRUTA'
}
