import http from './http'

export type CategoriaAlimento = 'FRUTA' | 'VERDURA' | 'PROTEINA' | 'CEREAL'

export interface AlimentoResponse {
  id: number
  nombre: string
  categoria: CategoriaAlimento
  descripcion: string
  puntosReward: number
}

export const SUPERPODERS: Record<CategoriaAlimento, { emoji: string; nombre: string; descripcion: string; color: string }> = {
  FRUTA: {
    emoji: '⚡',
    nombre: 'Super Velocidad',
    descripcion: '¡Las frutas te dan energía explosiva! Tu personaje se mueve más rápido por 30 segundos.',
    color: '#f59e0b',
  },
  VERDURA: {
    emoji: '🛡️',
    nombre: 'Escudo Verde',
    descripcion: '¡Las verduras fortalecen tu sistema inmune! Tienes un escudo protector por 30 segundos.',
    color: '#10b981',
  },
  PROTEINA: {
    emoji: '💪',
    nombre: 'Super Fuerza',
    descripcion: '¡Las proteínas construyen tus músculos! Tu personaje es más grande y fuerte por 30 segundos.',
    color: '#ef4444',
  },
  CEREAL: {
    emoji: '🧠',
    nombre: 'Mente Brillante',
    descripcion: '¡Los cereales alimentan tu cerebro! Ves mejor el mapa y encuentras más comida por 30 segundos.',
    color: '#8b5cf6',
  },
}

export const alimentoService = {
  async listar(categoria?: CategoriaAlimento): Promise<AlimentoResponse[]> {
    const params = categoria ? { categoria } : {}
    const res = await http.get('/api/v1/alimentos', { params })
    return res.data
  },
  async obtener(id: number): Promise<AlimentoResponse> {
    const res = await http.get(`/api/v1/alimentos/${id}`)
    return res.data
  },
}
