import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Terrain — procedural 3D ground with grass variation.
 * Replaces MapRenderer's flat 2D ground with a 3D plane + subtle height variation.
 */
export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Subtle vertex displacement for organic ground (gentle hills)
  useFrame(() => {
    // placeholder: static for now
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[60, 60, 32, 32]} />
      <meshStandardMaterial
        color="#6aab4a"
        roughness={0.95}
        metalness={0.0}
      />
    </mesh>
  )
}
