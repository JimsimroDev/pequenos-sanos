import * as THREE from 'three'

/**
 * Buildings — procedural 3D buildings in cartoon style.
 * Each building is composed of simple geometries (box + cone/pyramid roof)
 * with flat colors and soft shading.
 */

function Barn({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main body */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[3.6, 3, 2.2]} />
        <meshStandardMaterial color="#cc3333" roughness={0.8} />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, 3.5, 0]}>
        <coneGeometry args={[2.4, 1.2, 4]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.8, 1.11]}>
        <boxGeometry args={[0.7, 1.6, 0.05]} />
        <meshStandardMaterial color="#5c2e00" roughness={0.9} />
      </mesh>
      {/* Window */}
      <mesh position={[0.9, 1.8, 1.11]}>
        <boxGeometry args={[0.5, 0.4, 0.05]} />
        <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function Greenhouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[3.6, 2, 2]} />
        <meshStandardMaterial color="#a8e6a8" roughness={0.3} transparent opacity={0.85} />
      </mesh>
      <mesh castShadow position={[0, 2.3, 0]}>
        <coneGeometry args={[2.2, 0.8, 4]} />
        <meshStandardMaterial color="#228b22" roughness={0.7} />
      </mesh>
    </group>
  )
}

function MarketStall({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Counter */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1, 0.8]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.9} />
      </mesh>
      {/* Awning */}
      <mesh castShadow position={[0, 1.3, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[1.4, 0.6, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Posts */}
      <mesh position={[-0.7, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.9} />
      </mesh>
      <mesh position={[0.7, 0, 0.35]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Buildings() {
  return (
    <group>
      <Barn position={[-8, 0, -5]} />
      <Greenhouse position={[10, 0, -5]} />
      <MarketStall position={[-8, 0, 5]} color="#ff5555" />
      <MarketStall position={[-12, 0, 6]} color="#5599ff" />
      <MarketStall position={[-4, 0, 5.5]} color="#55cc55" />
      <MarketStall position={[-10, 0, 9]} color="#ffcc00" />
    </group>
  )
}
