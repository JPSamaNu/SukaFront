import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'
import { useState, useEffect } from 'react'

interface ErrorPageProps {
  title?: string
  message?: string
  showLogout?: boolean
}

export default function ErrorPage({ 
  title = '¡Oops! Algo salió mal',
  message = 'No pudimos cargar la información solicitada.',
  showLogout = false
}: ErrorPageProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isShiny, setIsShiny] = useState(false)

  useEffect(() => {
    // 1 en 400 de probabilidad de mostrar el Spinda shiny
    const random = Math.floor(Math.random() * 400) + 1
    setIsShiny(random === 1)
  }, [])

  const spindaImage = isShiny
    ? 'https://c.tenor.com/NYY6UwdOTI4AAAAC/tenor.gif'
    : 'https://projectpokemon.org/home/uploads/monthly_2018_05/large.5aeb18b8c213a_SpindaGif.gif.676e9023bba8e771dc855b986e1f883f.gif'

  const handleBackToMenu = () => {
    navigate('/')
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-[color:var(--surface-2)] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* Imagen de Spinda mareado (con probabilidad de shiny) */}
          <div className="flex justify-center">
            <img
              src={spindaImage}
              alt={isShiny ? "¡Spinda shiny! ¡Qué suerte!" : "Spinda mareado"}
              className="w-48 h-48 object-contain"
              onError={(e) => {
                // Fallback si la imagen no carga
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ctext x="50%25" y="50%25" font-size="80" text-anchor="middle" dy=".3em"%3E😵%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>

          {/* Mensaje especial si es shiny */}
          {isShiny && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 rounded-lg p-3 animate-pulse">
              <p className="text-yellow-800 dark:text-yellow-200 font-bold text-sm flex items-center justify-center gap-2">
                ✨ ¡Wow! ¡Encontraste un Spinda shiny! (1/400) ✨
              </p>
            </div>
          )}

          {/* Título del error */}
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--text)] mb-2">
              {title}
            </h1>
            <p className="text-[color:var(--muted)] text-sm">
              {message}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleBackToMenu}
              className="flex items-center gap-2"
            >
              🏠 Volver al Menú
            </Button>
            
            {showLogout && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                🚪 Cerrar Sesión
              </Button>
            )}
          </div>

          {/* Mensaje de ayuda */}
          <div className="pt-4 border-t border-[color:var(--card-border)]">
            <p className="text-xs text-[color:var(--muted)]">
              💡 Si el problema persiste, intenta cerrar sesión e iniciar nuevamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
