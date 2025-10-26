import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/shared/components/ui/card'
import type { PokemonSummary } from '@/shared/types/pokemon'

interface PokemonCardProps {
  pokemon: PokemonSummary
}

// Función para obtener colores según el tipo
const getTypeColor = (type?: string) => {
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
  return colors[type || 'normal'] || 'bg-theme-muted'
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  // Extraer número de Pokémon desde el ID
  const pokemonNumber = pokemon.id.toString().padStart(3, '0')
  
  // Capitalizar nombre
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)

  return (
    <Link to={`/pokedex/${pokemon.name}`} className="group">
      <Card className="transition-all duration-200 hover:shadow-xl hover:scale-105 group-hover:shadow-theme-primary/20">
        <CardContent className="p-4">
          {/* Imagen del Pokemon */}
          <div className="relative mb-3">
            <div className="aspect-square w-full bg-gradient-to-br from-theme-background to-theme-muted rounded-lg flex items-center justify-center overflow-hidden">
              {pokemon.image ? (
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 bg-theme-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">?</span>
                </div>
              )}
            </div>
            
            {/* Número de Pokémon */}
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              #{pokemonNumber}
            </div>
          </div>

          {/* Información del Pokemon */}
          <div className="text-center">
            <h3 className="font-semibold text-theme-foreground text-sm mb-1">
              {capitalizedName}
            </h3>
            
            {/* Placeholder para tipos - se podría obtener de una API */}
            <div className="flex justify-center space-x-1">
              <span className={`inline-block w-2 h-2 rounded-full ${getTypeColor()}`}></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}