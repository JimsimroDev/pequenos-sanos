import * as THREE from 'three'

/**
 * Trees — procedural 3D trees with trunk + layered canopy + shadow.
 */

function Tree({ position, size = 1 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position}>
      {/* Shadow */}
      <mesh position={[0.3, 0.01, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 1.2, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.15} transparent />
      </mesh>
      {/* Trunk */}
      <mesh castShadow position={[0, size * 0.6, 0]}>
        <cylinderGeometry args={[0.08 * size, 0.12 * size, size * 1.2, 6]} />
        <meshStandardMaterial color="#6b4226" roughness={0.9} />
      </mesh>
      {/* Canopy layers */}
      <mesh castShadow position={[0, size * 1.6, 0]}>
        <sphereGeometry args={[size * 0.7, 8, 6]} />
        <meshStandardMaterial color="#3a7d32" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[-0.2 * size, size * 1.8, 0.1 * size]}>
        <sphereGeometry args={[size * 0.5, 8, 6]} />
        <meshStandardMaterial color="#4a8f42" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.15 * size, size * 1.9, -0.1 * size]}>
        <sphereGeometry args={[size * 0.4, 8, 6]} />
        <meshStandardMaterial color="#2d6b2d" roughness={0.8} />
      </mesh>
    </group>
  )
}

export function Trees() {
  const positions: [number, number, number][] = [
    [-12, 0, -8], [-10, 0, -10], [-6, 0, -9],
    [10, 0, -9], [12, 0, -7], [8, 0, -10],
    [-10, 0, 8], [12, 0, 9], [0, 0, 10],
    [-6, 0, 6], [6, 0, 7], [-14, 0, 0],
  ]
  return (
    <group>
      {positions.map((pos, i) => (
        <Tree key={i} position={pos} size={0.8 + (i % 3) * 0.2} />
      ))}
    </group>
  )
}
