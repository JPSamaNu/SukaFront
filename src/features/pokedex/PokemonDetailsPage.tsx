import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { pokemonApi } from '@/shared/api/pokemon.api'
import type { Pokemon } from '@/shared/types/pokemon'
import TypeEffectivenessCard from './TypeEffectivenessCard'
import ErrorPage from '@/shared/components/ErrorPage'

export default function PokemonDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!id) return

      try {
        setLoading(true)
        const data = await pokemonApi.getById(id)
        console.log('🎮 Datos del Pokémon recibidos:', data)
        console.log('🎨 Sprites:', data.sprites)
        console.log('📊 Types:', data.types)
        console.log('💪 Stats:', data.stats)
        setPokemon(data)
      } catch (err) {
        console.error('❌ Error fetching pokemon:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar el Pokémon')
      } finally {
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [id])

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

  const getStatColor = (value: number) => {
    // Gradiente de color basado en el valor de la estadística
    // Retorna un gradiente CSS que va de azul a rojo
    const percentage = Math.min((value / 150) * 100, 100)
    
    // Crear un gradiente que cambia según el porcentaje
    if (percentage <= 20) {
      // Muy bajo: azul
      return 'bg-gradient-to-r from-blue-400 to-blue-500'
    } else if (percentage <= 40) {
      // Bajo: azul a verde
      return 'bg-gradient-to-r from-blue-500 to-green-500'
    } else if (percentage <= 60) {
      // Medio: verde a amarillo
      return 'bg-gradient-to-r from-green-500 to-yellow-500'
    } else if (percentage <= 80) {
      // Alto: amarillo a naranja
      return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    } else {
      // Muy alto: naranja a rojo
      return 'bg-gradient-to-r from-orange-500 to-red-500'
    }
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
      <ErrorPage
        title="Pokémon no encontrado"
        message={error || 'No pudimos encontrar el Pokémon que buscas. Puede que no exista o que haya ocurrido un error.'}
        showLogout={false}
      />
    )
  }

  const pokemonNumber = pokemon.id.toString().padStart(3, '0')
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
  const mainImage = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || null

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Volver
        </Button>
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
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
                {mainImage ? (
                  <>
                    <img
                      src={mainImage}
                      alt={pokemon.name}
                      className="w-full max-w-sm mx-auto cursor-pointer transition-transform hover:scale-105"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    {/* Botón para expandir imagen */}
                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      title="Ver en grande"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="w-64 h-64 mx-auto bg-theme-muted rounded-xl flex items-center justify-center">
                    <span className="text-4xl">?</span>
                  </div>
                )}
              </div>

              {/* Tipos */}
              <div className="flex justify-center gap-3">
                {pokemon.types && pokemon.types.length > 0 && pokemon.types.map((type, index) => {
                  // Manejar ambos formatos: string o {name: string, slot: number}
                  const typeName = typeof type === 'string' ? type : type?.name
                  if (!typeName) return null
                  return (
                    <span
                      key={index}
                      className={`min-w-[120px] px-5 py-2.5 rounded-full text-white text-base font-bold uppercase text-center inline-block ${getTypeColor(typeName)}`}
                    >
                      {typeName}
                    </span>
                  )
                })}
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
              {pokemon.stats && pokemon.stats.length > 0 && pokemon.stats.map((stat, index) => {
                const statName = stat?.name || 'unknown'
                // Manejar ambos formatos: base_stat (snake_case) o baseStat (camelCase)
                const baseStat = stat?.base_stat ?? stat?.baseStat ?? 0
                const percentage = Math.min((baseStat / 150) * 100, 100)
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-theme-muted-foreground">
                        {formatStatName(statName)}
                      </span>
                      <span className="text-sm font-bold">
                        {baseStat}
                      </span>
                    </div>
                    <div className="w-full bg-theme-muted rounded-full h-2">
                      <div
                        className={`${getStatColor(baseStat)} h-2 rounded-full transition-all duration-500`}
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
                  {pokemon.stats?.reduce((total, stat) => total + (stat?.base_stat ?? stat?.baseStat ?? 0), 0) || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efectividad de Tipos */}
      {pokemon.types && pokemon.types.length > 0 && (
        <TypeEffectivenessCard 
          types={pokemon.types.map(t => typeof t === 'string' ? t : t?.name || '')}
        />
      )}

      {/* Modal de imagen en grande */}
      {isImageModalOpen && mainImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsImageModalOpen(false)}
        >
          {/* Fondo semi-transparente oscuro */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Contenedor de la imagen */}
          <div className="relative z-10 max-w-full max-h-full">
            <img
              src={mainImage}
              alt={pokemon.name}
              className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Botón de cerrar */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              title="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Nombre del Pokémon */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full">
              <span className="text-lg font-bold">
                #{pokemonNumber} {capitalizedName}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}