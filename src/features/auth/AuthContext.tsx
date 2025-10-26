import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api, setAccessToken, getAccessToken, setTokenExpiredCallback } from '@/shared/api/axios'
import type { AuthResponse, User } from '@/shared/types/auth'

// Tipos para el estado de autenticación
interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error?: string
  isInitialized: boolean
}

// Tipos para el contexto
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => Promise<boolean>
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | null>(null)

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Tipos para las props del provider
interface AuthProviderProps {
  children: React.ReactNode
}

// Provider del contexto de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => ({
    token: getAccessToken(), // Recuperar token de memoria/sessionStorage al inicializar
    user: null,
    loading: false,
    isInitialized: false,
  }))

  // Verificar la autenticación al cargar la aplicación
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = getAccessToken()
    
    if (!token) {
      setState(prev => ({ ...prev, isInitialized: true, token: null, user: null }))
      return false
    }

    setState(prev => ({ ...prev, loading: true }))
    
    try {
      // Verificar que el token sea válido haciendo una petición al perfil
      const response = await api.get('/auth/me')
      setState(prev => ({ ...prev, token, user: response.data, loading: false, isInitialized: true }))
      return true
    } catch (error) {
      // Token inválido o expirado
      setAccessToken(null)
      setState(prev => ({ ...prev, token: null, user: null, loading: false, isInitialized: true }))
      return false
    }
  }, [])

  // Ejecutar verificación al montar el componente
  useEffect(() => {
    checkAuth()
    
    // Configurar callback para logout automático cuando expire el token
    const handleTokenExpired = () => {
      setAccessToken(null)
      setState(prev => ({ ...prev, token: null, user: null, error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' }))
    }
    
    setTokenExpiredCallback(handleTokenExpired)
    
    // Cleanup
    return () => {
      setTokenExpiredCallback(() => {})
    }
  }, [checkAuth])

  // Función para hacer login
  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: undefined }))
    
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password })
      const { access_token: token, user } = response.data
      
      // Actualizar token en el cliente axios y contexto
      setAccessToken(token)
      setState(prev => ({ ...prev, token, user, loading: false, isInitialized: true }))
    } catch (error: any) {
      // Limpiar token en caso de error
      setAccessToken(null)
      
      const errorMessage = error.response?.data?.message || 'Credenciales inválidas'
      setState(prev => ({ ...prev, token: null, user: null, loading: false, error: errorMessage, isInitialized: true }))
      
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error
    }
  }, [])

  // Función para hacer logout
  const logout = useCallback(() => {
    setAccessToken(null)
    setState(prev => ({ ...prev, token: null, user: null, loading: false }))
    
    // Opcional: llamar al endpoint de logout en el backend
    api.post('/auth/logout').catch(() => {
      // Ignorar errores del logout, ya que el token local ya se limpió
    })
  }, [])

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }))
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}