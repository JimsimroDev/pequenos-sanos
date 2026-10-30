import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * PonyBillboard — renders the 2D poni (procedural canvas texture) as a
 * billboard in 3D space. Keeps the detailed cartoon style the user prefers
 * while gaining 3D depth (shadows, lighting, parallax).
 */

interface PonyBillboardProps {
  color: string
  pony: string
  position?: [number, number, number]
  scale?: number
}

const PONY_PALETTES: Record<string, { mane: string; mane2: string; iris: string }> = {
  TWILIGHT: { mane: '#4c1d95', mane2: '#ec4899', iris: '#7c3aed' },
  RAINBOW: { mane: '#ef4444', mane2: '#3b82f6', iris: '#db2777' },
  FLUTTERSHY: { mane: '#f9a8d4', mane2: '#f472b6', iris: '#0d9488' },
  PINKIE: { mane: '#db2777', mane2: '#f472b6', iris: '#0284c7' },
}

function generatePonyTexture(color: string, pony: string): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, size, size)

  const pal = PONY_PALETTES[pony] || PONY_PALETTES.TWILIGHT
  const cx = size / 2
  const cy = size / 2 + 4

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 42, 38, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(cx - 4, cy + 2, 30, 20, 0, 0, Math.PI * 2)
  ctx.fill()

  // Belly (lighter)
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.ellipse(cx - 4, cy + 8, 20, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  // Legs (4)
  ctx.fillStyle = color
  for (const lx of [-18, -6, 8, 20]) {
    ctx.beginPath()
    ctx.roundRect(cx + lx - 4, cy + 16, 8, 22, 3)
    ctx.fill()
  }

  // Head
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx + 22, cy - 16, 18, 0, Math.PI * 2)
  ctx.fill()

  // Muzzle
  ctx.fillStyle = 'rgba(255,245,230,0.9)'
  ctx.beginPath()
  ctx.ellipse(cx + 36, cy - 8, 12, 9, 0, 0, Math.PI * 2)
  ctx.fill()

  // Ear
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx + 14, cy - 28)
  ctx.lineTo(cx + 20, cy - 28)
  ctx.lineTo(cx + 17, cy - 40)
  ctx.closePath()
  ctx.fill()
  // Inner ear
  ctx.fillStyle = '#fda4af'
  ctx.beginPath()
  ctx.moveTo(cx + 15, cy - 29)
  ctx.lineTo(cx + 19, cy - 29)
  ctx.lineTo(cx + 17, cy - 37)
  ctx.closePath()
  ctx.fill()

  // Mane
  ctx.fillStyle = pal.mane
  ctx.beginPath()
  ctx.arc(cx + 14, cy - 30, 10, 0, Math.PI * 2)
  ctx.arc(cx + 22, cy - 32, 9, 0, Math.PI * 2)
  ctx.arc(cx + 10, cy - 22, 8, 0, Math.PI * 2)
  ctx.arc(cx + 6, cy - 14, 7, 0, Math.PI * 2)
  ctx.fill()
  // Mane streak
  ctx.fillStyle = pal.mane2
  ctx.beginPath()
  ctx.arc(cx + 18, cy - 28, 5, 0, Math.PI * 2)
  ctx.fill()

  // Tail
  ctx.fillStyle = pal.mane
  ctx.beginPath()
  ctx.arc(cx - 30, cy - 6, 9, 0, Math.PI * 2)
  ctx.arc(cx - 36, cy + 2, 7, 0, Math.PI * 2)
  ctx.arc(cx - 38, cy + 10, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = pal.mane2
  ctx.beginPath()
  ctx.arc(cx - 33, cy - 2, 4, 0, Math.PI * 2)
  ctx.fill()

  // Eyes (kawaii)
  // Left eye
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(cx + 14, cy - 16, 7, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = pal.iris
  ctx.beginPath()
  ctx.arc(cx + 15, cy - 16, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1f2937'
  ctx.beginPath()
  ctx.arc(cx + 16, cy - 16, 1.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx + 17, cy - 18, 1, 0, Math.PI * 2)
  ctx.fill()
  // Right eye
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(cx + 26, cy - 16, 7, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = pal.iris
  ctx.beginPath()
  ctx.arc(cx + 27, cy - 16, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1f2937'
  ctx.beginPath()
  ctx.arc(cx + 28, cy - 16, 1.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(cx + 29, cy - 18, 1, 0, Math.PI * 2)
  ctx.fill()

  // Smile
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx + 22, cy - 6, 5, 0.2, Math.PI - 0.2)
  ctx.stroke()

  // Nostrils
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.arc(cx + 32, cy - 10, 1, 0, Math.PI * 2)
  ctx.arc(cx + 38, cy - 10, 1, 0, Math.PI * 2)
  ctx.fill()

  // Cutie mark (star)
  ctx.fillStyle = '#ec4899'
  ctx.beginPath()
  const sx = cx - 4, sy = cy + 2
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2
    const r = i % 2 === 0 ? 5 : 2.5
    const px = sx + Math.cos(a) * r
    const py = sy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function PonyBillboard({ color, pony, position = [0, 0, 0], scale = 1 }: PonyBillboardProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => generatePonyTexture(color, pony), [color, pony])

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.1} side={THREE.DoubleSide} />
    </mesh>
  )
}
