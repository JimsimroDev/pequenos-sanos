import http from './http'

export interface RegistroPayload {
  nombre: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  async registro(data: RegistroPayload) {
    const res = await http.post('/api/v1/auth/registro', data)
    return res.data
  },
  async login(data: LoginPayload): Promise<{ token: string }> {
    const res = await http.post('/api/v1/auth/login', data)
    return res.data
  },
}
