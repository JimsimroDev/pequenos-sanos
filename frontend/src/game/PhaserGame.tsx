import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { CharacterSelectScene } from './scenes/CharacterSelectScene'
import { GameScene } from './scenes/GameScene'
import { EndScene } from './scenes/EndScene'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'

interface PhaserGameProps {
  perfilId: number
  nombrePerfil: string
  avatarCodigo: string
  onExit: () => void
}

/** Returns the available game dimensions respecting the device viewport. */
function getGameSize() {
  const hud = 56 // HUD bar height in px
  const w = Math.min(window.innerWidth, 1200)
  const h = Math.min(window.innerHeight - hud, 750)
  return { w: Math.max(w, 320), h: Math.max(h, 400) }
}

/**
 * PhaserGame — React wrapper that mounts and manages the Phaser game instance.
 * Uses Scale.FIT + CENTER_BOTH so the canvas fills the screen on any device.
 */
export default function PhaserGame({ perfilId, nombrePerfil, avatarCodigo, onExit }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const authState = useAuthStore.getState()
    const gameState = useGameStore.getState()

    const initialCodigo = authState.avatarCodigo || avatarCodigo
    const initialColor = authState.avatarColor || gameState.avatarColor
    const hasExistingAvatar = !!initialCodigo && !!initialColor

    const { w, h } = getGameSize()

    const sceneData = {
      perfilId,
      nombrePerfil,
      avatarCodigo: initialCodigo,
      avatarColor: initialColor,
      onComplete: (key: string, color: string) => {
        useGameStore.getState().setAvatarColor(color)
        useAuthStore.getState().setAvatarCodigo(key)
        useAuthStore.getState().setAvatarColor(color)
      },
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: w,
      height: h,
      backgroundColor: '#0f172a',
      parent: containerRef.current,
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: [new CharacterSelectScene(), GameScene, EndScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: w,
        height: h,
      },
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    game.events.once('ready', () => {
      if (hasExistingAvatar) {
        // Skip character select — go straight to game
        game.scene.start('GameScene', sceneData)
      } else {
        game.scene.start('CharacterSelectScene', sceneData)
      }
    })

    const handleExit = () => onExit()
    window.addEventListener('game:exit', handleExit)

    const handleResize = () => {
      if (!gameRef.current) return
      const { w: nw, h: nh } = getGameSize()
      gameRef.current.scale.resize(nw, nh)
      // Force Phaser to recalculate CSS dimensions after resize
      // Scale.FIT doesn't always update the CSS properly without refresh
      setTimeout(() => {
        if (gameRef.current) {
          gameRef.current.scale.refresh()
        }
      }, 100)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('game:exit', handleExit)
      window.removeEventListener('resize', handleResize)
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      id="game-container"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
