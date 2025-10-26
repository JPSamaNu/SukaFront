import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { Pokemon } from '@/shared/types/pokemon'

export default function PokemonDetailsPage() {
  const { name } = useParams<{ name: string }>()
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!name) return

      try {
        setLoading(true)
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        
        if (!response.ok) {
          throw new Error('Pokémon no encontrado')
        }
        
        const data: Pokemon = await response.json()
        setPokemon(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [name])

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
      normal: 'bg-theme-muted',
    }
    return colors[type] || 'bg-theme-muted'
  }

  const formatStatName = (statName: string) => {
    const names: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Ataque',
      'defense': 'Defensa',
      'special-attack': 'At. Especial',
      'special-defense': 'Def. Especial',
      'speed': 'Velocidad',
    }
    return names[statName] || statName
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="aspect-square w-full max-w-md mx-auto" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <p className="text-red-600 mb-4">{error || 'Pokémon no encontrado'}</p>
            <Link to="/">
              <Button>Volver a la Pokédex</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pokemonNumber = pokemon.id.toString().padStart(3, '0')
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
  const mainImage = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex items-center space-x-4">
        <Link to="/">
          <Button variant="outline">← Volver</Button>
        </Link>
        <h1 className="text-2xl font-bold text-theme-foreground">
          #{pokemonNumber} {capitalizedName}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Imagen y información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Información básica</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {/* Imagen principal */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={pokemon.name}
                    className="w-full max-w-sm mx-auto"
                  />
                ) : (
                  <div className="w-64 h-64 mx-auto bg-theme-muted rounded-xl flex items-center justify-center">
                    <span className="text-4xl">?</span>
                  </div>
                )}
              </div>

              {/* Tipos */}
              <div className="flex justify-center space-x-2">
                {pokemon.types.map((type, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getTypeColor(type.type.name)}`}
                  >
                    {type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                  </span>
                ))}
              </div>

              {/* Altura y peso */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-theme-muted-foreground text-sm">Altura</p>
                  <p className="text-lg font-semibold">{pokemon.height / 10} m</p>
                </div>
                <div className="text-center">
                  <p className="text-theme-muted-foreground text-sm">Peso</p>
                  <p className="text-lg font-semibold">{pokemon.weight / 10} kg</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas base</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {pokemon.stats.map((stat, index) => {
                const percentage = Math.min((stat.base_stat / 150) * 100, 100)
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-theme-muted-foreground">
                        {formatStatName(stat.stat.name)}
                      </span>
                      <span className="text-sm font-bold">
                        {stat.base_stat}
                      </span>
                    </div>
                    <div className="w-full bg-theme-muted rounded-full h-2">
                      <div
                        className="bg-pokedex-red h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Total de estadísticas */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-theme-foreground">Total</span>
                <span className="text-lg font-bold text-pokedex-red">
                  {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}