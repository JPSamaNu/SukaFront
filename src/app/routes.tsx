import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import PublicRoute from '@/features/auth/PublicRoute'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import MainLayout from '@/features/layout/MainLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'
import GenerationsPage from '@/features/generations/GenerationsPage'
import GenerationDetailsPage from '@/features/generations/GenerationDetailsPage'
import PokedexPage from '@/features/pokedex/PokedexPage'
import PokemonDetailsPage from '@/features/pokedex/PokemonDetailsPage'
import TypesTablePage from '@/features/types/TypesTablePage'

export const router = createBrowserRouter([
  // Rutas públicas (login, registro, etc.)
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  // Rutas protegidas
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'generations',
            element: <GenerationsPage />,
          },
          {
            path: 'generation/:id',
            element: <GenerationDetailsPage />,
          },
          {
            path: 'generation',
            element: <PokedexPage />,
          },
          {
            path: 'generation/:name',
            element: <PokemonDetailsPage />,
          },
          {
            path: 'pokemon/:id',
            element: <PokemonDetailsPage />,
          },
          {
            path: 'types',
            element: <TypesTablePage />,
          },
        ],
      },
    ],
  },
  // Ruta catch-all para 404
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-[color:var(--surface-2)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[color:var(--text)] mb-4">404</h1>
          <p className="text-[color:var(--muted)] mb-6">Página no encontrada</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] rounded-lg hover:opacity-95 transition-opacity"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    ),
  },
])