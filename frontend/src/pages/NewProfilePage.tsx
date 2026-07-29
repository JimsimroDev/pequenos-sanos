import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { perfilService } from '../api/perfilService'

const AVATARES = [
  { codigo: 'EXPLORER', emoji: '🧭', nombre: 'Explorador' },
  { codigo: 'CHEF', emoji: '👨‍🍳', nombre: 'Chef' },
  { codigo: 'ATHLETE', emoji: '🏃', nombre: 'Atleta' },
  { codigo: 'SCIENTIST', emoji: '🔬', nombre: 'Científico' },
  { codigo: 'ARTIST', emoji: '🎨', nombre: 'Artista' },
  { codigo: 'SUPERHERO', emoji: '🦸', nombre: 'Superhéroe' },
]

export default function NewProfilePage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [edadAnios, setEdadAnios] = useState(3)
  const [avatarCodigo, setAvatarCodigo] = useState('EXPLORER')
  const [screenTimeLimit, setScreenTimeLimit] = useState(30)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await perfilService.crear({ nombre, edadAnios, avatarCodigo, screenTimeLimit })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al crear el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-6 sm:py-8">
      <div className="max-w-xl mx-auto px-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700 mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
          ← Volver al panel
        </button>

        <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-4xl sm:text-5xl mb-3">👶</div>
            <h1 className="text-xl sm:text-2xl font-bold text-orange-700">Nuevo perfil infantil</h1>
            <p className="text-gray-500 text-sm sm:text-base">Configura la aventura de tu pequeño</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del niño/a</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Sofía, Carlos..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Edad: <span className="text-orange-600 font-bold">{edadAnios} años</span>
              </label>
              <input
                type="range"
                min={2}
                max={4}
                value={edadAnios}
                onChange={(e) => setEdadAnios(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>2 años</span><span>3 años</span><span>4 años</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Elige el avatar</label>
              <div className="grid grid-cols-3 gap-3">
                {AVATARES.map((av) => (
                  <button
                    key={av.codigo}
                    type="button"
                    onClick={() => setAvatarCodigo(av.codigo)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      avatarCodigo === av.codigo
                        ? 'border-orange-400 bg-orange-50 scale-105'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <div className="text-3xl mb-1">{av.emoji}</div>
                    <div className="text-xs font-medium text-gray-600">{av.nombre}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tiempo de pantalla diario: <span className="text-orange-600 font-bold">{screenTimeLimit} min</span>
              </label>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={screenTimeLimit}
                onChange={(e) => setScreenTimeLimit(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10 min</span><span>1 hora</span><span>2 horas</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 rounded-xl transition-colors text-lg"
            >
              {loading ? '⏳ Creando...' : '✨ Crear perfil'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
