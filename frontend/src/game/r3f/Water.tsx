import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Water — procedural pond with animated ripples.
 */

export function Water({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    // Gentle ripple via scale oscillation
    const t = Date.now() * 0.002
    meshRef.current.scale.x = 1 + Math.sin(t) * 0.02
    meshRef.current.scale.y = 1 + Math.cos(t * 1.3) * 0.02
  })

  return (
    <group position={position}>
      {/* Deep water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <circleGeometry args={[2.5, 32]} />
        <meshStandardMaterial color="#2171d5" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Shallow water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshStandardMaterial color="#4292eb" roughness={0.2} metalness={0.2} transparent opacity={0.8} />
      </mesh>
      {/* Highlight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.3, 0.07, -0.2]}>
        <circleGeometry args={[0.8, 16]} />
        <meshStandardMaterial color="#6baaf0" roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* Stone border */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 2.7, 0.05, Math.sin(a) * 2.7]} castShadow>
            <sphereGeometry args={[0.15, 6, 4]} />
            <meshStandardMaterial color="#999999" roughness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}
