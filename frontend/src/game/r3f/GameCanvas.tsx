import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
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
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setFadeIn(false), 100)
    return () => clearTimeout(t)
  }, [])

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
          <hemisphereLight args={['#8ec8e8', '#6aab4a', 0.4]} />

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

      {/* Fade-in overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0f172a',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.8s ease-out',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* HUD overlay (React) — glassmorphism */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: 'white',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: 12,
          padding: '8px 16px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        🪙 0
      </div>
      <button
        onClick={onExit}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'transform 0.15s ease, background 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)' }}
        onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
      >
        ✕
      </button>
    </div>
  )
}
