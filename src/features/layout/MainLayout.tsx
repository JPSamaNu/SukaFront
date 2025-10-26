import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { useTheme } from '@/shared/theme/useTheme'
import { Logo } from '@/shared/brand/Logo'
import { Button } from '@/shared/components/ui/button'

export default function MainLayout() {
  const { logout } = useAuth()
  const { theme, toggle } = useTheme()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-[color:var(--surface-2)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[color:var(--card-border)] bg-[color:var(--surface)]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Logo variant="full" className="h-8" withBackground />
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-3">
              {/* Toggle de tema */}
              <button 
                onClick={toggle}
                className="px-3 py-1 rounded-xl border border-[color:var(--card-border)] bg-[color:var(--surface-2)] text-[color:var(--text)] hover:bg-[color:var(--surface-2)]/80 transition-colors"
              >
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </button>
              
              {/* Botón de logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}