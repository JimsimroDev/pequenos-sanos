import { create } from 'zustand'

export interface AvatarState {
  perfilId: number
  nombre: string
  x: number
  y: number
  direccion: string
  color: string
}

interface GameState {
  perfilId: number | null
  nombrePerfil: string | null
  saldo: number
  minutosRestantes: number
  segundosRestantes: number
  avatarColor: string
  otrosJugadores: AvatarState[]
  setPerfilId: (id: number, nombre: string) => void
  setSaldo: (saldo: number) => void
  setTimer: (minutos: number, segundos: number) => void
  setAvatarColor: (color: string) => void
  setOtrosJugadores: (avatares: AvatarState[]) => void
  resetGame: () => void
}

const COLORES_AVATARES = ['#ef4444','#3b82f6','#f59e0b','#10b981','#8b5cf6','#ec4899']

export const useGameStore = create<GameState>((set) => ({
  perfilId: null,
  nombrePerfil: null,
  saldo: 0,
  minutosRestantes: 0,
  segundosRestantes: 0,
  avatarColor: COLORES_AVATARES[Math.floor(Math.random() * COLORES_AVATARES.length)],
  otrosJugadores: [],
  setPerfilId: (id, nombre) => set({ perfilId: id, nombrePerfil: nombre }),
  setSaldo: (saldo) => set({ saldo }),
  setTimer: (minutos, segundos) => set({ minutosRestantes: minutos, segundosRestantes: segundos }),
  setAvatarColor: (color) => set({ avatarColor: color }),
  setOtrosJugadores: (avatares) => set({ otrosJugadores: avatares }),
  resetGame: () => set({
    perfilId: null, nombrePerfil: null, saldo: 0,
    minutosRestantes: 0, segundosRestantes: 0, otrosJugadores: []
  }),
}))

export { COLORES_AVATARES }
