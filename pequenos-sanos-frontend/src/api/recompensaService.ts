import http from './http'

export interface SaldoResponse {
  perfilId: number
  nombrePerfil: string
  saldo: number
}

export const recompensaService = {
  async saldo(perfilId: number): Promise<SaldoResponse> {
    const res = await http.get(`/api/v1/recompensas/perfil/${perfilId}/saldo`)
    return res.data
  },
}
