import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuthStore } from '../store/authStore'
import { perfilService, PerfilResponse } from '../api/perfilService'
import { reporteService, DatosReporteDashboard, PerfilReporte, RegistroMonedas } from '../api/reporteService'

const AVATAR_EMOJIS: Record<string, string> = {
  EXPLORER: '🧭', CHEF: '👨‍🍳', ATHLETE: '🏃', SCIENTIST: '🔬',
  ARTIST: '🎨', SUPERHERO: '🦸',
}

function avatarEmoji(codigo: string): string {
  return AVATAR_EMOJIS[codigo] || '🧒'
}

function formatMinutos(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function colorBarraSesion(perfil: PerfilReporte): string {
  const { estado, minutosJugados, limiteMinutos } = perfil.sesionHoy
  if (estado === 'SIN_SESION' || limiteMinutos <= 0) return 'bg-emerald-400'
  const pct = (minutosJugados / limiteMinutos) * 100
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-400'
  return 'bg-emerald-500'
}

function textoSesionHoy(perfil: PerfilReporte): string {
  const { estado, minutosJugados, limiteMinutos, minutosRestantes } = perfil.sesionHoy
  if (estado === 'SIN_SESION') return `No ha jugado hoy · límite ${limiteMinutos} min`
  return `${minutosJugados} de ${limiteMinutos} min usados · quedan ${minutosRestantes} min`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const nombreUsuario = useAuthStore((s) => s.nombreUsuario)
  const logout = useAuthStore((s) => s.logout)
  const [perfiles, setPerfiles] = useState<PerfilResponse[]>([])
  const [reporte, setReporte] = useState<DatosReporteDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({})

  useEffect(() => {
    Promise.all([perfilService.listar(), reporteService.dashboard()])
      .then(([perfilesRes, reporteRes]) => {
        setPerfiles(perfilesRes)
        setReporte(reporteRes)
      })
      .catch(() => setError('No se pudieron cargar los datos del panel'))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function toggleExpandido(perfilId: number) {
    setExpandidos((prev) => ({ ...prev, [perfilId]: !prev[perfilId] }))
  }

  function perfilIdNavegacion(rp: PerfilReporte): number {
    const idx = reporte?.perfiles.indexOf(rp) ?? -1
    const encontrado = idx >= 0 ? perfiles[idx] : undefined
    const p = encontrado ?? perfiles.find((x) => x.id === rp.perfilId)
    return p ? p.id : rp.perfilId
  }

  const totalMonedasSaldo = reporte?.perfiles.reduce((sum, p) => sum + p.saldoTotal, 0) ?? 0
  const tiempoTotalJugado = reporte?.perfiles.reduce(
    (sum, p) => sum + p.historialSesiones.reduce((acc, r) => acc + r.minutosJugados, 0),
    0
  ) ?? 0
  const totalMonedasHistoricas = reporte?.perfiles.reduce((sum, p) => sum + p.monedasTotalesGanadas, 0) ?? 0

  const historialGlobal: { nino: string; fecha: string; monedas: number }[] = (reporte?.perfiles ?? [])
    .flatMap((p) => p.historialMonedas.map((m) => ({ nino: p.nombrePerfil, fecha: m.fecha, monedas: m.monedas })))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
  const totalHistorialGlobal = historialGlobal.reduce((sum, r) => sum + r.monedas, 0)

  const mapaAlimentos = new Map<string, number>()
  reporte?.perfiles.forEach((p) =>
    p.alimentosFrecuentes.forEach((a) => mapaAlimentos.set(a.alimento, (mapaAlimentos.get(a.alimento) ?? 0) + a.veces))
  )
  const topAlimentos = [...mapaAlimentos.entries()]
    .map(([alimento, veces]) => ({ alimento, veces }))
    .sort((a, b) => b.veces - a.veces)
    .slice(0, 5)
  const maxAlimento = topAlimentos[0]?.veces ?? 1

  const tendenciaDias = (() => {
    const mapa = new Map<string, number>()
    reporte?.perfiles.forEach((p) =>
      p.historialMonedas.forEach((r) => mapa.set(r.fecha, (mapa.get(r.fecha) ?? 0) + r.monedas))
    )
    const dias: { fecha: string; label: string; monedas: number }[] = []
    const hoy = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i)
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      dias.push({ fecha: iso, label: d.toLocaleDateString('es-ES', { weekday: 'short' }), monedas: mapa.get(iso) ?? 0 })
    }
    return dias
  })()
  const maxTendencia = Math.max(...tendenciaDias.map((d) => d.monedas), 1)

  function ultimaY(doc: jsPDF, fallback: number): number {
    const t = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    return t ? t.finalY : fallback
  }

  function descargarReportePdf() {
    if (!reporte) return
    const doc = new jsPDF()
    const fechaGen = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

    doc.setFontSize(18)
    doc.setTextColor(6, 78, 59)
    doc.text('Reporte de Pequeños Sanos', 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(60)
    doc.text(`Fecha de generación: ${fechaGen}`, 14, 28)

    if (reporte.perfiles.length === 0) {
      doc.text('No hay datos disponibles para mostrar.', 14, 40)
      doc.save(`reporte-pequenos-sanos-${new Date().toISOString().slice(0, 10)}.pdf`)
      return
    }

    doc.setFontSize(14)
    doc.setTextColor(6, 78, 59)
    doc.text('Resumen global', 14, 40)
    autoTable(doc, {
      startY: 44,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de perfiles', String(reporte.perfiles.length)],
        ['Monedas acumuladas', String(totalMonedasSaldo)],
        ['Tiempo total jugado', formatMinutos(tiempoTotalJugado)],
        ['Monedas ganadas historicas', String(totalMonedasHistoricas)],
      ],
    })

    for (const p of reporte.perfiles) {
      const yBase = ultimaY(doc, 44) + 10
      if (yBase > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
      }
      doc.setFontSize(13)
      doc.setTextColor(6, 78, 59)
      doc.text(`${p.nombrePerfil} (${p.edadAnios} años)`, 14, yBase)

      autoTable(doc, {
        startY: yBase + 2,
        head: [['Dato', 'Valor']],
        body: [
          ['Saldo actual', `${p.saldoTotal} monedas`],
          ['Monedas ganadas hoy', String(p.monedasGanadasHoy)],
          ['Sesion de hoy', textoSesionHoy(p)],
          ['Sesiones extra', `${p.sesionesExtraHoy} de ${p.sesionesExtraCompradas} usadas`],
          ['Monedas totales ganadas', String(p.monedasTotalesGanadas)],
          ['Dias activos', String(p.diasActivos)],
          ['Alimentos del dia', p.alimentosDelDia.length > 0 ? p.alimentosDelDia.join(', ') : 'Sin registros'],
        ],
      })

      const yHist = ultimaY(doc, yBase) + 6
      if (yHist > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage()
      }
      doc.setFontSize(11)
      doc.setTextColor(60)
      doc.text('Historial de monedas', 14, yHist)

      if (p.historialMonedas.length === 0) {
        doc.setFontSize(10)
        doc.text('Sin movimientos registrados.', 14, yHist + 6)
      } else {
        autoTable(doc, {
          startY: yHist + 2,
          head: [['Fecha', 'Monedas']],
          body: p.historialMonedas.map((m) => [formatFecha(m.fecha), String(m.monedas)]),
          foot: [['Total', String(p.historialMonedas.reduce((s, m) => s + m.monedas, 0))]],
        })
      }
    }

    const yGlobal = ultimaY(doc, 44) + 10
    if (yGlobal > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage()
    }
    doc.setFontSize(14)
    doc.setTextColor(6, 78, 59)
    doc.text('Historial acumulado', 14, yGlobal)

    if (historialGlobal.length === 0) {
      doc.setFontSize(10)
      doc.setTextColor(60)
      doc.text('Sin movimientos registrados.', 14, yGlobal + 6)
    } else {
      autoTable(doc, {
        startY: yGlobal + 2,
        head: [['Niño', 'Fecha', 'Monedas']],
        body: historialGlobal.map((r) => [r.nino, formatFecha(r.fecha), String(r.monedas)]),
        foot: [['Total', '', String(totalHistorialGlobal)]],
      })
    }

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10)
    }

    doc.save(`reporte-pequenos-sanos-${new Date().toISOString().slice(0, 10)}.pdf`)
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
        {/* Banner de resumen acumulado */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 sm:p-6 text-white mb-6 sm:mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">¡Bienvenido de vuelta! 🎉</h2>
              <p className="opacity-90 text-sm sm:text-base">Panel de actividad familiar</p>
            </div>
            <button
              onClick={descargarReportePdf}
              disabled={!reporte}
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⬇️ Descargar reporte PDF
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/20 rounded-xl px-3 sm:px-4 py-2">
              <div className="text-xl sm:text-2xl font-bold">{reporte?.perfiles.length ?? 0}</div>
              <div className="text-[10px] sm:text-xs opacity-80">Perfiles</div>
            </div>
            <div className="bg-white/20 rounded-xl px-3 sm:px-4 py-2">
              <div className="text-xl sm:text-2xl font-bold">🪙 {totalMonedasSaldo}</div>
              <div className="text-[10px] sm:text-xs opacity-80">Monedas acumuladas</div>
            </div>
            <div className="bg-white/20 rounded-xl px-3 sm:px-4 py-2">
              <div className="text-xl sm:text-2xl font-bold">⏱️ {formatMinutos(tiempoTotalJugado)}</div>
              <div className="text-[10px] sm:text-xs opacity-80">Tiempo total jugado</div>
            </div>
            <div className="bg-white/20 rounded-xl px-3 sm:px-4 py-2">
              <div className="text-xl sm:text-2xl font-bold">✨ {totalMonedasHistoricas}</div>
              <div className="text-[10px] sm:text-xs opacity-80">Monedas ganadas históricas</div>
            </div>
          </div>
        </div>

        {/* Perfiles header */}
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
            <p>Cargando panel...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && reporte && reporte.perfiles.length === 0 && perfiles.length === 0 && (
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

        {!loading && !error && reporte && reporte.perfiles.length === 0 && perfiles.length > 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📊</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">Aún no hay datos de actividad</h4>
            <p className="text-gray-500">Cuando los niños empiecen a jugar, aquí verás sus estadísticas</p>
          </div>
        )}

        {reporte && reporte.perfiles.length > 0 && (
          <>
            {/* Grid de tarjetas por niño */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reporte.perfiles.map((perfil) => {
                const expandido = !!expandidos[perfil.perfilId]
                const pctSesion = perfil.sesionHoy.limiteMinutos > 0
                  ? Math.min(100, Math.round((perfil.sesionHoy.minutosJugados / perfil.sesionHoy.limiteMinutos) * 100))
                  : 0
                return (
                  <div
                    key={perfil.perfilId}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 border border-gray-100 flex flex-col"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                        {avatarEmoji(perfil.avatarCodigo)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 text-base sm:text-lg truncate">{perfil.nombrePerfil}</h4>
                        <p className="text-gray-500 text-xs sm:text-sm">{perfil.edadAnios} años</p>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-3">
                      <span>🪙 {perfil.saldoTotal} monedas</span>
                      <span className="text-emerald-600 font-medium">+{perfil.monedasGanadasHoy} hoy</span>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1.5">Alimentos del día 🥗</p>
                      {perfil.alimentosDelDia.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {perfil.alimentosDelDia.map((al) => (
                            <span key={al} className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs">
                              {al}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Sin alimentos registrados hoy</p>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1.5">Sesión de hoy 🎮</p>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colorBarraSesion(perfil)}`}
                          style={{ width: `${pctSesion}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5">{textoSesionHoy(perfil)}</p>
                    </div>

                    <p className="text-xs text-gray-500 mb-4">
                      Extras: {perfil.sesionesExtraHoy} de {perfil.sesionesExtraCompradas} usadas
                    </p>

                    <button
                      onClick={() => toggleExpandido(perfil.perfilId)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-medium mb-3 text-left"
                    >
                      {expandido ? '▲ Ocultar historial' : '▼ Ver historial de monedas'}
                    </button>

                    {expandido && (
                      <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>Total ganado</span>
                          <span className="font-bold text-emerald-700">✨ {perfil.monedasTotalesGanadas}</span>
                        </div>
                        {perfil.historialMonedas.length > 0 ? (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="py-1.5 font-medium">Fecha</th>
                                <th className="py-1.5 font-medium text-right">Monedas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {perfil.historialMonedas.map((m: RegistroMonedas) => (
                                <tr key={m.fecha} className="border-b border-gray-100 last:border-0">
                                  <td className="py-1.5 text-gray-600">{formatFecha(m.fecha)}</td>
                                  <td className="py-1.5 text-right text-gray-700 font-medium">+{m.monedas}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Sin movimientos registrados</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => navigate(`/game/${perfilIdNavegacion(perfil)}`)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-bold transition-colors text-xs sm:text-sm"
                      >
                        🎮 ¡Jugar!
                      </button>
                      <button
                        onClick={() => navigate(`/profiles/${perfilIdNavegacion(perfil)}`)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-xs sm:text-sm"
                      >
                        ⚙️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Historial completo acumulado */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">📜 Historial completo acumulado</h3>
              {historialGlobal.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="py-2 font-medium">Niño</th>
                          <th className="py-2 font-medium">Fecha</th>
                          <th className="py-2 font-medium text-right">Monedas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialGlobal.map((r, i) => (
                          <tr key={`${r.nino}-${r.fecha}-${i}`} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 text-gray-700">{r.nino}</td>
                            <td className="py-2 text-gray-600">{formatFecha(r.fecha)}</td>
                            <td className="py-2 text-right text-gray-700 font-medium">+{r.monedas}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td className="py-2 font-bold text-gray-800" colSpan={2}>Total</td>
                          <td className="py-2 text-right font-bold text-emerald-700">+{totalHistorialGlobal}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin movimientos registrados</p>
              )}
            </div>

            {/* Métricas BI */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base font-bold text-gray-800 mb-3">🥦 Top alimentos más consumidos</h3>
                {topAlimentos.length > 0 ? (
                  <div className="space-y-3">
                    {topAlimentos.map((a) => (
                      <div key={a.alimento}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="font-medium">{a.alimento}</span>
                          <span>{a.veces}×</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${Math.round((a.veces / maxAlimento) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sin datos de alimentos</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base font-bold text-gray-800 mb-3">📅 Días activos por niño</h3>
                <div className="space-y-3">
                  {reporte.perfiles.map((p) => (
                    <div key={p.perfilId}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span className="font-medium">{avatarEmoji(p.avatarCodigo)} {p.nombrePerfil}</span>
                        <span>{p.diasActivos} días</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, p.diasActivos * 8)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base font-bold text-gray-800 mb-3">📈 Tendencia últimos 7 días</h3>
                <div className="flex items-end justify-between gap-2 h-32">
                  {tendenciaDias.map((d) => (
                    <div key={d.fecha} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
                      <span className="text-[10px] text-gray-600 font-medium">{d.monedas > 0 ? d.monedas : ''}</span>
                      <div
                        className="w-full max-w-8 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all"
                        style={{ height: `${Math.max(4, Math.round((d.monedas / maxTendencia) * 100))}%` }}
                      />
                      <span className="text-[10px] text-gray-500 capitalize">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
