import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/shared/api/axios'
import { Logo } from '@/shared/brand/Logo'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { AuthResponse } from '@/shared/types/auth'

// Schema de validación con Zod (coincide con el backend)
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
      })
      
      console.log('✅ Registro exitoso:', response.data)
      // Redirigir al login o dashboard después del registro
      navigate('/login', { replace: true })
    } catch (err: any) {
      console.error('❌ Error en registro:', err)
      const errorMessage = err.response?.data?.message || 'Error al registrar usuario'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Limpiar error cuando el usuario empiece a escribir
  const handleInputChange = () => {
    if (error) {
      setError('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo className="h-12 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Crear cuenta
            </CardTitle>
            <CardDescription className="text-gray-600">
              Únete a SukaDex y comienza tu aventura Pokémon
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-email@ejemplo.com"
                {...register('email')}
                onChange={handleInputChange}
                className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register('password')}
                onChange={handleInputChange}
                className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                {...register('confirmPassword')}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Error general */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Botón de registro */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </form>

          {/* Link al login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}