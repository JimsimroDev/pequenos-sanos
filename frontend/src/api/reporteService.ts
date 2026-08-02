import http from './http'

export type EstadoSesion = 'ACTIVA' | 'CERRADA' | 'SIN_SESION'

export interface SesionHoy {
  minutosJugados: number
  limiteMinutos: number
  minutosRestantes: number
  estado: EstadoSesion
}

export interface RegistroMonedas {
  fecha: string
  monedas: number
}

export interface RegistroSesion {
  fecha: string
  minutosJugados: number
}

export interface AlimentoFrecuente {
  alimento: string
  veces: number
}

export interface PerfilReporte {
  perfilId: number
  nombrePerfil: string
  edadAnios: number
  avatarCodigo: string
  saldoTotal: number
  monedasGanadasHoy: number
  alimentosDelDia: string[]
  sesionHoy: SesionHoy
  sesionesExtraHoy: number
  sesionesExtraCompradas: number
  monedasTotalesGanadas: number
  diasActivos: number
  historialMonedas: RegistroMonedas[]
  historialSesiones: RegistroSesion[]
  alimentosFrecuentes: AlimentoFrecuente[]
}

export interface DatosReporteDashboard {
  perfiles: PerfilReporte[]
}

export const reporteService = {
  async dashboard(): Promise<DatosReporteDashboard> {
    const res = await http.get('/api/v1/reportes/dashboard')
    return res.data
  },
}
