import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generationsApi, type GenerationWithPokemon, type Generation } from '@/shared/api/generations.api'
import { TypeBadge } from '@/shared/components/neodex'

export default function GenerationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [generation, setGeneration] = useState<GenerationWithPokemon | null>(null)
  const [generationInfo, setGenerationInfo] = useState<Generation | null>(null)
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
      
      // Cargar primero la lista de generaciones para obtener la info correcta
      const allGenerations = await generationsApi.getAll()
      const correctInfo = allGenerations.data.find(gen => gen.id === generationId)
      
      if (correctInfo) {
        setGenerationInfo(correctInfo)
      }
      
      // Luego cargar los pokemon de la generación
      const data = await generationsApi.getById(generationId)
      console.log('✅ Datos de la generación recibidos:', data)
      setGeneration(data)
    } catch (err: any) {
      console.error('❌ Error loading generation:', err)
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Server may be processing too much data.')
      } else if (err.response) {
        setError(`Server error: ${err.response.status}`)
      } else if (err.request) {
        setError('Cannot connect to server. Check backend is running.')
      } else {
        setError('Error loading generation data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePokemonClick = (pokemonId: number) => {
    navigate(`/pokemon/${pokemonId}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="pokedex-panel p-4">
          <div className="h-8 w-32 bg-neutral-800/50 rounded animate-pulse mb-4"></div>
          <div className="h-10 w-64 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-neutral-800/30 rounded animate-pulse"></div>
        </div>
        
        <div className="pokedex-panel p-12 text-center">
          <div className="relative inline-block mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-800 border-t-pokedex-neon"></div>
            <div className="absolute inset-0 rounded-full bg-pokedex-neon/20 blur-xl"></div>
          </div>
          <p className="text-neutral-400 font-mono text-sm mb-2">
            LOADING POKÉMON DATA...
          </p>
          <p className="text-neutral-600 font-mono text-xs">
            This may take a few seconds
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="pokedex-panel h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !generation) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/generations')}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg 
                   transition-colors font-mono text-sm border border-neutral-700"
        >
          ← Back to Generations
        </button>
        
        <div className="pokedex-panel p-12 text-center">
          <div className="text-6xl mb-4 opacity-30">⚠️</div>
          <h2 className="text-xl font-display tracking-wider text-pokedex-neon mb-2">
            ERROR LOADING GENERATION
          </h2>
          <p className="text-neutral-400 mb-6 font-mono text-sm">
            {error || 'Could not load Pokémon data. Please try again.'}
          </p>
          <button
            onClick={() => id && loadGeneration(parseInt(id))}
            className="px-6 py-3 bg-pokedex-neon/20 hover:bg-pokedex-neon/30 text-pokedex-neon rounded-lg 
                     transition-all font-mono border-2 border-pokedex-neon/60"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const genNumber = generation.generation
  const genName = generationInfo?.name ? generationInfo.name.replace(/-/g, ' ').toUpperCase() : `GENERATION ${genNumber}`
  const regionName = generationInfo?.region || generation.info?.region || 'UNKNOWN REGION'
  const pokemonCount = generationInfo?.pokemonCount || generation.pokemonCount || 0

  return (
    <div className="space-y-6">
      {/* Back button + Header */}
      <div className="pokedex-panel p-4">
        <button
          onClick={() => navigate('/generations')}
          className="mb-4 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg 
                   transition-colors font-mono text-xs border border-neutral-700"
        >
          ← BACK
        </button>

        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="font-display text-2xl md:text-3xl tracking-wider text-pokedex-neon">
            {genName}
          </h1>
          <span className="px-3 py-1 bg-pokedex-neon/20 text-pokedex-neon rounded-lg text-xs font-mono font-bold border border-pokedex-neon/40">
            GEN {genNumber}
          </span>
        </div>
        <p className="text-neutral-400 font-mono text-sm">
          {regionName} • {pokemonCount} POKÉMON
        </p>
      </div>

      {/* Grid de Pokémon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {generation.pokemon && generation.pokemon.length > 0 ? (
          generation.pokemon.map((pokemon) => {
            const imageUrl = pokemon.sprites?.other?.['official-artwork']?.front_default 
              || pokemon.sprites?.front_default
              || '/placeholder-pokemon.png'
            
            return (
              <div
                key={pokemon.id}
                className="group cursor-pointer transition-all duration-200 hover:-translate-y-1"
                onClick={() => handlePokemonClick(pokemon.id)}
              >
                <div className="pokedex-panel p-3 h-full hover:ring-2 hover:ring-pokedex-neon/60 transition-all">
                  {/* Sprite container */}
                  <div className="aspect-square bg-neutral-900/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden
                                border border-neutral-800 group-hover:border-pokedex-neon/40 transition-colors">
                    <img
                      src={imageUrl}
                      alt={pokemon.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-pokemon.png'
                      }}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="text-center">
                    <p className="text-[10px] text-neutral-500 font-mono font-semibold mb-1">
                      #{pokemon.id.toString().padStart(4, '0')}
                    </p>
                    <h3 className="font-semibold text-sm text-neutral-200 capitalize mb-2 truncate">
                      {pokemon.name}
                    </h3>
                    
                    {/* Type badges */}
                    <div className="flex gap-1 justify-center flex-wrap">
                      {pokemon.types && pokemon.types.map((type, index) => {
                        const typeName = typeof type === 'string' ? type : type?.name
                        if (!typeName) return null
                        return (
                          <TypeBadge key={`${typeName}-${index}`} type={typeName} size="sm" />
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full pokedex-panel p-12 text-center">
            <div className="text-6xl mb-4 opacity-30">❓</div>
            <p className="text-neutral-400 font-mono text-sm">
              NO POKÉMON FOUND IN THIS GENERATION
            </p>
          </div>
        )}
      </div>

      {/* Footer stats */}
      {generation.pokemon && generation.pokemon.length > 0 && (
        <div className="pokedex-panel p-4 text-center">
          <p className="text-xs text-neutral-500 font-mono">
            💾 SHOWING {generation.pokemon.length} POKÉMON FROM GENERATION {genNumber}
          </p>
        </div>
      )}
    </div>
  )
}
