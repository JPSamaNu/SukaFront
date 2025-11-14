import { useState, useEffect } from 'react'
import PokemonCard from './PokemonCard'
import type { PokemonSummary, PokemonListResponse } from '@/shared/types/pokemon'
import ErrorPage from '@/shared/components/ErrorPage'

export default function PokedexPage() {
  const [pokemonList, setPokemonList] = useState<PokemonSummary[]>([])
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para extraer ID del Pokemon desde la URL
  const extractPokemonId = (url: string): number => {
    const matches = url.match(/\/(\d+)\/$/)
    return matches ? parseInt(matches[1]) : 0
  }

  // Función para obtener la imagen del Pokemon
  const getPokemonImage = (id: number): string => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  }

  // Cargar lista de Pokemon al montar el componente
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=30')
        
        if (!response.ok) {
          throw new Error('Error al cargar los Pokemon')
        }
        
        const data: PokemonListResponse = await response.json()
        
        const pokemonSummaries: PokemonSummary[] = data.results.map((pokemon) => {
          const id = extractPokemonId(pokemon.url)
          return {
            id,
            name: pokemon.name,
            image: getPokemonImage(id),
          }
        })
        
        setPokemonList(pokemonSummaries)
        setFilteredPokemon(pokemonSummaries)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [])

  // Filtrar Pokemon cuando cambie el término de búsqueda
  useEffect(() => {
    const filtered = pokemonList.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pokemon.id.toString().includes(searchTerm)
    )
    setFilteredPokemon(filtered)
  }, [searchTerm, pokemonList])

  const handleSearch = () => {
    // La búsqueda es reactiva, no necesitamos hacer nada aquí
    // Pero mantenemos la función por si queremos agregar lógica específica
  }

  if (error) {
    return (
      <ErrorPage
        title="Error al cargar el Pokédex"
        message="No pudimos cargar la lista de Pokémon. Por favor, verifica tu conexión e intenta nuevamente."
        showLogout={false}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con diseño Pokédex */}
      <div className="header-gradient-red">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">
                POKÉDEX NACIONAL
              </h1>
              <p className="page-subtitle text-red-100">
                Descubre y explora el mundo Pokémon
              </p>
            </div>
            
            {/* Decoración visual tipo Pokédex */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                <div className="led-dot led-neon w-12 h-12 shadow-inner"></div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="led-dot led-amber w-4 h-4"></div>
                <div className="led-dot led-green w-4 h-4"></div>
                <div className="led-dot led-neon w-4 h-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="pokedex-panel">
        <div className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar Pokémon por nombre o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-terminal"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="btn-sukadex px-8"
            >
              BUSCAR
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Pokemon */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {loading ? (
          // Skeletons mientras carga
          Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="pokedex-panel p-4">
              <div className="skeleton aspect-square w-full mb-3"></div>
              <div className="skeleton h-4 w-3/4 mx-auto mb-2"></div>
              <div className="skeleton h-3 w-1/2 mx-auto"></div>
            </div>
          ))
        ) : filteredPokemon.length > 0 ? (
          // Lista de Pokemon
          filteredPokemon.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))
        ) : (
          // No se encontraron resultados
          <div className="col-span-full text-center py-12">
            <div className="pokedex-panel max-w-md mx-auto">
              <div className="p-6">
                <p className="text-terminal text-neutral-400 mb-4">
                  No se encontraron Pokémon que coincidan con "{searchTerm}"
                </p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="btn-secondary"
                >
                  Mostrar todos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      {!loading && filteredPokemon.length > 0 && (
        <div className="text-center text-terminal text-neutral-500 pt-6">
          <p>
            Mostrando {filteredPokemon.length} de {pokemonList.length} Pokémon
          </p>
        </div>
      )}
    </div>
  )
}