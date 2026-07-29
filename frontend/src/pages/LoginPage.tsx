import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await authService.login({ email, password })
      const nombre = email.split('@')[0]
      setAuth(token, nombre)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-300 to-teal-400">
      {/* Decorative food emojis — hidden on mobile to avoid overflow */}
      <div className="absolute top-10 left-10 text-6xl float hidden sm:block">🥦</div>
      <div className="absolute top-20 right-20 text-5xl float hidden sm:block" style={{ animationDelay: '0.5s' }}>🍎</div>
      <div className="absolute bottom-20 left-20 text-5xl float hidden sm:block" style={{ animationDelay: '1s' }}>🥕</div>
      <div className="absolute bottom-10 right-10 text-6xl float hidden sm:block" style={{ animationDelay: '1.5s' }}>🍌</div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 bounce-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🌱</div>
          <h1 className="text-3xl font-bold text-emerald-700">Pequeños Sanos</h1>
          <p className="text-gray-500 mt-1">¡Aventuras saludables te esperan!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            {loading ? '⏳ Entrando...' : '🎮 ¡Jugar ahora!'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
