import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'
import { AuthProvider } from '../AuthContext'
import { api } from '@/shared/api/axios'

// Mock del módulo axios
vi.mock('@/shared/api/axios', () => ({
  api: {
    post: vi.fn(),
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}))

// Mock de react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Helper para renderizar LoginPage con providers necesarios
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente los elementos de la página', () => {
    renderLoginPage()

    // Verificar que se muestran los elementos principales
    expect(screen.getByRole('heading', { name: /sukadex/i })).toBeInTheDocument()
    expect(screen.getByText(/inicia sesión para acceder/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra errores de validación para campos vacíos', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    // Intentar enviar formulario sin llenar campos
    await user.click(submitButton)

    // Verificar que se muestran los errores de validación
    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('muestra error de validación para email inválido', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    // Escribir email inválido
    await user.type(emailInput, 'email-invalido')
    await user.click(submitButton)

    // Verificar error de validación
    await waitFor(() => {
      expect(screen.getByText(/debe ser un email válido/i)).toBeInTheDocument()
    })
  })

  it('muestra error de validación para contraseña corta', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    // Escribir email válido y contraseña corta
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    // Verificar error de validación
    await waitFor(() => {
      expect(screen.getByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument()
    })
  })

  it('envía datos correctos al backend en login exitoso', async () => {
    const user = userEvent.setup()
    
    // Mock de respuesta exitosa
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { accessToken: 'fake-token' }
    })

    renderLoginPage()

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    // Llenar formulario con datos válidos
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Verificar que se llama al API con los datos correctos
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      })
    })

    // Verificar que se navega a la página principal
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('muestra error cuando el login falla', async () => {
    const user = userEvent.setup()
    
    // Mock de respuesta de error
    vi.mocked(api.post).mockRejectedValueOnce({
      response: {
        data: { message: 'Credenciales incorrectas' }
      }
    })

    renderLoginPage()

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    // Llenar formulario y enviar
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    // Verificar que se muestra el error
    await waitFor(() => {
      expect(screen.getByText(/credenciales incorrectas/i)).toBeInTheDocument()
    })

    // Verificar que no se navega
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('deshabilita el botón durante el envío', async () => {
    const user = userEvent.setup()
    
    // Mock que nunca se resuelve para simular loading
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(() => {}))

    renderLoginPage()

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    // Llenar formulario
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    // Verificar que el botón está habilitado inicialmente
    expect(submitButton).not.toBeDisabled()
    
    // Enviar formulario
    await user.click(submitButton)

    // Verificar que el botón se deshabilita y cambia el texto
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/iniciando sesión.../i)).toBeInTheDocument()
    })
  })

  it('limpia errores cuando el usuario empieza a escribir', async () => {
    const user = userEvent.setup()
    
    // Mock de respuesta de error
    vi.mocked(api.post).mockRejectedValueOnce({
      response: {
        data: { message: 'Error de prueba' }
      }
    })

    renderLoginPage()

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    // Llenar formulario y generar error
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Esperar a que aparezca el error
    await waitFor(() => {
      expect(screen.getByText(/error de prueba/i)).toBeInTheDocument()
    })

    // Escribir en el email y verificar que el error desaparece
    await user.type(emailInput, 'x')
    
    await waitFor(() => {
      expect(screen.queryByText(/error de prueba/i)).not.toBeInTheDocument()
    })
  })
})