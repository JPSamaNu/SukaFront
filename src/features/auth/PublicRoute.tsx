import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Skeleton } from '@/shared/components/ui/skeleton'

/**
 * Componente que maneja rutas públicas (como login)
 * Si no está inicializado, muestra skeleton
 * Si ya está autenticado, redirige a la ruta raíz
 * Si no está autenticado, renderiza las rutas públicas
 */
export default function PublicRoute() {
  const { token, isInitialized, loading } = useAuth()

  // Mostrar loading mientras se inicializa la autenticación
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-[color:var(--surface-2)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[color:var(--card-bg)] rounded-xl border border-[color:var(--card-border)] shadow-soft p-6">
            <div className="text-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <div className="space-y-4 pt-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, redirigir a la raíz
  if (token) {
    return <Navigate to="/" replace />
  }

  // Si no está autenticado, renderizar las rutas públicas
  return <Outlet />
}