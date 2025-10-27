import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { pokemonApi } from '@/shared/api/pokemon.api'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Input } from '@/shared/components/ui/input'

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
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const navigate = useNavigate()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPokemonRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<number | null>(null)

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

  // Cargar Pokémon
  const loadPokemon = useCallback(async (pageNum: number, searchTerm: string = '', typeFilters: string[] = []) => {
    try {
      setLoading(true)
      const response = await pokemonApi.getAll({
        page: pageNum,
        limit: 100, // Máximo permitido por el backend
        search: searchTerm || undefined,
        type: typeFilters.length > 0 ? typeFilters.join(',') : undefined,
        sortBy: 'id',
        sortOrder: 'ASC',
      })

      setTotalCount(response.total)

      if (pageNum === 1) {
        setPokemon(response.data)
      } else {
        setPokemon(prev => [...prev, ...response.data])
      }

      setHasMore(pageNum < response.totalPages)
    } catch (error) {
      console.error('Error cargando Pokémon:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar página inicial cuando cambian los filtros
  useEffect(() => {
    loadPokemon(1, debouncedSearch, selectedTypes)
    setPage(1)
    setPokemon([])
  }, [debouncedSearch, selectedTypes])

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

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return

    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prev => prev + 1)
      }
    })

    if (lastPokemonRef.current) {
      observerRef.current.observe(lastPokemonRef.current)
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [loading, hasMore])

  // Cargar siguiente página
  useEffect(() => {
    if (page > 1 && !loading) {
      loadPokemon(page, debouncedSearch, selectedTypes)
    }
  }, [page, debouncedSearch, selectedTypes, loadPokemon])

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
        // Si no está seleccionado, lo agregamos
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
            <Input
              type="text"
              placeholder="🔍 Buscar Pokémon por nombre..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pr-10"
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
            Filtrar por Tipo {selectedTypes.length > 0 && `(${selectedTypes.length} seleccionado${selectedTypes.length !== 1 ? 's' : ''})`}
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {pokemonTypes.map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`
                  px-4 py-2 rounded-lg font-semibold text-white text-sm
                  transition-all duration-200 transform hover:scale-105
                  ${typeColors[type] || 'bg-gray-400'}
                  ${selectedTypes.includes(type)
                    ? 'ring-4 ring-yellow-400 scale-110' 
                    : 'opacity-60 hover:opacity-100'
                  }
                `}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
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
        {pokemon.map((poke, index) => {
          const isLast = index === pokemon.length - 1
          const imageUrl = poke.sprites?.other?.['official-artwork']?.front_default 
            || poke.sprites?.front_default
            || '/placeholder-pokemon.png'

          return (
            <div
              key={poke.id}
              ref={isLast ? lastPokemonRef : null}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 hover:border-[color:var(--btn-bg)]"
                onClick={() => handlePokemonClick(poke.id)}
              >
                <div className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={poke.name}
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-200"
                      loading="lazy"
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
              </Card>
            </div>
          )
        })}

        {/* Loading skeletons */}
        {loading && [...Array(20)].map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-64 w-full" />
        ))}
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
      {!loading && pokemon.length === 0 && search && (
        <div className="text-center py-12">
          <p className="text-[color:var(--muted)] text-lg mb-4">
            No se encontraron Pokémon para "{search}"
          </p>
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2 bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] rounded-lg hover:opacity-90 transition-opacity"
          >
            Ver todos los Pokémon
          </button>
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
