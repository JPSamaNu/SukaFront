import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Skeleton } from '@/shared/components/ui/skeleton'

/**
 * Componente que protege rutas requiriendo autenticación
 * Si no está inicializado o está cargando, muestra skeleton
 * Si no hay token, redirige a /login
 * Si hay token, renderiza las rutas hijas
 */
export default function ProtectedRoute() {
  const { token, loading, isInitialized } = useAuth()

  // Mostrar loading mientras se inicializa o procesa autenticación
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-[color:var(--surface-2)] p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Si hay token, renderizar las rutas protegidas
  return <Outlet />
}