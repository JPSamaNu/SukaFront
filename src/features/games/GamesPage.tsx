import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { gamesApi, type VersionGroup } from '@/shared/api/games.api'

export default function GamesPage() {
  const navigate = useNavigate()
  const [games, setGames] = useState<VersionGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      setLoading(true)
      const data = await gamesApi.getAllVersionGroups()
      setGames(data)
    } catch (error) {
      console.error('Error loading games:', error)
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

  const getGameIcon = (name: string) => {
    // Mapeo de iconos por juego
    const icons: Record<string, string> = {
      'red-blue': '🔴🔵',
      'yellow': '⚡',
      'gold-silver': '🟡⚪',
      'crystal': '💎',
      'ruby-sapphire': '🔴🔵',
      'emerald': '🟢',
      'firered-leafgreen': '🔥🍃',
      'diamond-pearl': '💎⚪',
      'platinum': '⭐',
      'heartgold-soulsilver': '💛🤍',
      'black-white': '⚫⚪',
      'black-2-white-2': '⚫⚪',
      'x-y': '✖️🇾',
      'omega-ruby-alpha-sapphire': '🔴🔵',
      'sun-moon': '☀️🌙',
      'ultra-sun-ultra-moon': '☀️🌙',
      'lets-go-pikachu-lets-go-eevee': '⚡🦊',
      'sword-shield': '⚔️🛡️',
      'brilliant-diamond-shining-pearl': '💎⚪',
      'legends-arceus': '🌌',
      'scarlet-violet': '🔴🟣',
    }
    return icons[name] || '🎮'
  }

  const getGenerationColor = (genId: number) => {
    const colors = [
      'from-red-500 to-red-700',
      'from-yellow-500 to-yellow-700',
      'from-emerald-500 to-emerald-700',
      'from-red-600 to-orange-600',
      'from-gray-600 to-gray-800',
      'from-blue-500 to-blue-700',
      'from-purple-500 to-purple-700',
      'from-pink-500 to-pink-700',
      'from-indigo-500 to-indigo-700',
    ]
    return colors[(genId - 1) % colors.length] || 'from-gray-500 to-gray-700'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-[color:var(--text)]">
          Juegos Pokémon 🎮
        </h1>
        <p className="text-[color:var(--muted)]">
          Explora todos los juegos de Pokémon y sus Pokédex regionales
        </p>
      </div>

      {/* Grid de juegos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card 
            key={game.id}
            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group overflow-hidden border-2 border-transparent hover:border-[color:var(--border)]"
            onClick={() => navigate(`/games/${game.id}`)}
          >
            <div className={`bg-gradient-to-br ${getGenerationColor(game.generationId)} p-6 min-h-[200px] flex flex-col justify-between`}>
              <div className="flex items-start justify-between">
                <div className="text-5xl group-hover:scale-125 transition-transform duration-300">
                  {getGameIcon(game.name)}
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-white text-sm font-semibold">
                    Gen {game.generationId}
                  </span>
                </div>
              </div>
              
              <div className="text-white space-y-2">
                <CardTitle className="text-2xl font-bold text-white">
                  {capitalizeName(game.name)}
                </CardTitle>
                <CardDescription className="text-sm text-white/90">
                  {game.versionCount} {game.versionCount === 1 ? 'versión' : 'versiones'}
                </CardDescription>
                <div className="flex flex-wrap gap-1 mt-2">
                  {game.versions.map((version) => (
                    <span 
                      key={version.id}
                      className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 text-xs text-white font-medium"
                    >
                      {capitalizeName(version.name)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sin resultados */}
      {games.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[color:var(--muted)]">
              No se encontraron juegos disponibles
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
