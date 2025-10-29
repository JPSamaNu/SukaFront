import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { berriesApi } from '@/shared/api/berries.api'

export default function BerriesPage() {
  const [berries, setBerries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFirmness, setSelectedFirmness] = useState<string>('')
  const [firmnesses, setFirmnesses] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const limit = 20

  useEffect(() => {
    loadFirmnesses()
  }, [])

  useEffect(() => {
    loadBerries()
  }, [search, selectedFirmness, page])

  const loadFirmnesses = async () => {
    try {
      const data = await berriesApi.getFirmnesses()
      setFirmnesses(data)
    } catch (error) {
      console.error('Error loading firmnesses:', error)
    }
  }

  const loadBerries = async () => {
    try {
      setLoading(true)
      const params = {
        search: search || undefined,
        firmness: selectedFirmness || undefined,
        page,
        limit,
      }
      
      const data = await berriesApi.getBerries(params)
      setBerries(data.data)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error loading berries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleFirmnessChange = (firmness: string) => {
    setSelectedFirmness(firmness === selectedFirmness ? '' : firmness)
    setPage(1)
  }

  const capitalizeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  }

  const getFlavorColor = (flavor: string) => {
    const colors: Record<string, string> = {
      spicy: 'bg-red-500',
      dry: 'bg-yellow-600',
      sweet: 'bg-pink-500',
      bitter: 'bg-green-600',
      sour: 'bg-purple-500',
    }
    return colors[flavor] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-theme-foreground">Berries</h1>
        <p className="text-theme-secondary mt-2">
          Explora todas las bayas disponibles en el mundo Pokémon
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Búsqueda */}
          <div>
            <label className="text-sm font-medium text-theme-foreground mb-2 block">
              Buscar berry
            </label>
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Firmeza */}
          <div>
            <label className="text-sm font-medium text-theme-foreground mb-2 block">
              Firmeza
            </label>
            <div className="flex flex-wrap gap-2">
              {firmnesses.map((firmness) => (
                <Button
                  key={firmness.id}
                  variant={selectedFirmness === firmness.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFirmnessChange(firmness.name)}
                  className="capitalize"
                >
                  {capitalizeName(firmness.name)}
                </Button>
              ))}
              {selectedFirmness && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFirmness('')}
                >
                  ✕ Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Berries */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : berries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-theme-secondary">
              No se encontraron berries con los filtros aplicados
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {berries.map((berry) => (
              <Card
                key={berry.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Sprite */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                      {berry.sprite ? (
                        <img
                          src={berry.sprite}
                          alt={berry.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <span className="text-3xl"></span>
                      )}
                    </div>

                    {/* Info principal */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          #{berry.id.toString().padStart(3, '0')}
                        </span>
                        <h3 className="text-lg font-bold text-theme-foreground capitalize">
                          {capitalizeName(berry.name)}
                        </h3>
                        <span className="text-sm text-theme-secondary capitalize">
                          {capitalizeName(berry.firmness)}
                        </span>
                      </div>

                      {/* Sabores */}
                      {berry.flavors && berry.flavors.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {berry.flavors.map((flavor: any) => (
                            <div
                              key={flavor.flavor}
                              className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md text-xs"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${getFlavorColor(flavor.flavor)}`} />
                              <span className="capitalize font-medium">{flavor.flavor}</span>
                              <span className="text-theme-secondary">({flavor.potency})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex-shrink-0 hidden md:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-theme-secondary text-xs mb-1">Tamaño</p>
                        <p className="font-semibold">{berry.size} mm</p>
                      </div>
                      <div className="text-center">
                        <p className="text-theme-secondary text-xs mb-1">Tiempo</p>
                        <p className="font-semibold">{berry.growthTime}h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-theme-secondary text-xs mb-1">Cosecha</p>
                        <p className="font-semibold">{berry.maxHarvest}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-theme-secondary text-xs mb-1">Suavidad</p>
                        <p className="font-semibold">{berry.smoothness}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Anterior
                  </Button>
                  <span className="text-sm text-theme-secondary">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
