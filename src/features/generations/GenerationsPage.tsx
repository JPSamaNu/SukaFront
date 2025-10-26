import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generationsApi, type Generation } from '@/shared/api/generations.api'
import { Card } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

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

  // Mapeo de colores por generación
  const generationColors: Record<number, { bg: string; border: string; hover: string }> = {
    1: { bg: 'bg-red-50', border: 'border-red-300', hover: 'hover:border-red-500' },
    2: { bg: 'bg-yellow-50', border: 'border-yellow-300', hover: 'hover:border-yellow-500' },
    3: { bg: 'bg-green-50', border: 'border-green-300', hover: 'hover:border-green-500' },
    4: { bg: 'bg-blue-50', border: 'border-blue-300', hover: 'hover:border-blue-500' },
    5: { bg: 'bg-purple-50', border: 'border-purple-300', hover: 'hover:border-purple-500' },
    6: { bg: 'bg-pink-50', border: 'border-pink-300', hover: 'hover:border-pink-500' },
    7: { bg: 'bg-orange-50', border: 'border-orange-300', hover: 'hover:border-orange-500' },
    8: { bg: 'bg-indigo-50', border: 'border-indigo-300', hover: 'hover:border-indigo-500' },
    9: { bg: 'bg-teal-50', border: 'border-teal-300', hover: 'hover:border-teal-500' },
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-[color:var(--text)]">
          Generaciones Pokémon
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-300 rounded-lg p-6">
            <p className="text-red-800 font-semibold mb-4">{error}</p>
            <button
              onClick={loadGenerations}
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[color:var(--text)] mb-2">
          Generaciones Pokémon
        </h1>
        <p className="text-[color:var(--muted)] text-lg">
          Selecciona una generación para explorar sus Pokémon
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {generations.map((generation) => {
          const colors = generationColors[generation.id] || generationColors[1]
          const pokemonCount = typeof generation.pokemonCount === 'string' 
            ? parseInt(generation.pokemonCount) 
            : generation.pokemonCount
          
          return (
            <Card
              key={generation.id}
              className={`${colors.bg} border-2 ${colors.border} ${colors.hover} cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
              onClick={() => handleGenerationClick(generation.id)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-500">
                    GEN {generation.id}
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                    {pokemonCount} Pokémon
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2 capitalize">
                  {generation.name.replace(/-/g, ' ')}
                </h2>
                
                <p className="text-gray-600 font-medium mb-4">
                  {generation.region}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
