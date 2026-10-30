import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { Terrain } from './Terrain'
import { Buildings } from './Buildings'
import { Trees } from './Trees'

interface GameCanvasProps {
  perfilId: number
  nombrePerfil: string
  avatarCodigo: string
  avatarColor: string
  onExit: () => void
}

/**
 * GameCanvas — React Three Fiber entry point for the 3D game.
 * Replaces PhaserGame.tsx once the R3F migration is complete.
 * For now, coexists with Phaser; swap is the last step.
 */
export default function GameCanvas({ perfilId, nombrePerfil, avatarCodigo, avatarColor, onExit }: GameCanvasProps) {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0f172a' }}>
      <Canvas
        shadows
        camera={{ position: [0, 8, 12], fov: 50, near: 0.1, far: 200 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 15, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <hemisphereLight args={['#87ceeb', '#7ec850', 0.4]} />

          {/* Terrain */}
          <Terrain />

          {/* Buildings */}
          <Buildings />

          {/* Trees */}
          <Trees />

          {/* Orbit controls for debugging (remove in production) */}
          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 4} />
        </Suspense>
      </Canvas>

      {/* HUD overlay (React) */}
      <div style={{ position: 'absolute', top: 16, left: 16, color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        🪙 0
      </div>
      <button
        onClick={onExit}
        style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  )
}
