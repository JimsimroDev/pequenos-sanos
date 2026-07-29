import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import BackendStatus from './components/BackendStatus'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import NewProfilePage from './pages/NewProfilePage'
import GameWrapper from './pages/GameWrapper'

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={<RequireAuth><DashboardPage /></RequireAuth>}
        />
        <Route
          path="/profiles/new"
          element={<RequireAuth><NewProfilePage /></RequireAuth>}
        />
        <Route
          path="/profiles/:id"
          element={<RequireAuth><ProfilePage /></RequireAuth>}
        />
        <Route
          path="/game/:perfilId"
          element={<RequireAuth><GameWrapper /></RequireAuth>}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <BackendStatus />
    </HashRouter>
  )
}
