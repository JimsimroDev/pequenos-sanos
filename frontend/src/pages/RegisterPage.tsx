import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../api/authService'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      await authService.registro({ nombre, email, password })
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-300 to-orange-400">
      <div className="absolute top-10 left-10 text-6xl float hidden sm:block">🍓</div>
      <div className="absolute top-20 right-20 text-5xl float hidden sm:block" style={{ animationDelay: '0.5s' }}>🥑</div>
      <div className="absolute bottom-20 left-20 text-5xl float hidden sm:block" style={{ animationDelay: '1s' }}>🍊</div>
      <div className="absolute bottom-10 right-10 text-6xl float hidden sm:block" style={{ animationDelay: '1.5s' }}>🫐</div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 bounce-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🌟</div>
          <h1 className="text-3xl font-bold text-purple-700">¡Únete!</h1>
          <p className="text-gray-500 mt-1">Crea tu cuenta de papá/mamá</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tu nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="María García"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors"
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
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-bold py-3 rounded-xl transition-colors text-lg"
          >
            {loading ? '⏳ Creando cuenta...' : '🚀 Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-purple-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
