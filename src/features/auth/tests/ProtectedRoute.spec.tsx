import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'

// Mock del hook useAuth
const mockUseAuth = vi.fn()
vi.mock('../AuthContext', async () => {
  const actual = await vi.importActual('../AuthContext')
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  }
})

// Componente de prueba que se renderiza cuando la ruta está protegida
const TestProtectedComponent = () => <div>Contenido protegido</div>

// Helper para renderizar ProtectedRoute con el router
const renderProtectedRoute = () => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Página de login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<TestProtectedComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  it('muestra skeleton cuando está cargando', () => {
    // Mock del estado de loading
    mockUseAuth.mockReturnValue({
      token: null,
      loading: true,
    })

    renderProtectedRoute()

    // Verificar que se muestra el loading skeleton
    // Como los skeletons usan clases CSS, verificamos la estructura
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument()
  })

  it('redirige a /login cuando no hay token', () => {
    // Mock del estado sin token
    mockUseAuth.mockReturnValue({
      token: null,
      loading: false,
    })

    renderProtectedRoute()

    // Verificar que se redirige al login
    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('renderiza el contenido protegido cuando hay token', () => {
    // Mock del estado con token válido
    mockUseAuth.mockReturnValue({
      token: 'valid-token',
      loading: false,
    })

    renderProtectedRoute()

    // Verificar que se muestra el contenido protegido
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument()
  })

  it('maneja correctamente la transición de loading a autenticado', () => {
    // Empezar con loading
    mockUseAuth.mockReturnValue({
      token: null,
      loading: true,
    })

    const { rerender } = renderProtectedRoute()

    // Verificar estado de loading (no debe mostrar contenido)
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument()

    // Cambiar a estado autenticado
    mockUseAuth.mockReturnValue({
      token: 'valid-token',
      loading: false,
    })

    rerender(
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Página de login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TestProtectedComponent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    // Verificar que se muestra el contenido protegido
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('maneja correctamente la transición de loading a no autenticado', () => {
    // Empezar con loading
    mockUseAuth.mockReturnValue({
      token: null,
      loading: true,
    })

    const { rerender } = renderProtectedRoute()

    // Verificar estado de loading
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument()

    // Cambiar a estado no autenticado
    mockUseAuth.mockReturnValue({
      token: null,
      loading: false,
    })

    rerender(
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Página de login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TestProtectedComponent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    )

    // Verificar que se redirige al login
    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })
})