import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  nombreUsuario: string | null
  setAuth: (token: string, nombre: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      nombreUsuario: null,
      setAuth: (token, nombreUsuario) => set({ token, nombreUsuario }),
      logout: () => set({ token: null, nombreUsuario: null }),
    }),
    { name: 'ps-auth' }
  )
)
