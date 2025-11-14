import { useState, useEffect, useRef, startTransition, useCallback } from 'react'
import { movesApi, type Move } from '@/shared/api/moves.api'

export default function MovesPage() {
  const [moves, setMoves] = useState<Move[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDamageClass, setSelectedDamageClass] = useState<string>('all')
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [types, setTypes] = useState<Array<{ id: number; name: string }>>([])
  const [damageClasses, setDamageClasses] = useState<Array<{ id: number; name: string }>>([])
  
  // Refs para infinite scroll optimizado
  const currentPageRef = useRef(1)
  const isLoadingRef = useRef(false)

  // Cargar tipos y clases de daño al iniciar
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [typesData, classesData] = await Promise.all([
          movesApi.getTypes(),
          movesApi.getDamageClasses(),
        ])
        setTypes(typesData)
        setDamageClasses(classesData)
      } catch (error) {
        console.error('Error loading filters:', error)
      }
    }
    
    loadFilters()
  }, [])

  // Función para cargar más movimientos (infinite scroll optimizado)
  const loadMoreMoves = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return
    
    isLoadingRef.current = true
    setLoadingMore(true)
    
    try {
      const page = currentPageRef.current
      console.log(`📦 Cargando página ${page} de movimientos...`)
      
      const response = await movesApi.getAll({
        page,
        limit: 50, // Lotes de 50 movimientos
        search: searchTerm || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        damageClass: selectedDamageClass !== 'all' ? selectedDamageClass : undefined,
      })
      
      if (response.data.length > 0) {
        startTransition(() => {
          setMoves(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const uniqueNew = response.data.filter(m => !existingIds.has(m.id))
            return [...prev, ...uniqueNew]
          })
        })
        
        setTotal(response.pagination.total)
        currentPageRef.current += 1
        
        // Si no hay más páginas, desactivar hasMore
        if (page >= response.pagination.totalPages) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more moves:', error)
    } finally {
      isLoadingRef.current = false
      setLoadingMore(false)
    }
  }, [hasMore, searchTerm, selectedType, selectedDamageClass])

  // Resetear y cargar inicial cuando cambian los filtros
  useEffect(() => {
    const resetAndLoad = async () => {
      setLoading(true)
      setMoves([])
      currentPageRef.current = 1
      setHasMore(true)
      isLoadingRef.current = false
      
      await loadMoreMoves()
      setLoading(false)
    }
    
    resetAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedType, selectedDamageClass])

  // Infinite scroll: detectar cuando el usuario llega al final
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingRef.current || !hasMore) return
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      // Cuando esté a 300px del final, cargar más
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadMoreMoves()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadMoreMoves])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      grass: 'bg-green-500',
      electric: 'bg-yellow-500',
      psychic: 'bg-pink-500',
      ice: 'bg-blue-200',
      dragon: 'bg-purple-600',
      dark: 'bg-gray-800',
      fairy: 'bg-pink-300',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      steel: 'bg-gray-500',
      normal: 'bg-gray-400',
    }
    return colors[type] || 'bg-gray-400'
  }

  const getDamageClassIcon = (damageClass: string) => {
    switch (damageClass) {
      case 'physical':
        return '⚔️'
      case 'special':
        return '✨'
      case 'status':
        return '🎯'
      default:
        return '❓'
    }
  }

  const capitalizeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-neutral-800/50 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-neutral-800/50 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pokedex-panel bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white font-display tracking-wider mb-2">
            ⚔️ MOVES DATABASE
          </h1>
          <p className="text-orange-100 font-mono">
            Explora todos los movimientos disponibles en el mundo Pokémon
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="pokedex-panel">
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-4 py-3 border-b border-pokedex-neon/20">
          <h3 className="font-display text-sm tracking-wider text-neutral-400 uppercase">
            FILTERS
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="text-sm font-medium text-neutral-400 font-mono mb-2 block uppercase">
                Buscar movimiento
              </label>
              <input
                type="text"
                placeholder="Ej: Flamethrower"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 font-mono focus:outline-none focus:border-pokedex-neon focus:ring-1 focus:ring-pokedex-neon transition-all"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="text-sm font-medium text-neutral-400 font-mono mb-2 block uppercase">
                Tipo
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 font-mono focus:outline-none focus:border-pokedex-neon focus:ring-1 focus:ring-pokedex-neon transition-all"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {types.map(type => (
                  <option key={type.id} value={type.name}>
                    {capitalizeName(type.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Clase de daño */}
            <div>
              <label className="text-sm font-medium text-neutral-400 font-mono mb-2 block uppercase">
                Categoría
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 font-mono focus:outline-none focus:border-pokedex-neon focus:ring-1 focus:ring-pokedex-neon transition-all"
                value={selectedDamageClass}
                onChange={(e) => setSelectedDamageClass(e.target.value)}
              >
                <option value="all">Todas</option>
                {damageClasses.map(dc => (
                  <option key={dc.id} value={dc.name}>
                    {getDamageClassIcon(dc.name)} {capitalizeName(dc.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 font-mono">
          Mostrando {moves.length} de {total} movimientos
        </p>
        {loadingMore && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 font-mono">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pokedex-neon"></div>
            <span>Cargando más...</span>
          </div>
        )}
      </div>

      {/* Lista de movimientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moves.map((move) => (
          <div key={move.id} className="pokedex-panel hover:shadow-lg hover:shadow-pokedex-neon/10 transition-shadow cursor-pointer">
            <div className="p-4 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display tracking-wider text-neutral-200 uppercase">
                  {capitalizeName(move.name)}
                </h3>
                <span className="text-2xl">{getDamageClassIcon(move.damageClass)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold font-mono ${getTypeColor(move.type)}`}>
                  {capitalizeName(move.type)}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-neutral-500 font-mono uppercase text-xs">Poder</p>
                  <p className="font-semibold text-pokedex-neon font-mono">
                    {move.power || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 font-mono uppercase text-xs">Precisión</p>
                  <p className="font-semibold text-pokedex-neon font-mono">
                    {move.accuracy ? `${move.accuracy}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 font-mono uppercase text-xs">PP</p>
                  <p className="font-semibold text-pokedex-neon font-mono">{move.pp}</p>
                </div>
                <div>
                  <p className="text-neutral-500 font-mono uppercase text-xs">Prioridad</p>
                  <p className="font-semibold text-pokedex-neon font-mono">
                    {move.priority > 0 ? `+${move.priority}` : move.priority}
                  </p>
                </div>
              </div>

              {/* Efecto */}
              <div>
                <p className="text-xs text-neutral-400 line-clamp-2 font-mono">
                  {move.effect}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sin resultados */}
      {moves.length === 0 && !loading && (
        <div className="pokedex-panel">
          <div className="py-12 text-center">
            <p className="text-neutral-500 font-mono">
              No se encontraron movimientos con los filtros seleccionados
            </p>
          </div>
        </div>
      )}

      {/* Indicador de fin de lista */}
      {!hasMore && moves.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500 font-mono">
            ✅ Has visto todos los movimientos ({total} en total)
          </p>
        </div>
      )}

      {/* Loading más movimientos */}
      {loadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-neutral-800/50 animate-pulse rounded"></div>
          ))}
        </div>
      )}
    </div>
  )
}
