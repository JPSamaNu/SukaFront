import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Logo } from '@/shared/brand/Logo'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'

// Schema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Debe ser un email válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, error, clearError } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      navigate('/', { replace: true })
    } catch {
      // El error ya se maneja en el contexto
    }
  }

  // Limpiar error cuando el usuario empiece a escribir
  const handleInputChange = () => {
    if (error) {
      clearError()
    }
  }

  return (
    <div className="min-h-screen bg-[color:var(--surface-2)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-soft">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <Logo variant="mark" className="h-16 w-16" withBackground />
            </div>
            <CardTitle className="text-2xl font-bold text-[color:var(--text)]">
              SukaDex
            </CardTitle>
            <CardDescription>
              Inicia sesión para acceder a tu Pokédex
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                  onChange={(e) => {
                    register('email').onChange(e)
                    handleInputChange()
                  }}
                />
                {errors.email && (
                  <p role="alert" className="text-sm text-[color:var(--danger)]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                  onChange={(e) => {
                    register('password').onChange(e)
                    handleInputChange()
                  }}
                />
                {errors.password && (
                  <p role="alert" className="text-sm text-[color:var(--danger)]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div role="alert" className="rounded-lg bg-[color:var(--danger)]/10 border border-[color:var(--danger)]/20 p-3 text-sm text-[color:var(--danger)]">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>

            {/* Comentado hasta que aceptemos registros externos, NO TOCAR */}
            {/* Link al registro */}
            {/* <div className="mt-6 text-center">

              <p className="text-sm text-[color:var(--muted)]">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-[color:var(--accent)] hover:underline transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}