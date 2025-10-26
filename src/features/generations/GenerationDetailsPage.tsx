import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generationsApi, type GenerationWithPokemon } from '@/shared/api/generations.api'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'

export default function GenerationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [generation, setGeneration] = useState<GenerationWithPokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadGeneration(parseInt(id))
    }
  }, [id])

  const loadGeneration = async (generationId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await generationsApi.getById(generationId)
      console.log('✅ Datos de la generación recibidos:', data)
      console.log('📊 Total de Pokémon:', data.pokemon?.length)
      console.log('🎨 Primer pokemon completo:', data.pokemon?.[0])
      console.log('🖼️ Sprites del primer pokemon:', data.pokemon?.[0]?.sprites)
      setGeneration(data)
    } catch (err: any) {
      console.error('❌ Error loading generation:', err)
      
      if (err.code === 'ECONNABORTED') {
        setError('La petición tardó demasiado. El servidor puede estar procesando muchos datos.')
      } else if (err.response) {
        setError(`Error del servidor: ${err.response.status} - ${err.response.statusText}`)
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.')
      } else {
        setError('Error al cargar la generación')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePokemonClick = (pokemonId: number) => {
    navigate(`/pokemon/${pokemonId}`)
  }

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-64 mb-8" />
        
        <div className="text-center py-12 mb-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--btn-bg)] mb-4"></div>
          <p className="text-[color:var(--muted)] text-lg">
            Cargando Pokémon de la generación...
          </p>
          <p className="text-[color:var(--muted)] text-sm mt-2">
            Esto puede tardar unos segundos
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(20)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !generation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate('/')} variant="outline" className="mb-6">
          ← Volver
        </Button>
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6">
            <p className="text-red-800 font-semibold mb-4">{error || 'Generación no encontrada'}</p>
            <button
              onClick={() => id && loadGeneration(parseInt(id))}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button onClick={() => navigate('/')} variant="outline" className="mb-6">
        ← Volver a Generaciones
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold text-[color:var(--text)] capitalize">
            {generation.info?.name ? generation.info.name.replace(/-/g, ' ') : `Generación ${generation.generation}`}
          </h1>
          <span className="px-4 py-2 bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] rounded-full text-sm font-semibold">
            GEN {generation.generation}
          </span>
        </div>
        <p className="text-[color:var(--muted)] text-lg">
          {generation.info?.region || 'Región desconocida'} • {generation.pokemonCount || 0} Pokémon
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {generation.pokemon && generation.pokemon.length > 0 ? (
          generation.pokemon.map((pokemon) => {
            // Usar artwork oficial si está disponible, sino sprite normal
            const imageUrl = pokemon.sprites?.other?.['official-artwork']?.front_default 
              || pokemon.sprites?.front_default
              || '/placeholder-pokemon.png'
            
            return (
              <Card
                key={pokemon.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 hover:border-[color:var(--btn-bg)]"
                onClick={() => handlePokemonClick(pokemon.id)}
              >
                <div className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={pokemon.name}
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-200"
                      loading="lazy"
                      onError={(e) => {
                        console.log('Error cargando imagen para:', pokemon.name, imageUrl)
                        e.currentTarget.src = '/placeholder-pokemon.png'
                      }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      N° {pokemon.id.toString().padStart(3, '0')}
                    </p>
                    <h3 className="font-bold text-gray-800 capitalize mb-2 truncate">
                      {pokemon.name}
                    </h3>
                    
                    <div className="flex gap-1 justify-center flex-wrap">
                      {pokemon.types && pokemon.types.map((type) => (
                        <span
                          key={type}
                          className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                            typeColors[type.toLowerCase()] || 'bg-gray-400'
                          }`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-[color:var(--muted)] text-lg">
              No se encontraron Pokémon para esta generación
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
