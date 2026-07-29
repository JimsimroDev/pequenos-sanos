import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'
const HEALTH_POLL_INTERVAL = 840000 // 14 minutes — Render free tier sleeps at 15 min
const INITIAL_CHECK_DELAY = 3000 // 3 seconds after mount

type HealthStatus = 'checking' | 'healthy' | 'degraded' | 'unreachable'

interface BackendInfo {
  version?: string
  app?: { version?: string }
}

export default function BackendStatus() {
  const [health, setHealth] = useState<HealthStatus>('checking')
  const [version, setVersion] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkHealth() {
      try {
        const res = await fetch(`${BASE_URL}/actuator/health`, {
          signal: AbortSignal.timeout?.(10000) || AbortSignal.timeout(10000),
        })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setHealth(data.status === 'UP' ? 'healthy' : 'degraded')
        } else {
          setHealth('degraded')
        }
      } catch {
        if (mounted) setHealth('unreachable')
      }
    }

    async function fetchInfo() {
      try {
        const res = await fetch(`${BASE_URL}/actuator/info`, {
          signal: AbortSignal.timeout?.(10000) || AbortSignal.timeout(10000),
        })
        if (!mounted || !res.ok) return
        const data: BackendInfo = await res.json()
        const ver = data?.app?.version || data?.version || ''
        if (ver && mounted) setVersion(ver)
      } catch {
        // silently fail — version is bonus info
      }
    }

    // Initial check after delay
    const initTimer = setTimeout(() => {
      checkHealth()
      fetchInfo()
    }, INITIAL_CHECK_DELAY)

    // Periodic health poll every 14 minutes
    const interval = setInterval(checkHealth, HEALTH_POLL_INTERVAL)

    return () => {
      mounted = false
      clearTimeout(initTimer)
      clearInterval(interval)
    }
  }, [])

  const dotColor = {
    checking: 'bg-yellow-400',
    healthy: 'bg-green-400',
    degraded: 'bg-yellow-500',
    unreachable: 'bg-red-500',
  }[health]

  const dotPulse = health === 'healthy' ? 'animate-pulse' : ''

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-1.5 bg-gray-900/80 hover:bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10 transition-colors"
        title={`Backend: ${health}${version ? ` v${version}` : ''}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${dotPulse}`} />
        <span className="font-semibold uppercase tracking-wider text-[9px] text-yellow-300">BETA</span>
        {version && <span className="text-gray-400">v{version.replace(/^v/, '')}</span>}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-white/10 whitespace-nowrap">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="font-medium">
              {health === 'healthy' && 'Servidor disponible'}
              {health === 'degraded' && 'Servidor degradado'}
              {health === 'unreachable' && 'Servidor no disponible'}
              {health === 'checking' && 'Verificando...'}
            </span>
          </div>
          {version && (
            <div className="text-gray-400 text-[10px]">
              Versión {version.replace(/^v/, '')} — BETA
            </div>
          )}
          <div className="text-gray-500 text-[9px] mt-1">
            Render se mantiene activo cada 14 min
          </div>
        </div>
      )}
    </div>
  )
}
