import { useEffect, useState, useRef, useCallback, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { pokemonApi } from '@/shared/api/pokemon.api'
import { TypeBadge } from '@/shared/components/neodex'

interface PokemonItem {
  id: number
  name: string
  types: Array<{ name: string; slot: number }> | string[]
  sprites: {
    front_default: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
    }
  }
}

export default function AllPokemonPage() {
  const [pokemon, setPokemon] = useState<PokemonItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const navigate = useNavigate()
  const searchTimeoutRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Refs para control de carga (ya no necesitamos buffer porque todo se muestra progresivamente)
  const isLoadingBufferRef = useRef(false)
  const nextPageToLoadRef = useRef(1)
  const pokemonBufferRef = useRef<PokemonItem[]>([]) // Mantener por compatibilidad

  // Lista de todos los tipos de Pokémon
  const pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ]

  // Función para cargar en segundo plano con CONCURRENCIA LIMITADA
  const loadPokemonBuffer = useCallback(async (startPage: number, endPage: number, searchTerm: string = '', typeFilters: string[] = []) => {
    if (isLoadingBufferRef.current) return
    
    isLoadingBufferRef.current = true
    const CONCURRENCY = 5 // Máximo 5 requests simultáneos

    try {
      console.log(`🔄 Cargando páginas ${startPage}-${endPage} (concurrencia: ${CONCURRENCY})`)
      
      const totalPages = endPage - startPage + 1
      
      // Cargar en lotes de CONCURRENCY páginas
      for (let i = 0; i < totalPages; i += CONCURRENCY) {
        const batchStart = startPage + i
        const batchEnd = Math.min(batchStart + CONCURRENCY - 1, endPage)
        const batchPages = Array.from(
          { length: batchEnd - batchStart + 1 }, 
          (_, idx) => batchStart + idx
        )
        
        console.log(`  📦 Lote ${Math.floor(i / CONCURRENCY) + 1}: páginas ${batchStart}-${batchEnd}`)
        
        const promises = batchPages.map(page =>
          pokemonApi.getAll({
            page,
            limit: 50,
            search: searchTerm || undefined,
            type: typeFilters.length > 0 ? typeFilters.join(',') : undefined,
            sortBy: 'id',
            sortOrder: 'ASC',
          })
        )

        const responses = await Promise.all(promises)
        
        // Recopilar datos del lote
        const batchData: PokemonItem[] = []
        responses.forEach(response => {
          if (response.data && response.data.length > 0) {
            batchData.push(...response.data)
          }
        })
        
        console.log(`  ✓ Lote completado: ${batchData.length} Pokémon en este lote`)
        
        // MOSTRAR INMEDIATAMENTE cada lote (Progressive Loading)
        if (batchData.length > 0) {
          // Filtrar primeros 10 solo del primer lote si incluye página 1
          const dataToShow = (batchStart === 1) ? batchData.slice(10) : batchData
          
          if (dataToShow.length > 0) {
            startTransition(() => {
              setPokemon(prev => {
                const existingIds = new Set(prev.map(p => p.id))
                const uniqueNew = dataToShow.filter(p => !existingIds.has(p.id))
                console.log(`  ✨ Mostrando +${uniqueNew.length} (total: ${prev.length + uniqueNew.length})`)
                return [...prev, ...uniqueNew]
              })
            })
          }
        }
      }

      // Ya no necesitamos buffer, todo se muestra progresivamente
      pokemonBufferRef.current = []
      setHasMore(false) // Ya se mostró todo
      
      console.log(`✅ Carga completa: Todos los Pokémon visibles`)
      
    } catch (error) {
      console.error('Error cargando buffer:', error)
    } finally {
      isLoadingBufferRef.current = false
    }
  }, [])

  // Cargar Pokémon visibles (solo primeros 10, muestra inmediatamente)
  const loadPokemon = useCallback(async (pageNum: number, searchTerm: string = '', typeFilters: string[] = []) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController para esta petición
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      if (pageNum === 1) {
        setLoading(true)
        setPokemon([]) // Limpiar lista
        pokemonBufferRef.current = [] // Limpiar buffer
        nextPageToLoadRef.current = 1
      }

      // PASO 1: Cargar solo los primeros 10 Pokémon (visual inmediato)
      const initialResponse = await pokemonApi.getAll({
        page: 1,
        limit: 10,
        search: searchTerm || undefined,
        type: typeFilters.length > 0 ? typeFilters.join(',') : undefined,
        sortBy: 'id',
        sortOrder: 'ASC',
      })

      if (!abortController.signal.aborted) {
        setPokemon(initialResponse.data)
        setTotalCount(initialResponse.total)
        setHasMore(initialResponse.total > 10)
        setLoading(false)

        console.log(`📊 Total: ${initialResponse.total} Pokémon | Mostrando: 10 iniciales`)
        
        // Cargar resto progresivamente (cada lote se muestra automáticamente)
        if (initialResponse.total > 10) {
          setTimeout(() => {
            const totalPages = Math.ceil(initialResponse.total / 50)
            // Cargar desde página 1 (se filtrará el duplicado automáticamente)
            loadPokemonBuffer(1, totalPages, searchTerm, typeFilters)
          }, 100)
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && !abortController.signal.aborted) {
        console.error('Error cargando Pokémon:', error)
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [loadPokemonBuffer])

  // Cargar página inicial cuando cambian los filtros
  useEffect(() => {
    loadPokemon(1, debouncedSearch, selectedTypes)
  }, [debouncedSearch, selectedTypes, loadPokemon])

  // Debounce para el buscador (espera 500ms después de que el usuario deje de escribir)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search])

  // Ya NO necesitamos IntersectionObserver porque todo se carga progresivamente
  // El sistema ahora muestra cada lote automáticamente conforme se descarga

  const handlePokemonClick = (pokemonId: number) => {
    navigate(`/pokemon/${pokemonId}`)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    // El debounce se encargará de actualizar debouncedSearch y disparar la búsqueda
  }

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        // Si ya está seleccionado, lo quitamos
        return prev.filter(t => t !== type)
      } else {
        // Si no está seleccionado, verificar límite de 2 tipos
        if (prev.length >= 2) {
          // Ya hay 2 tipos seleccionados, no permitir más
          return prev
        }
        // Si hay menos de 2, agregar el nuevo tipo
        return [...prev, type]
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pokedex-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-display text-2xl md:text-3xl text-neon mb-2">
              POKÉMON LIST
            </h1>
            <p className="text-terminal text-sm text-neutral-400">
              {totalCount > 0 ? `${totalCount} ENTRIES FOUND` : 'LOADING DATABASE...'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 px-4 py-2 bg-terminal/50 rounded-lg border border-neon/20">
              <div className="led-dot led-green w-2 h-2"></div>
              <span className="text-terminal text-xs text-neutral-400">ONLINE</span>
            </div>
          </div>
        </div>

        {/* Buscador con estilo terminal */}
        <div className="mb-6">
          <div className="relative terminal-glass">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pokedex-neon">
              <span className="text-terminal text-sm">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={search}
              onChange={handleSearchChange}
              className="input-terminal w-full pl-10 pr-10 py-3 border-2 rounded-lg
                       focus:outline-none focus:border-pokedex-neon/60 focus:ring-2 focus:ring-pokedex-neon/20
                       transition-all"
            />
            {search !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pokedex-neon"></div>
              </div>
            )}
          </div>
          {search && (
            <p className="text-xs text-neutral-500 mt-2 font-mono text-center">
              {search !== debouncedSearch 
                ? '> PROCESSING...' 
                : loading 
                  ? '> SEARCHING DATABASE...' 
                  : `> ${pokemon.length} MATCH${pokemon.length !== 1 ? 'ES' : ''} FOUND`
              }
            </p>
          )}
        </div>

        {/* Filtro por Tipo con badges NeoDex */}
        <div>
          <h3 className="stat-label text-center mb-3">
            Filter by Type {selectedTypes.length > 0 && `[${selectedTypes.length}/2]`}
          </h3>
          {selectedTypes.length >= 2 && (
            <p className="text-center text-xs text-pokedex-amber mb-3 text-terminal">
              ⚠ MAX 2 TYPES SELECTED
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {pokemonTypes.map(type => {
              const isSelected = selectedTypes.includes(type)
              const isDisabled = !isSelected && selectedTypes.length >= 2
              
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  disabled={isDisabled}
                  className={`
                    transition-all duration-200 transform
                    ${isSelected
                      ? 'ring-2 ring-pokedex-neon scale-105' 
                      : isDisabled
                        ? 'opacity-30 cursor-not-allowed'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }
                  `}
                >
                  <TypeBadge type={type} size="md" />
                </button>
              )
            })}
          </div>
          {selectedTypes.length > 0 && (
            <div className="text-center mt-3">
              <button
                onClick={() => setSelectedTypes([])}
                className="text-xs text-neutral-500 hover:text-pokedex-neon font-mono underline transition-colors"
              >
                ✕ CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Pokémon con cards estilo Pokédex */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {pokemon.map((poke) => {
          const imageUrl = poke.sprites?.other?.['official-artwork']?.front_default 
            || poke.sprites?.front_default
            || '/placeholder-pokemon.png'

          return (
            <div
              key={poke.id}
              className="group cursor-pointer transition-all duration-200 hover:-translate-y-1"
              onClick={() => handlePokemonClick(poke.id)}
            >
              <div className="pokedex-panel p-3 h-full hover:ring-2 hover:ring-pokedex-neon/60 transition-all">
                {/* Sprite container */}
                <div className="aspect-square bg-neutral-900/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden
                              border border-neutral-800 group-hover:border-pokedex-neon/40 transition-colors">
                  <img
                    src={imageUrl}
                    alt={poke.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-pokemon.png'
                    }}
                  />
                </div>

                {/* Info */}
                <div className="text-center">
                  <p className="text-[10px] text-neutral-500 font-mono font-semibold mb-1">
                    #{poke.id.toString().padStart(4, '0')}
                  </p>
                  <h3 className="font-semibold text-sm text-neutral-200 capitalize mb-2 truncate">
                    {poke.name}
                  </h3>

                  {/* Type badges */}
                  <div className="flex gap-1 justify-center flex-wrap">
                    {poke.types && poke.types.map((type, index) => {
                      const typeName = typeof type === 'string' ? type : type?.name
                      if (!typeName) return null
                      return (
                        <TypeBadge key={`${typeName}-${index}`} type={typeName} size="sm" />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Loading inicial */}
        {loading && pokemon.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-800 border-t-pokedex-neon"></div>
              <div className="absolute inset-0 rounded-full bg-pokedex-neon/20 blur-xl"></div>
            </div>
            <p className="text-sm font-mono text-neutral-500">LOADING DATABASE...</p>
          </div>
        )}
      </div>

      {/* No hay más resultados */}
      {!loading && !hasMore && pokemon.length > 0 && (
        <div className="text-center py-8 pokedex-panel">
          <p className="text-terminal text-neutral-400 text-sm">
            ✨ END OF DATABASE
          </p>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && pokemon.length === 0 && (search || selectedTypes.length > 0) && (
        <div className="text-center py-12 pokedex-panel">
          <div className="text-6xl mb-4 opacity-30">🔍</div>
          <p className="text-neon text-lg text-display mb-2">
            NO RESULTS FOUND
          </p>
          <p className="text-terminal text-neutral-400 text-sm mb-6">
            {search && selectedTypes.length === 0 && (
              <>QUERY: "<span className="text-pokedex-neon">{search}</span>"</>
            )}
            {!search && selectedTypes.length === 1 && (
              <>TYPE: <span className="text-pokedex-neon uppercase">{selectedTypes[0]}</span></>
            )}
            {!search && selectedTypes.length === 2 && (
              <>
                TYPES: <span className="text-pokedex-neon uppercase">{selectedTypes.join(' + ')}</span>
              </>
            )}
            {search && selectedTypes.length > 0 && (
              <>
                QUERY: "<span className="text-pokedex-neon">{search}</span>" | 
                TYPE{selectedTypes.length > 1 ? 'S' : ''}: <span className="text-pokedex-neon uppercase">{selectedTypes.join(' + ')}</span>
              </>
            )}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg 
                         transition-colors font-mono text-sm border border-neutral-700"
              >
                Clear Search
              </button>
            )}
            {selectedTypes.length > 0 && (
              <button
                onClick={() => setSelectedTypes([])}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg 
                         transition-colors font-mono text-sm border border-neutral-700"
              >
                Clear Filters
              </button>
            )}
            {(search || selectedTypes.length > 0) && (
              <button
                onClick={() => {
                  setSearch('')
                  setSelectedTypes([])
                }}
                className="px-4 py-2 bg-pokedex-neon/20 hover:bg-pokedex-neon/30 text-pokedex-neon rounded-lg 
                         transition-colors font-mono text-sm border border-pokedex-neon/40"
              >
                Show All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Indicador de carga flotante */}
      {loading && pokemon.length > 0 && (
        <div className="fixed bottom-8 right-8 bg-terminal border-2 border-neon/60 text-neutral-200 
                      px-4 py-2 rounded-lg shadow-panel flex items-center gap-3 backdrop-blur-sm">
          <div className="loading-spinner h-4 w-4 border-2 border-neutral-700"></div>
          <span className="text-terminal text-sm">LOADING...</span>
        </div>
      )}
    </div>
  )
}
