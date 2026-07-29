import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  nombreUsuario: string | null
  avatarCodigo: string | null
  avatarColor: string | null
  setAuth: (token: string, nombre: string) => void
  setAvatarCodigo: (codigo: string) => void
  setAvatarColor: (color: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      nombreUsuario: null,
      avatarCodigo: null,
      avatarColor: null,
      setAuth: (token, nombreUsuario) => set({ token, nombreUsuario }),
      setAvatarCodigo: (avatarCodigo) => set({ avatarCodigo }),
      setAvatarColor: (avatarColor) => set({ avatarColor }),
      logout: () => set({ token: null, nombreUsuario: null, avatarCodigo: null, avatarColor: null }),
    }),
    { name: 'ps-auth' }
  )
)
