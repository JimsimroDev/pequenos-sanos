import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { perfilService, PerfilResponse } from '../api/perfilService'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null)
  const [screenTimeLimit, setScreenTimeLimit] = useState(30)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    perfilService.listar().then((lista) => {
      const found = lista.find((p) => p.id === Number(id))
      if (found) {
        setPerfil(found)
        setScreenTimeLimit(found.screenTimeLimit)
      }
      setLoading(false)
    })
  }, [id])

  async function handleSave() {
    if (!perfil) return
    setSaving(true)
    try {
      await perfilService.actualizar(perfil.id, { screenTimeLimit })
      setMessage('✅ Guardado correctamente')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('❌ Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const AVATAR_EMOJIS: Record<string, string> = {
    EXPLORER: '🧭', CHEF: '👨‍🍳', ATHLETE: '🏃', SCIENTIST: '🔬',
    ARTIST: '🎨', SUPERHERO: '🦸',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3">⏳</div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Perfil no encontrado</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-emerald-600 hover:underline">
            Volver al panel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 sm:py-8">
      <div className="max-w-xl mx-auto px-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700 mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base">
          ← Volver al panel
        </button>

        <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-3">{AVATAR_EMOJIS[perfil.avatarCodigo] || '🧒'}</div>
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">{perfil.nombre}</h1>
            <p className="text-gray-500 text-sm sm:text-base">{perfil.edadAnios} años · 🪙 {perfil.monedasSaldo} monedas</p>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-2xl p-4">
              <h3 className="font-semibold text-indigo-800 mb-3">⏱ Control de tiempo de pantalla</h3>
              <label className="block text-sm text-gray-600 mb-2">
                Límite diario: <strong className="text-indigo-600">{screenTimeLimit} minutos</strong>
              </label>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={screenTimeLimit}
                onChange={(e) => setScreenTimeLimit(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10 min</span><span>1 hora</span><span>2 horas</span>
              </div>
            </div>

            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm text-center">
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {saving ? '⏳ Guardando...' : '💾 Guardar cambios'}
              </button>
              <button
                onClick={() => navigate(`/game/${perfil.id}`)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                🎮 ¡Jugar!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
