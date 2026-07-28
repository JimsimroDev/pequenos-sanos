import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { perfilService, PerfilResponse } from '../api/perfilService'
import { sesionService } from '../api/sesionService'
import { recompensaService } from '../api/recompensaService'
import { consumoService } from '../api/consumoService'
import { pendingConsumos } from '../api/pendingConsumos'
import { gameSocket } from '../websocket/gameSocket'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import HUD from '../components/HUD'
import PhaserGame from '../game/PhaserGame'

/**
 * GameWrapper — orchestrates session init, WebSocket connection,
 * HUD rendering, and Phaser game lifecycle for a child profile.
 */
export default function GameWrapper() {
  const { perfilId: paramId } = useParams<{ perfilId: string }>()
  const navigate = useNavigate()
  const perfilId = Number(paramId)

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [gameReady, setGameReady] = useState(false)

  const setPerfilId = useGameStore((s) => s.setPerfilId)
  const setSaldo = useGameStore((s) => s.setSaldo)
  const setTimer = useGameStore((s) => s.setTimer)
  const resetGame = useGameStore((s) => s.resetGame)
  const setAvatarCodigo = useAuthStore((s) => s.setAvatarCodigo)
  const setAvatarColor = useAuthStore((s) => s.setAvatarColor)

  // Ref to handleExit so the interval can call it without stale closure
  const handleExitRef = useRef<() => void>(() => {})

  function handleExit() {
    gameSocket.disconnect()
    localStorage.removeItem('ps-last-session-score')
    resetGame()
    navigate('/dashboard')
  }

  // Keep ref up to date
  useEffect(() => {
    handleExitRef.current = handleExit
  })

  // Flush any pending consumptions from a previous session
  async function flushPendingConsumos() {
    const pending = pendingConsumos.getAll()
    if (pending.length === 0) return
    for (const item of pending) {
      try {
        await consumoService.registrar({ perfilId: item.perfilId, alimentoId: item.alimentoId })
        pendingConsumos.remove(item.perfilId, item.alimentoId)
      } catch {
        // Keep in queue for next attempt
      }
    }
    // Clean up the last-session fallback since we flushed successfully
    localStorage.removeItem('ps-last-session-score')
  }

  // Warn before closing tab — ensures pending HTTP calls can complete
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      // Save current session score to localStorage as fallback
      const { saldo, perfilId } = useGameStore.getState()
      if (perfilId && saldo > 0) {
        localStorage.setItem('ps-last-session-score', JSON.stringify({ perfilId, saldo, ts: Date.now() }))
      }
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Local countdown — ticks every second independently of WebSocket
  // When WS sends a timer update it overrides this (keeps in sync with server)
  useEffect(() => {
    if (!gameReady) return
    const interval = setInterval(() => {
      const { minutosRestantes, segundosRestantes } = useGameStore.getState()
      const totalSecs = minutosRestantes * 60 + segundosRestantes
      if (totalSecs <= 0) {
        clearInterval(interval)
        handleExitRef.current()
        return
      }
      const next = totalSecs - 1
      setTimer(Math.floor(next / 60), next % 60)
    }, 1000)
    return () => clearInterval(interval)
  }, [gameReady, setTimer])

  useEffect(() => {
    async function initSession() {
      try {
        // Load profile
        const profiles = await perfilService.listar()
        const found = profiles.find((p) => p.id === perfilId)
        if (!found) { setError('Perfil no encontrado'); setLoading(false); return }
        setPerfil(found)
        setPerfilId(found.id, found.nombre)
        // Persist avatar selection for next session
        setAvatarCodigo(found.avatarCodigo)
        setAvatarColor(useGameStore.getState().avatarColor)

        // Load balance
        try {
          const saldo = await recompensaService.saldo(perfilId)
          setSaldo(saldo.saldo)
        } catch { /* ignore, saldo starts at 0 */ }

        // Flush any pending consumptions from a previous interrupted session
        await flushPendingConsumos()

        // Re-fetch balance after flushing (coins may have been credited)
        try {
          const saldo = await recompensaService.saldo(perfilId)
          setSaldo(saldo.saldo)
        } catch { /* ignore */ }

        // Consult today's session first — only POST /iniciar if there is no session yet
        let sesion = await sesionService.estadoHoy(perfilId)

        if (sesion.estado === 'SIN_SESION') {
          // No session today — create one
          sesion = await sesionService.iniciar(perfilId)
        }

        // If time is exhausted, block access
        if (sesion.minutosRestantes <= 0 || sesion.estado === 'CERRADA') {
          setError('Este perfil ya agotó su tiempo de pantalla por hoy. ¡Vuelve mañana! 😴')
          setLoading(false)
          return
        }

        setTimer(sesion.minutosRestantes, 0)

        // Connect WebSocket
        gameSocket.connect(perfilId)
        gameSocket.onTimer((t) => setTimer(t.minutosRestantes, t.segundosRestantes))
        gameSocket.onLogout(() => handleExit())

        setGameReady(true)
        setLoading(false)
      } catch (err: any) {
        setError(err.response?.data?.mensaje || 'Error al iniciar la sesión de juego')
        setLoading(false)
      }
    }

    initSession()

    return () => {
      gameSocket.disconnect()
      resetGame()
    }
  }, [perfilId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <p className="text-xl font-bold">Preparando la aventura...</p>
          <p className="text-gray-400 mt-2">Conectando al servidor de juego</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white max-w-md mx-4">
          <div className="text-6xl mb-4">😴</div>
          <h2 className="text-2xl font-bold mb-3">Ups...</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            🏠 Volver al panel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {perfil && (
        <HUD
          perfilId={perfilId}
          nombrePerfil={perfil.nombre}
          onExit={handleExit}
        />
      )}
      {gameReady && perfil && (
        <div className="flex-1 flex items-center justify-center p-2">
          <PhaserGame
            perfilId={perfilId}
            nombrePerfil={perfil.nombre}
            avatarCodigo={perfil.avatarCodigo}
            onExit={handleExit}
          />
        </div>
      )}
    </div>
  )
}
