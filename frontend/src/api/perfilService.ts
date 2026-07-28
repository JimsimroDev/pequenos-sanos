import http from './http'

export interface PerfilResponse {
  id: number
  nombre: string
  edadAnios: number
  avatarCodigo: string
  screenTimeLimit: number
  monedasSaldo: number
}

export interface CrearPerfilPayload {
  nombre: string
  edadAnios: number
  avatarCodigo: string
  screenTimeLimit: number
}

export const perfilService = {
  async listar(): Promise<PerfilResponse[]> {
    const res = await http.get('/api/v1/perfiles')
    return res.data
  },
  async crear(data: CrearPerfilPayload): Promise<PerfilResponse> {
    const res = await http.post('/api/v1/perfiles', data)
    return res.data
  },
  async actualizar(id: number, data: Partial<CrearPerfilPayload>): Promise<PerfilResponse> {
    const res = await http.put(`/api/v1/perfiles/${id}`, data)
    return res.data
  },
}
