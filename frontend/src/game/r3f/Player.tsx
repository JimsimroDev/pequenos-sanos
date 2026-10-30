import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Player — procedural 3D pony character in cartoon style.
 * Built entirely from basic geometries (no external assets).
 * Animations: idle (breathing) and walk (leg stepping + body bob).
 */

interface PlayerProps {
  color: string
  name: string
  position?: [number, number, number]
}

export function Player({ color, name, position = [0, 0, 0] }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const legFL = useRef<THREE.Mesh>(null)
  const legFR = useRef<THREE.Mesh>(null)
  const legBL = useRef<THREE.Mesh>(null)
  const legBR = useRef<THREE.Mesh>(null)
  const headRef = useRef<THREE.Group>(null)

  const walkPhase = useRef(0)
  const isMoving = useRef(false)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Idle breathing
    const breathe = Math.sin(Date.now() * 0.003) * 0.02
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + breathe
    }

    // Walk animation (when moving)
    if (isMoving.current) {
      walkPhase.current += delta * 8
      const t = walkPhase.current
      // Alternating leg pairs: front-left + back-right vs front-right + back-left
      if (legFL.current) legFL.current.position.y = 0.3 + Math.sin(t) * 0.15
      if (legBR.current) legBR.current.position.y = 0.3 + Math.sin(t) * 0.15
      if (legFR.current) legFR.current.position.y = 0.3 + Math.sin(t + Math.PI) * 0.15
      if (legBL.current) legBL.current.position.y = 0.3 + Math.sin(t + Math.PI) * 0.15
      // Body bob
      if (bodyRef.current) {
        bodyRef.current.position.y = 1.2 + Math.abs(Math.sin(t * 2)) * 0.05
      }
    } else {
      // Reset legs to idle
      if (legFL.current) legFL.current.position.y = 0.3
      if (legFR.current) legFR.current.position.y = 0.3
      if (legBL.current) legBL.current.position.y = 0.3
      if (legBR.current) legBR.current.position.y = 0.3
    }
  })

  // Mane color based on pony identity (fixed, not tinted)
  const maneColor = '#4c1d95'
  const eyeColor = '#1f2937'

  return (
    <group ref={groupRef} position={position}>
      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.2} transparent />
      </mesh>

      {/* Body */}
      <mesh ref={bodyRef} castShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.6, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Belly (lighter) */}
      <mesh position={[0, 1.0, 0.2]}>
        <sphereGeometry args={[0.45, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0.4, 1.7, 0.3]}>
        <mesh castShadow>
          <sphereGeometry args={[0.35, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* Muzzle */}
        <mesh position={[0.2, -0.05, 0.15]}>
          <sphereGeometry args={[0.18, 8, 6]} />
          <meshStandardMaterial color="#f5e6d3" roughness={0.8} />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.15, 0.1, 0.25]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0.15, 0.1, 0.25]}>
          <sphereGeometry args={[0.04, 6, 4]} />
          <meshStandardMaterial color={eyeColor} roughness={0.3} />
        </mesh>
        {/* Left eye */}
        <mesh position={[-0.1, 0.1, 0.28]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[-0.1, 0.1, 0.28]}>
          <sphereGeometry args={[0.04, 6, 4]} />
          <meshStandardMaterial color={eyeColor} roughness={0.3} />
        </mesh>
        {/* Ears */}
        <mesh position={[0.1, 0.3, -0.05]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.08, 0.2, 6]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        <mesh position={[-0.15, 0.3, -0.05]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.08, 0.2, 6]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* Mane */}
        <mesh position={[-0.1, 0.25, -0.1]}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial color={maneColor} roughness={0.7} />
        </mesh>
        <mesh position={[-0.05, 0.35, -0.15]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color={maneColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Legs */}
      <mesh ref={legFL} castShadow position={[-0.3, 0.3, 0.2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.6, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh ref={legFR} castShadow position={[0.3, 0.3, 0.2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.6, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh ref={legBL} castShadow position={[-0.3, 0.3, -0.2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.6, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh ref={legBR} castShadow position={[0.3, 0.3, -0.2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.6, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Tail */}
      <mesh position={[-0.5, 1.0, -0.2]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.04, 0.08, 0.6, 6]} />
        <meshStandardMaterial color={maneColor} roughness={0.7} />
      </mesh>

      {/* Cutie mark (small star on the side) */}
      <mesh position={[0.2, 1.0, 0.55]}>
        <sphereGeometry args={[0.08, 6, 4]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.3} />
      </mesh>

      {/* Name label (HTML overlay will be used instead, but keep as fallback) */}
    </group>
  )
}
