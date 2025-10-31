import { useState, useEffect, useRef, startTransition, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { berriesApi } from '@/shared/api/berries.api'

export default function BerriesPage() {
  const [berries, setBerries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedFirmness, setSelectedFirmness] = useState<string>('')
  const [firmnesses, setFirmnesses] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  // Refs para infinite scroll
  const currentPageRef = useRef(1)
  const isLoadingRef = useRef(false)

  const limit = 50

  const loadFirmnesses = async () => {
    try {
      const data = await berriesApi.getFirmnesses()
      setFirmnesses(data)
    } catch (error) {
      console.error('Error loading firmnesses:', error)
    }
  }

  useEffect(() => {
    loadFirmnesses()
  }, [])

  // Función para cargar más berries
  const loadMoreBerries = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return
    
    isLoadingRef.current = true
    setLoadingMore(true)
    
    try {
      const page = currentPageRef.current
      console.log(`📦 Cargando página ${page} de berries...`)
      
      const params = {
        search: search || undefined,
        firmness: selectedFirmness || undefined,
        page,
        limit,
      }
      
      const data = await berriesApi.getBerries(params)
      
      if (data.data.length > 0) {
        startTransition(() => {
          setBerries(prev => {
            const existingIds = new Set(prev.map((b: any) => b.id))
            const uniqueNew = data.data.filter((b: any) => !existingIds.has(b.id))
            return [...prev, ...uniqueNew]
          })
        })
        
        setTotal(data.total || data.data.length)
        currentPageRef.current += 1
        
        if (page >= data.totalPages) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading berries:', error)
    } finally {
      isLoadingRef.current = false
      setLoadingMore(false)
    }
  }, [hasMore, search, selectedFirmness, limit])

  // Resetear y cargar inicial
  useEffect(() => {
    const resetAndLoad = async () => {
      setLoading(true)
      setBerries([])
      currentPageRef.current = 1
      setHasMore(true)
      isLoadingRef.current = false
      
      await loadMoreBerries()
      setLoading(false)
    }
    
    resetAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedFirmness])

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingRef.current || !hasMore) return
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadMoreBerries()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadMoreBerries])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    // El useEffect se encargará de resetear y recargar
  }

  const handleFirmnessChange = (firmness: string) => {
    setSelectedFirmness(firmness === selectedFirmness ? '' : firmness)
    // El useEffect se encargará de resetear y recargar
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
                <button
                  key={firmness.id}
                  onClick={() => handleFirmnessChange(firmness.name)}
                  className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                    selectedFirmness === firmness.name
                      ? 'bg-[color:var(--primary)] text-white'
                      : 'bg-[color:var(--surface)] border border-[color:var(--border)] hover:bg-[color:var(--surface-2)]'
                  }`}
                >
                  {capitalizeName(firmness.name)}
                </button>
              ))}
              {selectedFirmness && (
                <button
                  onClick={() => setSelectedFirmness('')}
                  className="px-3 py-1.5 text-sm rounded-lg text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface-2)]"
                >
                  ✕ Limpiar
                </button>
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

          {/* Indicador de fin de lista */}
          {!hasMore && berries.length > 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[color:var(--muted)]">
                ✅ Has visto todas las berries ({total} en total)
              </p>
            </div>
          )}

          {/* Loading más berries */}
          {loadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
