import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { pokemonApi } from '@/shared/api/pokemon.api'
import type { Pokemon } from '@/shared/types/pokemon'

export default function PokemonDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [evolutionChain, setEvolutionChain] = useState<{
    chain: Array<{
      id: number
      name: string
      sprite: string
      isCurrent: boolean
      requirements: string | null
      evolvesTo: any[]
    }>
  } | null>(null)
  const [loadingEvolution, setLoadingEvolution] = useState(false)
  const [isShiny, setIsShiny] = useState(false)
  const [pokemonForms, setPokemonForms] = useState<{
    megaEvolutions: any[]
    regionalForms: any[]
    otherForms: any[]
    totalForms: number
  } | null>(null)
  const [pokemonLocations, setPokemonLocations] = useState<{
    pokemon_id: number
    total_encounters: number
    versions: Array<{
      version: string
      version_id: number
      version_group: string
      version_group_id: number
      generation: string
      encounters: Array<{
        location: string
        location_id: number
        location_area: string
        location_area_game_index: number
        min_level: number
        max_level: number
        encounter_method: string
        encounter_method_id: number
        rarity: number
      }>
    }>
  } | null>(null)
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

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

  // Cargar cadena de evolución
  useEffect(() => {
    const fetchEvolution = async () => {
      if (!id) return

      try {
        setLoadingEvolution(true)
        // Limpiar el caché de evoluciones antes de cargar
        pokemonApi.clearCache(id)
        const evolutionData = await pokemonApi.getEvolutionChain(id)
        console.log('🔄 Cadena de evolución:', evolutionData)
        setEvolutionChain(evolutionData)
      } catch (err) {
        console.error('❌ Error fetching evolution chain:', err)
      } finally {
        setLoadingEvolution(false)
      }
    }

    fetchEvolution()
  }, [id])

  // Cargar formas alternativas (mega evoluciones, etc.)
  useEffect(() => {
    const fetchForms = async () => {
      if (!id) return

      try {
        const formsData = await pokemonApi.getForms(id)
        console.log('💎 Formas del Pokémon:', formsData)
        setPokemonForms(formsData)
      } catch (err) {
        console.error('❌ Error fetching pokemon forms:', err)
      }
    }

    fetchForms()
  }, [id])

  // Cargar ubicaciones de captura
  useEffect(() => {
    const fetchLocations = async () => {
      if (!id) return

      try {
        setLoadingLocations(true)
        const locationsData = await pokemonApi.getLocations(id)
        console.log('📍 Ubicaciones del Pokémon:', locationsData)
        setPokemonLocations(locationsData)
      } catch (err) {
        console.error('❌ Error fetching pokemon locations:', err)
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [id])

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(version)) {
        newSet.delete(version)
      } else {
        newSet.add(version)
      }
      return newSet
    })
  }

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

  const capitalizeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Calcular estadísticas mínimas y máximas en nivel 100
  const calculateStats = (baseStat: number, statName: string) => {
    if (statName === 'hp') {
      // Fórmula para HP
      const min = Math.floor(((2 * baseStat + 0 + 0) * 100) / 100) + 100 + 10
      const max = Math.floor(((2 * baseStat + 31 + 63) * 100) / 100) + 100 + 10
      return { min, max }
    } else {
      // Fórmula para otras stats
      const min = Math.floor((Math.floor(((2 * baseStat + 0 + 0) * 100) / 100) + 5) * 0.9)
      const max = Math.floor((Math.floor(((2 * baseStat + 31 + 63) * 100) / 100) + 5) * 1.1)
      return { min, max }
    }
  }

  // Función recursiva para renderizar la cadena de evolución
  const renderEvolutionChain = (pokemon: any): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    // Renderizar el Pokemon actual
    const isCurrent = pokemon.isCurrent;
    elements.push(
      <div key={`pokemon-${pokemon.id}`} className="flex flex-col items-center gap-2">
        <div 
          className={`w-32 h-32 bg-gradient-to-br ${
            isCurrent 
              ? 'from-yellow-50 to-yellow-100 ring-4 ring-yellow-400 shadow-lg' 
              : 'from-gray-50 to-gray-100 hover:shadow-lg transition-shadow'
          } rounded-xl p-4 ${!isCurrent ? 'cursor-pointer group' : ''}`}
          onClick={() => !isCurrent && navigate(`/pokemon/${pokemon.id}`)}
        >
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className={`w-full h-full object-contain ${!isCurrent ? 'group-hover:scale-105 transition-transform' : ''}`}
          />
        </div>
        <p className="text-sm font-medium text-center">
          #{pokemon.id.toString().padStart(3, '0')}
        </p>
        <p className={`text-base font-bold text-center ${isCurrent ? 'text-yellow-600' : ''}`}>
          {capitalizeName(pokemon.name)}
        </p>
      </div>
    );

    // Si tiene evoluciones, renderizar flechas y evoluciones
    if (pokemon.evolvesTo && pokemon.evolvesTo.length > 0) {
      pokemon.evolvesTo.forEach((evolution: any, index: number) => {
        // Renderizar flecha con requisito
        elements.push(
          <div key={`arrow-${pokemon.id}-${evolution.id}-${index}`} className="flex flex-col items-center gap-2 mx-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {evolution.requirements && (
              <p className="text-xs text-gray-600 text-center max-w-[120px]">
                {evolution.requirements}
              </p>
            )}
          </div>
        );

        // Renderizar la evolución recursivamente
        elements.push(...renderEvolutionChain(evolution));
      });
    }

    return elements;
  };

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
      <div className="text-center py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <p className="text-red-600 mb-4">{error || 'Pokémon no encontrado'}</p>
            <Button onClick={() => navigate(-1)}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Datos a mostrar (actual del pokemon base para numero y nombre base)
  const pokemonNumber = pokemon.id.toString().padStart(3, '0')
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
  
  // Imagen principal: normal o shiny según el switch
  const officialArtwork = pokemon.sprites?.other?.['official-artwork'] as any
  const mainImage = isShiny 
    ? (officialArtwork?.front_shiny || 
       pokemon.sprites?.front_shiny || 
       officialArtwork?.front_default || 
       pokemon.sprites?.front_default || null)
    : (officialArtwork?.front_default || 
       pokemon.sprites?.front_default || null)

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
              {/* Switch Shiny */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Normal
                </span>
                <button
                  onClick={() => setIsShiny(!isShiny)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isShiny ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={isShiny}
                >
                  <span
                    className={`${
                      isShiny ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform`}
                  />
                </button>
                <span className={`text-sm font-medium flex items-center gap-1 ${isShiny ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
                  ✨ Shiny
                </span>
              </div>

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
            {/* Header con Min y Max */}
            <div className="flex justify-end items-center mb-3 pr-1">
              <div className="flex items-center gap-4 text-xs font-medium text-theme-muted-foreground">
                <span>Min</span>
                <span>Max</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {pokemon.stats && pokemon.stats.length > 0 && pokemon.stats.map((stat, index) => {
                const statName = stat?.name || 'unknown'
                // Manejar ambos formatos: base_stat (snake_case) o baseStat (camelCase)
                const baseStat = stat?.base_stat ?? stat?.baseStat ?? 0
                const percentage = Math.min((baseStat / 150) * 100, 100)
                const { min, max } = calculateStats(baseStat, statName)
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3 min-w-fit">
                        <span className="text-sm font-medium text-theme-muted-foreground min-w-[80px]">
                          {formatStatName(statName)}
                        </span>
                        <span className="font-bold text-theme-foreground w-[36px] text-right">{baseStat}</span>
                      </div>
                      <div className="flex-1 bg-theme-muted rounded-full h-2">
                        <div
                          className={`${getStatColor(baseStat)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-4 text-sm min-w-fit">
                        <span className="text-theme-muted-foreground w-[36px] text-right">{min}</span>
                        <span className="text-theme-muted-foreground w-[36px] text-right">{max}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Total de estadísticas */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-3">
                <span className="font-medium text-theme-foreground min-w-[80px]">Total</span>
                <span className="text-lg font-bold">
                  {pokemon.stats?.reduce((total, stat) => total + (stat?.base_stat ?? stat?.baseStat ?? 0), 0) || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cadena de evolución */}
      {!loadingEvolution && evolutionChain && evolutionChain.chain && evolutionChain.chain.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cadena de evolución</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {evolutionChain.chain.map((baseChain, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-center gap-4">
                  {renderEvolutionChain(baseChain)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formas Alternativas */}
      {pokemonForms && (pokemonForms.megaEvolutions.length > 0 || pokemonForms.regionalForms.length > 0 || pokemonForms.otherForms.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>✨ Formas Alternativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mega Evoluciones */}
            {pokemonForms.megaEvolutions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💎</span> Mega Evoluciones
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pokemonForms.megaEvolutions.map((form) => (
                    <div 
                      key={form.pokemonId}
                      className="group relative flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-800/30 border-2 border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/pokemon/${form.pokemonId}`)}
                    >
                      <div className="relative">
                        <img
                          src={form.sprite}
                          alt={form.formName}
                          className="w-24 h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          #{form.pokemonId}
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-purple-800 dark:text-purple-200">
                          {capitalizeName(form.formName.replace(`${pokemon.name}-`, '').replace('-', ' '))}
                        </p>
                        {form.isBattleOnly && (
                          <span className="inline-block text-xs px-2 py-1 rounded-full bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200">
                            ⚔️ Solo batalla
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Formas Regionales */}
            {pokemonForms.regionalForms.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌍</span> Formas Regionales
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pokemonForms.regionalForms.map((form) => (
                    <div 
                      key={form.pokemonId}
                      className="group relative flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-blue-800/30 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/pokemon/${form.pokemonId}`)}
                    >
                      <div className="relative">
                        <img
                          src={form.sprite}
                          alt={form.formName}
                          className="w-24 h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          #{form.pokemonId}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-blue-800 dark:text-blue-200 text-center">
                        {capitalizeName(form.formName.replace(`${pokemon.name}-`, '').replace('-', ' '))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Otras Formas */}
            {pokemonForms.otherForms.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span> Otras Formas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pokemonForms.otherForms.map((form) => (
                    <div 
                      key={form.pokemonId}
                      className="group relative flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-900/30 dark:via-yellow-900/30 dark:to-amber-800/30 border-2 border-amber-300 dark:border-amber-600 hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/pokemon/${form.pokemonId}`)}
                    >
                      <div className="relative">
                        <img
                          src={form.sprite}
                          alt={form.formName}
                          className="w-24 h-24 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          #{form.pokemonId}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-200 text-center">
                        {capitalizeName(form.formName.replace(`${pokemon.name}-`, '').replace('-', ' '))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ubicaciones de Captura */}
      {pokemonLocations && pokemonLocations.total_encounters > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Ubicaciones de Captura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[color:var(--muted)]">
              {pokemonLocations.total_encounters} encuentro(s) en {pokemonLocations.versions.length} videojuego(s)
            </p>

            <div className="space-y-3">
              {pokemonLocations.versions.map((versionData) => (
                <div 
                  key={versionData.version}
                  className="rounded-lg overflow-hidden transition-all"
                >
                  {/* Header del videojuego - clickeable para expandir */}
                  <button
                    onClick={() => toggleVersion(versionData.version)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-[color:var(--card)] hover:bg-[color:var(--accent)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="font-bold capitalize text-[color:var(--foreground)]">
                          Pokémon {versionData.version.replace(/-/g, ' ')}
                        </p>
                        <p className="text-xs text-[color:var(--muted)]">
                          {versionData.generation?.replace(/-/g, ' ')} • {versionData.encounters.length} ubicación(es)
                        </p>
                      </div>
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 transition-transform ${expandedVersions.has(versionData.version) ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Lista de ubicaciones (expandible) */}
                  {expandedVersions.has(versionData.version) && (
                    <div className="bg-[color:var(--background)]">
                      {versionData.encounters.map((encounter, idx) => (
                        <div key={idx} className="px-4 py-3 hover:bg-[color:var(--accent)] transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-[color:var(--foreground)] capitalize">
                                {encounter.location?.replace(/-/g, ' ') || 'Ubicación desconocida'}
                              </p>
                              <p className="text-sm text-[color:var(--muted)] capitalize">
                                {encounter.location_area?.replace(/-/g, ' ') || 'Área desconocida'}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                                  Nivel {encounter.min_level}{encounter.min_level !== encounter.max_level ? `-${encounter.max_level}` : ''}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium capitalize">
                                  {encounter.encounter_method?.replace(/-/g, ' ') || 'Desconocido'}
                                </span>
                                {encounter.rarity && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium">
                                    {encounter.rarity}% rareza
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pokemonLocations.total_encounters === 0 && (
              <div className="text-center py-8 text-[color:var(--muted)]">
                <p>Este Pokémon no se puede encontrar en estado salvaje</p>
                <p className="text-sm mt-1">(Puede ser obtenido mediante evolución, intercambio o eventos)</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loadingLocations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Ubicaciones de Captura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
