# Tasks: Realistic Market/Farm Map

> **Chained PR strategy**: Feature-branch-chain → all PRs target `develop`
> **Delivery**: 2 PR slices
> **Estimated total**: ~320-400 lines
> **Budget per slice**: ~160-200 lines

---

## Slice 1: MapRenderer Foundation + Terrain + Buildings (~180 lines)

**Files**: Create `frontend/src/game/map/MapRenderer.ts`, Modify `frontend/src/game/scenes/GameScene.ts`

- [x] 1.1 Create `frontend/src/game/map/` directory
- [x] 1.2 Create `MapRenderer.ts` with color palette constants (38 colors from design.md)
- [x] 1.3 Create `MapRenderer.ts` with layout constants (zone boundaries, building positions, path widths)
- [x] 1.4 Implement `drawBaseGround()` — solid grass fill + alternating grass texture blocks (layer 0)
- [x] 1.5 Implement `drawTerrain()` — cross-shaped dirt paths, center plaza/fountain, pond, orchard soil rows (layer 1)
- [x] 1.6 Implement helper functions: `drawTree()`, `drawFence()`, `drawPond()`, `drawBarn()`, `drawGreenhouse()`, `drawStall()`, `drawPicnicTable()`, `drawWindmill()`
- [x] 1.7 Implement `drawBuildings()` — barn, silo, windmill, corral fence, greenhouse, compost bin, 4 market stalls, market sign, 3 picnic tables, BBQ grill (layer 2)
- [x] 1.8 Implement `drawVegetation()` — farm trees, orchard trees/crop rows, market trees, picnic trees, hay bales, bushes (layer 3)
- [x] 1.9 Implement `drawFineDecorations()` — flower clusters, stones, grass tufts (layer 4)
- [x] 1.10 Implement `drawLabels(scene)` — 4 Phaser.Text zone labels with emoji (layer 4)
- [x] 1.11 Implement `MapRenderer.draw(scene)` — orchestrates all 5 layers in depth order
- [x] 1.12 Modify `GameScene.ts` — remove `tileMap` field, `drawTileMap()`, `createDecorations()` methods
- [x] 1.13 Modify `GameScene.ts` — add `import { MapRenderer } from '../map/MapRenderer'` and call `MapRenderer.draw(this)` in `create()`
- [x] 1.14 Verify no console errors on game load

## Slice 2: Polish & Visual Tuning (~140 lines)

**Files**: Modify `frontend/src/game/map/MapRenderer.ts`

- [ ] 2.1 Verify all 4 zones render with correct colors and positions
- [ ] 2.2 Tune building/stall/table positions for visual balance
- [ ] 2.3 Adjust vegetation density and distribution
- [ ] 2.4 Verify food items and player avatar render above map (depth correctness)
- [ ] 2.5 Verify zone labels are readable and positioned correctly

---

## Review Workload Forecast

| Item | Value |
|------|-------|
| Estimated changed lines | ~320-400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Decision needed before apply | Resolved: chained PRs to develop |
| Chain strategy | Feature-branch-chain → develop |
