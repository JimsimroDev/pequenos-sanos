import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from './Player'
import { FoodItem } from './Food'
import { Terrain } from './Terrain'
import { Buildings } from './Buildings'
import { Trees } from './Trees'

// Obstacle AABBs in XZ plane (same as Phaser, scaled to 3D units: 1 tile = 1 unit)
const OBSTACLES: { x: number; z: number; w: number; h: number }[] = [
  { x: -8, z: -5, w: 3.6, h: 2.2 },   // barn
  { x: 10, z: -5, w: 3.6, h: 2 },      // greenhouse
  { x: -8, z: 5, w: 1.6, h: 0.8 },     // stall 1
  { x: -12, z: 6, w: 1.6, h: 0.8 },    // stall 2
  { x: -4, z: 5.5, w: 1.6, h: 0.8 },   // stall 3
  { x: -10, z: 9, w: 1.6, h: 0.8 },    // stall 4
  { x: 0, z: 0, w: 1, h: 1 },           // plaza center
]

const FOOD_POSITIONS: [number, number, number][] = [
  [-5, 0.3, -3], [3, 0.3, -2], [-2, 0.3, 4], [7, 0.3, 3],
  [-9, 0.3, 0], [5, 0.3, -7], [1, 0.3, 6], [-6, 0.3, 8],
  [8, 0.3, -4], [-3, 0.3, -8], [4, 0.3, 7], [-11, 0.3, 3],
]

const PLAYER_SPEED = 3
const PLAYER_RADIUS = 0.4
const COLLECT_RADIUS = 0.8

interface GameScene3DProps {
  color: string
  name: string
  onCollect?: (points: number) => void
}

export function GameScene3D({ color, name, onCollect }: GameScene3DProps) {
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  const playerVel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  const keys = useRef<Record<string, boolean>>({})
  const playerGroupRef = useRef<THREE.Group>(null)
  const isMoving = useRef(false)
  const lastDir = useRef<'left' | 'right' | 'up' | 'down'>('down')

  const [collected, setCollected] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)

  // Keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true }
    const up = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const { camera } = useThree()

  // Game loop
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1)

    // Camera follow with smoothing
    const targetX = playerPos.current.x
    const targetZ = playerPos.current.z
    camera.position.x += (targetX + 8 - camera.position.x) * 0.05
    camera.position.z += (targetZ + 12 - camera.position.z) * 0.05
    camera.lookAt(targetX, 0, targetZ)
    const k = keys.current

    // Input direction
    let ix = 0, iz = 0
    if (k['a'] || k['arrowleft']) ix -= 1
    if (k['d'] || k['arrowright']) ix += 1
    if (k['w'] || k['arrowup']) iz -= 1
    if (k['s'] || k['arrowdown']) iz += 1

    const len = Math.hypot(ix, iz)
    if (len > 0) { ix /= len; iz /= len }
    const moving = len > 0
    isMoving.current = moving

    // Acceleration + friction
    const ACCEL = 12
    const FRICTION = 10
    const MAX_SPEED = 3
    playerVel.current.x += ix * ACCEL * dt
    playerVel.current.z += iz * ACCEL * dt
    if (ix === 0) playerVel.current.x *= Math.exp(-FRICTION * dt)
    if (iz === 0) playerVel.current.z *= Math.exp(-FRICTION * dt)

    const vlen = Math.hypot(playerVel.current.x, playerVel.current.z)
    if (vlen > MAX_SPEED) {
      playerVel.current.x = (playerVel.current.x / vlen) * MAX_SPEED
      playerVel.current.z = (playerVel.current.z / vlen) * MAX_SPEED
    }
    if (Math.abs(playerVel.current.x) < 0.05) playerVel.current.x = 0
    if (Math.abs(playerVel.current.z) < 0.05) playerVel.current.z = 0

    // Integrate
    let nx = playerPos.current.x + playerVel.current.x * dt
    let nz = playerPos.current.z + playerVel.current.z * dt

    // Clamp to world bounds
    const BOUND = 25
    nx = Math.max(-BOUND, Math.min(BOUND, nx))
    nz = Math.max(-BOUND, Math.min(BOUND, nz))

    // Collision with obstacles (circle vs AABB, push-out)
    for (const o of OBSTACLES) {
      const closestX = Math.max(o.x - o.w / 2, Math.min(nx, o.x + o.w / 2))
      const closestZ = Math.max(o.z - o.h / 2, Math.min(nz, o.z + o.h / 2))
      const dx = nx - closestX
      const dz = nz - closestZ
      const distSq = dx * dx + dz * dz
      if (distSq < PLAYER_RADIUS * PLAYER_RADIUS) {
        if (distSq === 0) {
          // inside — push along shortest axis
          const toL = nx - (o.x - o.w / 2)
          const toR = (o.x + o.w / 2) - nx
          const toT = nz - (o.z - o.h / 2)
          const toB = (o.z + o.h / 2) - nz
          const m = Math.min(toL, toR, toT, toB)
          if (m === toL) nx = o.x - o.w / 2 - PLAYER_RADIUS
          else if (m === toR) nx = o.x + o.w / 2 + PLAYER_RADIUS
          else if (m === toT) nz = o.z - o.h / 2 - PLAYER_RADIUS
          else nz = o.z + o.h / 2 + PLAYER_RADIUS
        } else {
          const dist = Math.sqrt(distSq)
          const overlap = PLAYER_RADIUS - dist
          nx += (dx / dist) * overlap
          nz += (dz / dist) * overlap
        }
      }
    }

    playerPos.current.x = nx
    playerPos.current.z = nz

    // Update player group position
    if (playerGroupRef.current) {
      playerGroupRef.current.position.x = nx
      playerGroupRef.current.position.z = nz
    }

    // Check food collection
    FOOD_POSITIONS.forEach((fp, idx) => {
      if (collected.has(idx)) return
      const dist = Math.hypot(nx - fp[0], nz - fp[2])
      if (dist < COLLECT_RADIUS) {
        setCollected((prev) => new Set(prev).add(idx))
        setScore((s) => s + 10)
        onCollect?.(10)
      }
    })
  })

  return (
    <>
      <Terrain />
      <Buildings />
      <Trees />

      {/* Food items */}
      {FOOD_POSITIONS.map((pos, idx) => (
        collected.has(idx) ? null : (
          <FoodItem key={idx} position={pos} color={idx % 2 === 0 ? '#ef4444' : '#f97316'} />
        )
      ))}

      {/* Player */}
      <group ref={playerGroupRef} position={[0, 0, 0]}>
        <Player color={color} name={name} />
      </group>

      {/* Score display (HTML overlay) */}
    </>
  )
}
