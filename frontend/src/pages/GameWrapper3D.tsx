import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'
import GameCanvas from '../game/r3f/GameCanvas'

export default function GameWrapper3D() {
  const { perfilId } = useParams()
  const navigate = useNavigate()
  const auth = useAuthStore()
  const game = useGameStore()

  const id = Number(perfilId)
  const nombrePerfil = auth.nombreUsuario || `Perfil ${id}`
  const avatarCodigo = auth.avatarCodigo || 'TWILIGHT'
  const avatarColor = auth.avatarColor || game.avatarColor || '#ef4444'

  return (
    <GameCanvas
      perfilId={id}
      nombrePerfil={nombrePerfil}
      avatarCodigo={avatarCodigo}
      avatarColor={avatarColor}
      onExit={() => navigate('/dashboard')}
    />
  )
}
