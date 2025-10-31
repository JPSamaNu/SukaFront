import { useEffect, useState, useRef, useCallback, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { pokemonApi } from '@/shared/api/pokemon.api'

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

  // Colores de tipos de Pokémon
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-orange-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-400',
    fighting: 'bg-red-600',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-700',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-400',
  }

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[color:var(--text)] mb-2">
            Pokédex Nacional
          </h1>
          <p className="text-[color:var(--muted)] text-lg">
            {totalCount > 0 ? `${totalCount} Pokémon disponibles` : 'Cargando...'}
          </p>
        </div>

        {/* Buscador */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar Pokémon por nombre..."
              value={search}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 pr-10 rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            />
            {/* Indicador de búsqueda activa */}
            {search !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              </div>
            )}
          </div>
          {search && (
            <p className="text-xs text-[color:var(--muted)] mt-2 text-center">
              {search !== debouncedSearch 
                ? 'Escribiendo...' 
                : loading 
                  ? 'Buscando...' 
                  : `${pokemon.length} resultado${pokemon.length !== 1 ? 's' : ''} encontrado${pokemon.length !== 1 ? 's' : ''}`
              }
            </p>
          )}
        </div>

        {/* Filtro por Tipo */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-center text-sm font-semibold text-[color:var(--muted)] mb-3">
            Filtrar por Tipo {selectedTypes.length > 0 && `(${selectedTypes.length}/2 seleccionado${selectedTypes.length !== 1 ? 's' : ''})`}
          </h3>
          {selectedTypes.length >= 2 && (
            <p className="text-center text-xs text-yellow-600 mb-2">
              ⚠️ Máximo 2 tipos. Deselecciona uno para cambiar.
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
                    px-4 py-2 rounded-lg font-semibold text-white text-sm
                    transition-all duration-200 transform
                    ${typeColors[type] || 'bg-gray-400'}
                    ${isSelected
                      ? 'ring-4 ring-yellow-400 scale-110' 
                      : isDisabled
                        ? 'opacity-30 cursor-not-allowed'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }
                  `}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            })}
          </div>
          {selectedTypes.length > 0 && (
            <div className="text-center mt-3">
              <button
                onClick={() => setSelectedTypes([])}
                className="text-sm text-[color:var(--muted)] hover:text-[color:var(--text)] underline"
              >
                ✕ Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Pokémon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {pokemon.map((poke) => {
          const imageUrl = poke.sprites?.other?.['official-artwork']?.front_default 
            || poke.sprites?.front_default
            || '/placeholder-pokemon.png'

          return (
            <div
              key={poke.id}
              className="pokemon-item cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 border-[color:var(--border)] hover:border-[color:var(--btn-bg)] rounded-lg overflow-hidden bg-[color:var(--card)]"
              onClick={() => handlePokemonClick(poke.id)}
            >
              <div className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={poke.name}
                    className="w-full h-full object-contain hover:scale-110 transition-transform duration-200"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-pokemon.png'
                    }}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    N° {poke.id.toString().padStart(4, '0')}
                  </p>
                  <h3 className="font-bold text-gray-800 capitalize mb-2 truncate">
                    {poke.name}
                  </h3>

                  <div className="flex gap-1 justify-center flex-wrap">
                    {poke.types && poke.types.map((type, index) => {
                      const typeName = typeof type === 'string' ? type : type?.name
                      // Validar que el tipo tenga nombre
                      if (!typeName) return null
                      return (
                        <span
                          key={`${typeName}-${index}`}
                          className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                            typeColors[typeName.toLowerCase()] || 'bg-gray-400'
                          }`}
                        >
                          {typeName}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Loading inicial solo (sin skeletons visibles después)  */}
        {loading && pokemon.length === 0 && (
          <div className="col-span-full flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--primary)]"></div>
          </div>
        )}
      </div>

      {/* No hay más resultados */}
      {!loading && !hasMore && pokemon.length > 0 && (
        <div className="text-center py-8">
          <p className="text-[color:var(--muted)] text-lg">
            ✨ Has visto todos los Pokémon
          </p>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && pokemon.length === 0 && (search || selectedTypes.length > 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-[color:var(--text)] text-xl font-semibold mb-2">
            No se encontraron Pokémon
          </p>
          <p className="text-[color:var(--muted)] text-lg mb-4">
            {search && selectedTypes.length === 0 && (
              <>No hay resultados para "<span className="font-semibold">{search}</span>"</>
            )}
            {!search && selectedTypes.length === 1 && (
              <>No hay Pokémon de tipo <span className="font-semibold capitalize">{selectedTypes[0]}</span></>
            )}
            {!search && selectedTypes.length === 2 && (
              <>
                No hay Pokémon con los tipos{' '}
                <span className="font-semibold capitalize">{selectedTypes[0]}</span>
                {' y '}
                <span className="font-semibold capitalize">{selectedTypes[1]}</span>
              </>
            )}
            {search && selectedTypes.length > 0 && (
              <>
                No hay resultados para "<span className="font-semibold">{search}</span>" 
                con {selectedTypes.length === 1 ? 'tipo' : 'tipos'}{' '}
                <span className="font-semibold capitalize">{selectedTypes.join(', ')}</span>
              </>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            {search && (
              <button
                onClick={() => setSearch('')}
                className="px-4 py-2 bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] rounded-lg hover:opacity-90 transition-opacity"
              >
                Limpiar búsqueda
              </button>
            )}
            {selectedTypes.length > 0 && (
              <button
                onClick={() => setSelectedTypes([])}
                className="px-4 py-2 bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] rounded-lg hover:opacity-90 transition-opacity"
              >
                Limpiar filtros de tipo
              </button>
            )}
            {(search || selectedTypes.length > 0) && (
              <button
                onClick={() => {
                  setSearch('')
                  setSelectedTypes([])
                }}
                className="px-4 py-2 border-2 border-[color:var(--btn-bg)] text-[color:var(--btn-bg)] rounded-lg hover:bg-[color:var(--btn-bg)] hover:text-[color:var(--btn-fg)] transition-all"
              >
                Ver todos los Pokémon
              </button>
            )}
          </div>
        </div>
      )}

      {/* Indicador de carga flotante */}
      {loading && pokemon.length > 0 && (
        <div className="fixed bottom-8 right-8 bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Cargando más...</span>
        </div>
      )}
    </div>
  )
}
