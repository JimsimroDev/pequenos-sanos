import http from './http'

export interface ConsumoPayload {
  perfilId: number
  alimentoId: number
}

export interface ConsumoResponse {
  id: number
  nombreAlimento: string
  fechaConsumo: string
  puntosReward: number
  procesado: boolean
}

export const consumoService = {
  async registrar(data: ConsumoPayload): Promise<ConsumoResponse> {
    const res = await http.post('/api/v1/consumos', data)
    return res.data
  },
  async historial(perfilId: number): Promise<ConsumoResponse[]> {
    const res = await http.get(`/api/v1/consumos/perfil/${perfilId}`)
    return res.data
  },
}
