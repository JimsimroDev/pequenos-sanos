import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'

const PONY_EMOJIS: Record<string, string> = {
  TWILIGHT: '🦄', RAINBOW: '🌈', FLUTTERSHY: '🦋', PINKIE: '🎉',
  EXPLORER: '🧭', CHEF: '👨‍🍳', ATHLETE: '🏃', SCIENTIST: '🔬',
}

interface HUDProps {
  perfilId: number
  nombrePerfil: string
  onExit: () => void
}

/**
 * HUD — React overlay displayed above the Phaser canvas.
 * Shows timer, coins, connected players count, and a quit button.
 */
export default function HUD({ perfilId: _perfilId, nombrePerfil, onExit }: HUDProps) {
  const saldo = useGameStore((s) => s.saldo)
  const minutosRestantes = useGameStore((s) => s.minutosRestantes)
  const segundosRestantes = useGameStore((s) => s.segundosRestantes)
  const otrosJugadores = useGameStore((s) => s.otrosJugadores)
  const avatarCodigo = useAuthStore((s) => s.avatarCodigo)

  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    setIsUrgent(minutosRestantes === 0 && segundosRestantes <= 60)
  }, [minutosRestantes, segundosRestantes])

  const timeStr = `${String(minutosRestantes).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`
  const playersOnline = otrosJugadores.length + 1 // include self

  return (
    <div className="w-full bg-gray-900 text-white px-2 sm:px-4 py-2 flex items-center justify-between shadow-lg gap-2">
      {/* Left: player info — hide name on very small screens */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs sm:text-sm flex-shrink-0"
             title={avatarCodigo || nombrePerfil}>
          <span className="text-sm sm:text-base">{PONY_EMOJIS[avatarCodigo || ''] || nombrePerfil.charAt(0).toUpperCase()}</span>
        </div>
        <span className="font-semibold text-xs sm:text-sm hidden sm:inline truncate">{nombrePerfil}</span>
        <div className="flex items-center gap-1 bg-yellow-500/20 rounded-lg px-1.5 sm:px-2 py-0.5 flex-shrink-0">
          <span className="text-yellow-300 text-xs sm:text-sm">🪙</span>
          <span className="text-yellow-200 font-bold text-xs sm:text-sm">{saldo}</span>
        </div>
      </div>

      {/* Center: timer — compact on mobile */}
      <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 rounded-xl font-mono text-base sm:text-xl font-bold transition-colors flex-shrink-0 ${
        isUrgent ? 'bg-red-500/30 text-red-300 animate-pulse' : 'bg-white/10 text-white'
      }`}>
        <span className="text-sm sm:text-lg">{isUrgent ? '⚠️' : '⏱'}</span>
        <span>{timeStr}</span>
      </div>

      {/* Right: players + exit — players hidden on mobile */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink">
        <div className="hidden sm:flex items-center gap-1 text-sm text-gray-300">
          <span>👥</span>
          <span>{playersOnline} jugador{playersOnline !== 1 ? 'es' : ''}</span>
        </div>
        <button
          onClick={onExit}
          className="bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          Salir
        </button>
      </div>
    </div>
  )
}
