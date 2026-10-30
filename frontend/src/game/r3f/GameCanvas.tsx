import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Sparkles } from '@react-three/drei'
import { GameScene3D } from './GameScene3D'
import { DayNightLight } from './DayNightLight'

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
          {/* Dynamic day/night lighting */}
          <DayNightLight />
          <hemisphereLight args={['#87ceeb', '#7ec850', 0.4]} />

          {/* Ambient dust particles */}
          <Sparkles count={60} scale={[60, 5, 60]} size={2} speed={0.3} opacity={0.4} color="#ffffff" />

          {/* Game scene (terrain, buildings, trees, player, food, movement) */}
          <GameScene3D
            color={avatarColor}
            name={nombrePerfil}
            onCollect={(pts) => console.log('Collected', pts)}
          />

          {/* Camera is now controlled by GameScene3D (follows player) */}
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
