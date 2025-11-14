import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gamesApi, type VersionGroup, type PokedexEntry } from '@/shared/api/games.api'

export default function GameDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [game, setGame] = useState<VersionGroup | null>(null)
  const [pokedex, setPokedex] = useState<PokedexEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (id) {
      loadGameDetails(parseInt(id))
    }
  }, [id])

  const loadGameDetails = async (gameId: number) => {
    try {
      setLoading(true)
      const [gameData, pokedexData] = await Promise.all([
        gamesApi.getVersionGroupById(gameId),
        gamesApi.getPokedexByVersionGroup(gameId),
      ])
      setGame(gameData)
      setPokedex(pokedexData)
    } catch (error) {
      console.error('Error loading game details:', error)
    } finally {
      setLoading(false)
    }
  }

  const capitalizeName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const filteredPokedex = pokedex.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pokemon.pokedexNumber.toString().includes(searchTerm)
  )

  const handlePokemonClick = (pokemonId: number) => {
    navigate(`/pokemon/${pokemonId}`, {
      state: { 
        fromGame: true,
        versionGroupId: game?.id,
        versionGroupName: game?.name 
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 w-full bg-neutral-800/50 animate-pulse rounded"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-48 bg-neutral-800/50 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 font-mono">Juego no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del juego */}
      <div className="pokedex-panel">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-display tracking-wider text-neutral-200 uppercase">
                {capitalizeName(game.name)}
              </h1>
              <p className="text-neutral-500 font-mono">
                Generación {game.generationId} • {pokedex.length} Pokémon en la Pokédex
              </p>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-200 border border-neutral-700 hover:border-pokedex-neon font-mono"
            >
              ← Volver a juegos
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <span className="bg-pokedex-neon/20 text-pokedex-neon px-3 py-1 rounded-full text-sm font-semibold font-mono border border-pokedex-neon/30">
              {game.generationName}
            </span>
            {game.versions.map((version) => (
              <span 
                key={version.id}
                className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-sm font-mono border border-neutral-700"
              >
                {capitalizeName(version.name)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="pokedex-panel">
        <div className="pt-6 px-6 pb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 font-mono focus:outline-none focus:border-pokedex-neon focus:ring-1 focus:ring-pokedex-neon transition-all"
          />
        </div>
      </div>

      {/* Contador */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 font-mono">
          Mostrando {filteredPokedex.length} de {pokedex.length} Pokémon
        </p>
      </div>

      {/* Grid de Pokémon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredPokedex.map((pokemon) => (
          <div
            key={pokemon.id}
            className="pokedex-panel cursor-pointer hover:shadow-lg hover:shadow-pokedex-neon/20 transition-all duration-200 hover:-translate-y-1"
            onClick={() => handlePokemonClick(pokemon.id)}
          >
            <div className="p-4">
              <div className="aspect-square bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-neutral-800">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                  alt={pokemon.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-pokedex-neon font-semibold mb-1 font-mono">
                  #{pokemon.pokedexNumber.toString().padStart(3, '0')}
                </p>
                <h3 className="font-semibold text-neutral-200 capitalize font-display tracking-wider uppercase text-sm">
                  {capitalizeName(pokemon.name)}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredPokedex.length === 0 && (
        <div className="pokedex-panel">
          <div className="py-12 text-center">
            <p className="text-neutral-500 font-mono">
              No se encontraron Pokémon con ese criterio de búsqueda
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
