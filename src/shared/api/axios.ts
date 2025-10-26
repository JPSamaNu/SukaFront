import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Flag para habilitar sessionStorage como fallback
const ENABLE_SESSION_FALLBACK = import.meta.env.VITE_ENABLE_SESSION_FALLBACK === 'true'

// Estado del refresh token
let isRefreshing = false
let pendingRequests: Array<() => void> = []

// Callback para manejar logout automático desde el interceptor
let onTokenExpired: (() => void) | null = null

export const setTokenExpiredCallback = (callback: () => void) => {
  onTokenExpired = callback
}

// Instancia principal de axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // para enviar cookies httpOnly del refresh token
  timeout: 60000, // 60 segundos para endpoints pesados como generaciones con todos los pokemon
})

// Token en memoria
let accessToken: string | null = null

// Funciones para manejar el token
export const setAccessToken = (token: string | null) => {
  accessToken = token
  
  // Feature flag: guardar en sessionStorage como fallback
  if (ENABLE_SESSION_FALLBACK) {
    if (token) {
      sessionStorage.setItem('sukafront_token', token)
    } else {
      sessionStorage.removeItem('sukafront_token')
    }
  }
}

export const getAccessToken = (): string | null => {
  // Prioridad: memoria > sessionStorage (si está habilitado)
  if (accessToken) return accessToken
  
  if (ENABLE_SESSION_FALLBACK) {
    const sessionToken = sessionStorage.getItem('sukafront_token')
    if (sessionToken) {
      accessToken = sessionToken
      return sessionToken
    }
  }
  
  return null
}

// Interceptor de request: añadir Authorization header
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de response: manejar 401 y refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    
    // Si es 401 y no es la petición de login y no hemos intentado refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/auth/login') &&
      !(originalRequest as any)._retry
    ) {
      // Si ya estamos refrescando, esperar
      if (isRefreshing) {
        return new Promise<void>((resolve) => {
          pendingRequests.push(resolve)
        }).then(() => api(originalRequest))
      }
      
      // Marcar que estamos refrescando
      isRefreshing = true
      ;(originalRequest as any)._retry = true
      
      try {
        // Intentar refresh - la cookie httpOnly se envía automáticamente
        const refreshResponse = await api.post('/auth/refresh')
        const newToken = refreshResponse.data.access_token
        
        // Actualizar token en memoria
        setAccessToken(newToken)
        
        // Resolver todas las peticiones pendientes
        pendingRequests.forEach((callback) => callback())
        pendingRequests = []
        
        // Reintentar la petición original con el nuevo token
        return api(originalRequest)
      } catch (refreshError) {
        // Si el refresh falla, limpiar token y rechazar
        setAccessToken(null)
        pendingRequests = []
        
        // Notificar al contexto de autenticación sobre el token expirado
        if (onTokenExpired) {
          onTokenExpired()
        }
        
        // El error original se propaga para que el componente pueda manejarlo
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)