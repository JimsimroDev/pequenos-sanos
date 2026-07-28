import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { perfilService, PerfilResponse } from '../api/perfilService'

export default function DashboardPage() {
  const navigate = useNavigate()
  const nombreUsuario = useAuthStore((s) => s.nombreUsuario)
  const logout = useAuthStore((s) => s.logout)
  const [perfiles, setPerfiles] = useState<PerfilResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    perfilService.listar()
      .then(setPerfiles)
      .catch(() => setError('No se pudieron cargar los perfiles'))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const AVATAR_EMOJIS: Record<string, string> = {
    EXPLORER: '🧭', CHEF: '👨‍🍳', ATHLETE: '🏃', SCIENTIST: '🔬',
    ARTIST: '🎨', SUPERHERO: '🦸',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-2xl sm:text-3xl flex-shrink-0">🌱</span>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-emerald-700 truncate">Pequeños Sanos</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">Panel de control familiar</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <span className="text-gray-600 text-xs sm:text-sm hidden sm:inline">👋 Hola, <strong>{nombreUsuario}</strong></span>
            <button
              onClick={handleLogout}
              className="bg-red-100 text-red-600 hover:bg-red-200 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 sm:p-6 text-white mb-6 sm:mb-8 shadow-lg">
          <h2 className="text-lg sm:text-2xl font-bold mb-1">¡Bienvenido de vuelta! 🎉</h2>
          <p className="opacity-90 text-sm sm:text-base">Selecciona un perfil infantil para empezar a jugar</p>
          <div className="mt-3 sm:mt-4 flex gap-4 sm:gap-6">
            <div className="bg-white/20 rounded-xl px-3 sm:px-4 py-2">
              <div className="text-xl sm:text-2xl font-bold">{perfiles.length}</div>
              <div className="text-[10px] sm:text-xs opacity-80">Perfiles</div>
            </div>
            <div className="bg-white/20 rounded-xl px-3 sm:px-4 py-2">
              <div className="text-xl sm:text-2xl font-bold">
                {perfiles.reduce((sum, p) => sum + p.monedasSaldo, 0)}
              </div>
              <div className="text-[10px] sm:text-xs opacity-80">Monedas totales 🪙</div>
            </div>
          </div>
        </div>

        {/* Profiles grid */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Perfiles infantiles</h3>
          <button
            onClick={() => navigate('/profiles/new')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <span>+</span> Nuevo perfil
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">⏳</div>
            <p>Cargando perfiles...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            ⚠️ {error}
          </div>
        )}

        {!loading && perfiles.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">👶</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No hay perfiles aún</h4>
            <p className="text-gray-500 mb-6">Crea el primer perfil para que tu hijo pueda jugar</p>
            <button
              onClick={() => navigate('/profiles/new')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              Crear primer perfil
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {perfiles.map((perfil) => (
            <div
              key={perfil.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 border border-gray-100"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                  {AVATAR_EMOJIS[perfil.avatarCodigo] || '🧒'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-800 text-base sm:text-lg truncate">{perfil.nombre}</h4>
                  <p className="text-gray-500 text-xs sm:text-sm">{perfil.edadAnios} años</p>
                </div>
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                <span>🪙 {perfil.monedasSaldo} monedas</span>
                <span>⏱ {perfil.screenTimeLimit} min/día</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/game/${perfil.id}`)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-bold transition-colors text-xs sm:text-sm"
                >
                  🎮 ¡Jugar!
                </button>
                <button
                  onClick={() => navigate(`/profiles/${perfil.id}`)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-xs sm:text-sm"
                >
                  ⚙️
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
