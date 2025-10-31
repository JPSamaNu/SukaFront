import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
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
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <p className="text-[color:var(--muted)]">Juego no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del juego */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">
                {capitalizeName(game.name)}
              </CardTitle>
              <p className="text-[color:var(--muted)]">
                Generación {game.generationId} • {pokedex.length} Pokémon en la Pokédex
              </p>
            </div>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 rounded-lg bg-[color:var(--surface-2)] hover:bg-[color:var(--surface)] transition-colors text-[color:var(--text)]"
            >
              ← Volver a juegos
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[color:var(--primary)]/10 text-[color:var(--primary)] px-3 py-1 rounded-full text-sm font-semibold">
              {game.generationName}
            </span>
            {game.versions.map((version) => (
              <span 
                key={version.id}
                className="bg-[color:var(--surface-2)] text-[color:var(--text)] px-3 py-1 rounded-full text-sm"
              >
                {capitalizeName(version.name)}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <input
            type="text"
            placeholder="Buscar por nombre o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] placeholder:text-[color:var(--muted)]"
          />
        </CardContent>
      </Card>

      {/* Contador */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">
          Mostrando {filteredPokedex.length} de {pokedex.length} Pokémon
        </p>
      </div>

      {/* Grid de Pokémon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredPokedex.map((pokemon) => (
          <div
            key={pokemon.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 border-[color:var(--border)] hover:border-[color:var(--btn-bg)] rounded-lg overflow-hidden bg-[color:var(--card)]"
            onClick={() => handlePokemonClick(pokemon.id)}
          >
            <div className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                  alt={pokemon.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-[color:var(--muted)] font-semibold mb-1">
                  #{pokemon.pokedexNumber.toString().padStart(3, '0')}
                </p>
                <h3 className="font-semibold text-[color:var(--text)] capitalize">
                  {capitalizeName(pokemon.name)}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredPokedex.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[color:var(--muted)]">
              No se encontraron Pokémon con ese criterio de búsqueda
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
