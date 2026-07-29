# Spec: Realistic Market/Farm Map

## Requirement

Replace the abstract colored-grid map in GameScene with a 4-zone market/farm map rendered entirely via Phaser Graphics primitives (rectangles, circles, triangles, lines). No images, sprites, or tilemaps.

## Zones

| Zone | Location | Theme | Key Features |
|------|----------|-------|--------------|
| Farm | Top-left (0-600, 0-480) | Ranching & produce | Barn, silo, windmill, pond, corral, hay bales |
| Orchard | Top-right (600-1200, 0-480) | Crops & greenhouse | Greenhouse, crop rows, compost, fruit trees |
| Market | Bottom-left (0-600, 480-960) | Food stalls | 4 market stalls with awnings, market sign |
| Picnic | Bottom-right (600-1200, 480-960) | Dining & rest | Picnic tables, BBQ grill, shade trees |

## Non-goals

- No images/sprites/tilemaps
- No interactive map objects (clickable stalls, etc.)
- No minimap
- No collision geometry changes (food collection still uses existing rectangular zones)
- No animations on map elements

## Acceptance Criteria

1. Map loads when GameScene.create() runs — no console errors
2. 4 distinct themed zones visible with recognizable structures
3. Cross-shaped dirt path divides the 4 zones with a center plaza/fountain
4. Each zone has at least 3 unique decorative elements (trees, flowers, fences, etc.)
5. Zone labels shown with emoji + name
6. Player avatar and food items render ON TOP of the map (depth layering)
7. Old abstract grid (drawTileMap, createDecorations, tileMap field) is removed
8. Performance: no visible lag on desktop browsers
