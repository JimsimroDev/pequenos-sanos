import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * FoodItem — procedural 3D food item (apple) with float animation.
 */

interface FoodItemProps {
  position: [number, number, number]
  color?: string
  onCollect?: () => void
}

export function FoodItem({ position, color = '#ef4444' }: FoodItemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const floatOffset = useRef(Math.random() * Math.PI * 2)

  useFrame(() => {
    if (!groupRef.current) return
    const t = Date.now() * 0.002 + floatOffset.current
    groupRef.current.position.y = position[1] + Math.sin(t) * 0.15
    groupRef.current.rotation.y = t * 0.5
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Apple body */}
      <mesh castShadow>
        <sphereGeometry args={[0.25, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Highlight */}
      <mesh position={[-0.08, 0.1, 0.15]}>
        <sphereGeometry args={[0.08, 6, 4]} />
        <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.9} />
      </mesh>
      {/* Leaf */}
      <mesh position={[0.08, 0.32, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.12, 0.02, 0.06]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} />
      </mesh>
      {/* Shadow */}
      <mesh position={[0, -0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 12]} />
        <meshBasicMaterial color="#000000" opacity={0.2} transparent />
      </mesh>
    </group>
  )
}
