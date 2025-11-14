import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generationsApi, type Generation } from '@/shared/api/generations.api'

export default function GenerationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadGenerations()
  }, [])

  const loadGenerations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await generationsApi.getAll()
      console.log('Generaciones recibidas:', response)
      setGenerations(response.data)
    } catch (err) {
      console.error('Error loading generations:', err)
      setError('Error al cargar las generaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerationClick = (generationId: number) => {
    navigate(`/generation/${generationId}`)
  }

  // Colores y regiones por generación
  const generationInfo: Record<number, { color: string; region: string; emoji: string }> = {
    1: { color: 'from-red-600 to-red-800', region: 'KANTO', emoji: '🔴' },
    2: { color: 'from-yellow-600 to-yellow-800', region: 'JOHTO', emoji: '🟡' },
    3: { color: 'from-green-600 to-green-800', region: 'HOENN', emoji: '🟢' },
    4: { color: 'from-blue-600 to-blue-800', region: 'SINNOH', emoji: '🔵' },
    5: { color: 'from-purple-600 to-purple-800', region: 'UNOVA', emoji: '🟣' },
    6: { color: 'from-pink-600 to-pink-800', region: 'KALOS', emoji: '🌸' },
    7: { color: 'from-orange-600 to-orange-800', region: 'ALOLA', emoji: '🟠' },
    8: { color: 'from-indigo-600 to-indigo-800', region: 'GALAR', emoji: '⚪' },
    9: { color: 'from-teal-600 to-teal-800', region: 'PALDEA', emoji: '🟤' },
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="pokedex-panel p-6">
          <div className="h-8 w-64 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-neutral-800/30 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="pokedex-panel h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pokedex-panel p-6 text-center">
        <div className="text-6xl mb-4 opacity-30">⚠️</div>
        <h2 className="text-xl font-display tracking-wider text-pokedex-neon mb-2">
          ERROR LOADING DATA
        </h2>
        <p className="text-neutral-400 mb-6 font-mono text-sm">
          {error}
        </p>
        <button
          onClick={loadGenerations}
          className="px-6 py-3 bg-pokedex-neon/20 hover:bg-pokedex-neon/30 text-pokedex-neon rounded-lg 
                   transition-all font-mono border-2 border-pokedex-neon/60"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pokedex-panel p-6">
        <h1 className="font-display text-2xl md:text-3xl tracking-wider text-pokedex-neon mb-2">
          POKÉMON GENERATIONS
        </h1>
        <p className="text-sm text-neutral-400 font-mono">
          SELECT A GENERATION TO EXPLORE
        </p>
      </div>

      {/* Grid de generaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {generations.map((generation) => {
          const info = generationInfo[generation.id] || generationInfo[1]
          const pokemonCount = typeof generation.pokemonCount === 'string' 
            ? parseInt(generation.pokemonCount) 
            : generation.pokemonCount
          
          return (
            <button
              key={generation.id}
              onClick={() => handleGenerationClick(generation.id)}
              className="group pokedex-panel overflow-hidden hover:ring-2 hover:ring-pokedex-neon/60 transition-all text-left"
            >
              {/* Header con gradiente de color */}
              <div className={`bg-gradient-to-br ${info.color} p-4 border-b-2 border-neutral-900`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 font-mono text-xs font-semibold tracking-wider">
                    GENERATION {generation.id}
                  </span>
                  <span className="text-3xl">{info.emoji}</span>
                </div>
                <h2 className="text-white font-display text-xl tracking-wider mb-1">
                  {info.region}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/60 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-white/90 font-mono text-xs font-semibold">
                    {pokemonCount}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-neutral-900/50 flex items-center justify-between">
                <span className="text-neutral-400 font-mono text-xs">
                  {generation.name.replace(/-/g, ' ').toUpperCase()}
                </span>
                <span className="text-pokedex-neon/50 group-hover:text-pokedex-neon group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Stats footer */}
      <div className="pokedex-panel p-4 text-center">
        <p className="text-xs text-neutral-500 font-mono">
          💾 DATABASE: {generations.length} GENERATIONS LOADED | 
          {' '}{generations.reduce((acc, gen) => {
            const count = typeof gen.pokemonCount === 'string' 
              ? parseInt(gen.pokemonCount) 
              : gen.pokemonCount
            return acc + count
          }, 0)} TOTAL POKÉMON
        </p>
      </div>
    </div>
  )
}
