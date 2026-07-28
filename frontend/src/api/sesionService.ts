import http from './http'

export interface SesionResponse {
  id: number | null
  perfilId: number
  minutosJugados: number
  limitMinutos: number
  minutosRestantes: number
  estado: 'ACTIVA' | 'CERRADA' | 'SIN_SESION'
}

export const sesionService = {
  async iniciar(perfilId: number): Promise<SesionResponse> {
    const res = await http.post(`/api/v1/sesiones/iniciar/${perfilId}`)
    return res.data
  },
  async estadoHoy(perfilId: number): Promise<SesionResponse> {
    const res = await http.get(`/api/v1/sesiones/perfil/${perfilId}/hoy`)
    return res.data
  },
}
