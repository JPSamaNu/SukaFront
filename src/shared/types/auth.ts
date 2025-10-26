// Tipos para la autenticación y respuestas del backend
export interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken?: string // Opcional porque puede venir de cookies
}

// Tipos para errores de la API
export interface ApiError {
  message: string
  statusCode: number
  timestamp: string
  path: string
}