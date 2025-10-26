import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cache } from '@/shared/lib/cache'
import { generationsApi } from '@/shared/api/generations.api'

export default function CacheManager() {
  const [cacheSize, setCacheSize] = useState(cache.getCacheSize())
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClearCache = () => {
    generationsApi.clearCache()
    setCacheSize(cache.getCacheSize())
    setShowConfirm(false)
  }

  const handleRefresh = () => {
    setCacheSize(cache.getCacheSize())
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🗄️</span>
          Administrador de Caché
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-[color:var(--muted)]">
          <p className="mb-2">El caché almacena las generaciones y Pokémon para cargar más rápido.</p>
          <p className="font-semibold">
            Tamaño del caché: <span className="text-[color:var(--text)]">{cacheSize} KB</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
          >
            🔄 Actualizar
          </Button>

          {!showConfirm ? (
            <Button 
              onClick={() => setShowConfirm(true)}
              variant="default"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              🗑️ Limpiar Caché
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleClearCache}
                variant="default"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                ✓ Confirmar
              </Button>
              <Button 
                onClick={() => setShowConfirm(false)}
                variant="outline"
                size="sm"
              >
                ✗ Cancelar
              </Button>
            </div>
          )}
        </div>

        {showConfirm && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Esto eliminará todos los datos guardados y tendrás que cargar todo de nuevo.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
