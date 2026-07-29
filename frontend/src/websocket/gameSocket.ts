import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

let stompClient: Client | null = null

export interface AvatarPosition {
  perfilId: number
  nombre: string
  x: number
  y: number
  direccion: string
  color: string
  avatarCodigo?: string
}

export interface TimerUpdate {
  perfilId: number
  minutosRestantes: number
  segundosRestantes: number
  totalSegundos: number
}

export interface MapaEstado {
  avatares: AvatarPosition[]
}

export interface AlimentoComidoEvento {
  alimentoId: number
  perfilId: number
  nombre: string
}

type OnTimerCb = (t: TimerUpdate) => void
type OnLogoutCb = () => void
type OnMapaCb = (e: MapaEstado) => void
type OnConnectCb = () => void
type OnAlimentoCb = (e: AlimentoComidoEvento) => void

let onTimerCallback: OnTimerCb | null = null
let onLogoutCallback: OnLogoutCb | null = null
let onMapaCallback: OnMapaCb | null = null
let onConnectCallback: OnConnectCb | null = null
let onAlimentoComidoCallback: OnAlimentoCb | null = null

export const gameSocket = {
  connect(perfilId: number) {
    if (stompClient?.connected) return

    const token = useAuthStore.getState().token
    const color = useGameStore.getState().avatarColor
    const avatarCodigo = useAuthStore.getState().avatarCodigo || undefined

    stompClient = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/game`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        console.log('[WS] ✅ Conectado al servidor. perfilId=', perfilId)

        // Subscribe to map state (all avatars) — backend publishes to /topic/mapa/mundo-1
        stompClient!.subscribe('/topic/mapa/mundo-1', (msg: IMessage) => {
          try {
            const estado: MapaEstado = JSON.parse(msg.body)
            if (import.meta.env.DEV) console.log('[WS] 🗺️ Broadcast recibido. Avatares:', estado.avatares.length, estado.avatares.map(a => `${a.nombre}(${a.perfilId})`))
            useGameStore.getState().setOtrosJugadores(
              estado.avatares.filter((a) => a.perfilId !== perfilId)
            )
            onMapaCallback?.(estado)
          } catch (e) {
            console.error('[WS] Error parsing mapa:', e)
          }
        })

        // Subscribe to food collected events — removes food from all clients
        stompClient!.subscribe('/topic/alimento/comido', (msg: IMessage) => {
          try {
            const evento: AlimentoComidoEvento = JSON.parse(msg.body)
            if (import.meta.env.DEV) console.log('[WS] 🍎 Alimento comido:', evento)
            onAlimentoComidoCallback?.(evento)
          } catch { /* ignore */ }
        })

        // Subscribe to personal timer
        stompClient!.subscribe(`/user/queue/timer`, (msg: IMessage) => {
          try {
            const timer: TimerUpdate = JSON.parse(msg.body)
            if (import.meta.env.DEV) console.log('[WS] ⏱️ Timer update:', timer)
            useGameStore.getState().setTimer(timer.minutosRestantes, timer.segundosRestantes)
            onTimerCallback?.(timer)
          } catch { /* ignore */ }
        })

        // Subscribe to force logout
        stompClient!.subscribe(`/user/queue/logout`, () => {
          if (import.meta.env.DEV) console.warn('[WS] 🚫 Force logout recibido')
          onLogoutCallback?.()
        })

        // Send initial position to register on the map — backend listens on /app/mover
        const initialPayload = { perfilId, nombre: useGameStore.getState().nombrePerfil || '', x: 600, y: 480, direccion: 'idle', color, avatarCodigo }
        console.log('[WS] 📍 Enviando posición inicial:', initialPayload)
        stompClient!.publish({
          destination: '/app/mover',
          body: JSON.stringify(initialPayload),
        })

        onConnectCallback?.()
      },
      onDisconnect: () => {
        console.log('[WS] ❌ Desconectado')
      },
      onStompError: (frame) => {
        console.error('[WS] 🔴 Error STOMP:', frame.headers['message'], frame)
      },
    })

    stompClient.activate()
  },

  sendMove(perfilId: number, nombre: string, x: number, y: number, direccion: string) {
    if (!stompClient?.connected) return
    const color = useGameStore.getState().avatarColor
    const avatarCodigo = useAuthStore.getState().avatarCodigo || undefined
    stompClient.publish({
      destination: '/app/mover',
      body: JSON.stringify({ perfilId, nombre, x, y, direccion, color, avatarCodigo }),
    })
  },

  sendAvatarChange(perfilId: number, avatarCodigo: string, color: string) {
    if (!stompClient?.connected) return
    stompClient.publish({
      destination: '/app/mover',
      body: JSON.stringify({
        perfilId,
        nombre: useGameStore.getState().nombrePerfil || '',
        x: 0, y: 0, direccion: 'idle',
        color,
        avatarCodigo,
      }),
    })
  },

  disconnect() {
    if (stompClient?.connected) {
      stompClient.deactivate()
    }
    stompClient = null
  },

  sendAlimentoComido(alimentoId: number, perfilId: number, nombre: string) {
    if (!stompClient?.connected) return
    stompClient.publish({
      destination: '/app/alimento/comer',
      body: JSON.stringify({ alimentoId, perfilId, nombre }),
    })
  },

  onTimer(cb: OnTimerCb) { onTimerCallback = cb },
  onLogout(cb: OnLogoutCb) { onLogoutCallback = cb },
  onMapa(cb: OnMapaCb) { onMapaCallback = cb },
  onConnect(cb: OnConnectCb) { onConnectCallback = cb },
  onAlimentoComido(cb: OnAlimentoCb) { onAlimentoComidoCallback = cb },
}
