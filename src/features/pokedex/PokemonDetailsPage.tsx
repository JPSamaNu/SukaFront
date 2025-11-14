import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { pokemonApi } from '@/shared/api/pokemon.api'
import type { Pokemon } from '@/shared/types/pokemon'
import { TypeBadge } from '@/shared/components/neodex'
import TypeEffectivenessCard from './TypeEffectivenessCard'

export default function PokemonDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  
  // Estado de navegación desde GameDetailsPage
  const gameContext = location.state as { 
    fromGame?: boolean
    versionGroupId?: number
    versionGroupName?: string
  } | null
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
  const [isMovesExpanded, setIsMovesExpanded] = useState(false)

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
        console.log('🎯 Moves:', data.moves)
        console.log('🏆 Classification:', data.classification)
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
        <div className="pokedex-panel p-4">
          <div className="skeleton h-10 w-32 mb-2"></div>
          <div className="skeleton h-8 w-48"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="pokedex-panel p-6">
            <div className="skeleton aspect-square w-full max-w-md mx-auto"></div>
          </div>
          <div className="pokedex-panel p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          ← BACK
        </button>
        
        <div className="pokedex-panel p-12 text-center">
          <div className="text-6xl mb-4 opacity-30">❌</div>
          <h2 className="text-xl text-display text-neon mb-2">
            POKÉMON NOT FOUND
          </h2>
          <p className="text-neutral-400 mb-6 text-terminal text-sm">
            {error || 'Pokémon does not exist or an error occurred.'}
          </p>
          <button onClick={() => navigate('/pokemon')} className="btn-sukadex">
            Go to Pokédex
          </button>
        </div>
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
      <div className="pokedex-panel p-4">
        <button onClick={() => navigate(-1)} className="btn-secondary mb-3 text-xs">
          ← BACK
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-display text-2xl md:text-3xl text-neon">
            #{pokemonNumber} {capitalizedName.toUpperCase()}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Imagen y información básica */}
        <div className="pokedex-panel">
          <div className="pokedex-panel-header">
            <h3 className="panel-title">Basic Info</h3>
          </div>
          <div className="p-6">
            <div className="text-center space-y-4">
              {/* Switch Shiny */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="stat-label">
                  NORMAL
                </span>
                <button
                  onClick={() => setIsShiny(!isShiny)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pokedex-neon/40 ${
                    isShiny ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600' : 'bg-neutral-700'
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
                <span className={`text-xs text-terminal flex items-center gap-1 ${isShiny ? 'text-yellow-400' : 'text-neutral-600'}`}>
                  ✨ SHINY
                </span>
              </div>

              {/* Imagen principal */}
              <div className="relative bg-neutral-900/50 rounded-xl p-8 border border-neutral-800">
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
                      className="absolute top-2 right-2 bg-neutral-900/90 hover:bg-neutral-800 text-pokedex-neon p-2 rounded-lg transition-colors border border-neutral-700"
                      title="View fullscreen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="w-64 h-64 mx-auto bg-neutral-800/50 rounded-xl flex items-center justify-center border border-neutral-700">
                    <span className="text-4xl text-neutral-600">?</span>
                  </div>
                )}
              </div>

              {/* Tipos */}
              <div className="flex justify-center gap-3 flex-wrap">
                {pokemon.types && pokemon.types.length > 0 && pokemon.types.map((type, index) => {
                  const typeName = typeof type === 'string' ? type : type?.name
                  if (!typeName) return null
                  return (
                    <TypeBadge key={index} type={typeName} size="md" />
                  )
                })}
              </div>

              {/* Altura y peso */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-3 bg-neutral-900/30 rounded-lg border-terminal">
                  <p className="stat-label mb-1">HEIGHT</p>
                  <p className="text-lg font-bold text-neutral-200">{pokemon.height / 10} m</p>
                </div>
                <div className="text-center p-3 bg-neutral-900/30 rounded-lg border-terminal">
                  <p className="stat-label mb-1">WEIGHT</p>
                  <p className="text-lg font-bold text-neutral-200">{pokemon.weight / 10} kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="pokedex-panel">
          <div className="pokedex-panel-header">
            <h3 className="panel-title">
              Base Stats
            </h3>
          </div>
          <div className="p-6">
            {/* Header con Min y Max */}
            <div className="flex justify-end items-center mb-3 pr-1">
              <div className="flex items-center gap-4 stat-label">
                <span>MIN</span>
                <span>MAX</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {pokemon.stats && pokemon.stats.length > 0 && pokemon.stats.map((stat, index) => {
                const statName = stat?.name || 'unknown'
                const baseStat = stat?.base_stat ?? stat?.baseStat ?? 0
                const percentage = Math.min((baseStat / 150) * 100, 100)
                const { min, max } = calculateStats(baseStat, statName)
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3 min-w-fit">
                        <span className="stat-label min-w-[80px]">
                          {formatStatName(statName)}
                        </span>
                        <span className="stat-value w-[36px] text-right">{baseStat}</span>
                      </div>
                      <div className="flex-1 bg-theme-muted rounded-full h-2">
                        <div
                          className={`${getStatColor(baseStat)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-4 text-xs min-w-fit text-terminal">
                        <span className="text-neutral-500 w-[36px] text-right">{min}</span>
                        <span className="text-neutral-500 w-[36px] text-right">{max}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Total de estadísticas */}
            <div className="mt-6 pt-4 border-t border-terminal">
              <div className="flex items-center gap-3">
                <span className="text-terminal text-sm text-neutral-400 min-w-[80px]">TOTAL</span>
                <span className="stat-value text-lg">
                  {pokemon.stats?.reduce((total, stat) => total + (stat?.base_stat ?? stat?.baseStat ?? 0), 0) || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EVs que otorga */}
      {pokemon.stats && pokemon.stats.some(s => s.effort > 0) && (
          <div className="pokedex-panel">
            <div className="pokedex-panel-header">
              <h3 className="panel-title">Effort Values (EVs)</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {pokemon.stats.filter(s => s.effort > 0).map((stat, index) => (
                  <div key={index} className="badge-neon flex items-center gap-2 px-4 py-2">
                    <span className="stat-value">+{stat.effort}</span>
                    <span className="text-neutral-200 capitalize text-sm">
                      {formatStatName(stat.name)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-terminal text-xs text-neutral-500 mt-4">
                Effort Values (EVs) granted when defeated
              </p>
            </div>
          </div>
        )}

        {/* Clasificación */}
        {pokemon.classification && (
          <div className="pokedex-panel">
            <div className="pokedex-panel-header">
              <h3 className="panel-title">Classification & Breeding</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna izquierda */}
                <div className="space-y-4">
                  {/* Tipo de Pokémon */}
                  <div className="flex items-center justify-between py-2 border-b border-terminal">
                    <span className="stat-label">TYPE</span>
                    <div className="flex gap-2">
                      {pokemon.classification.isLegendary && (
                        <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold font-mono border border-yellow-500/30">
                          LEGENDARY
                        </span>
                      )}
                      {pokemon.classification.isMythical && (
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold font-mono border border-purple-500/30">
                          MYTHICAL
                        </span>
                      )}
                      {pokemon.classification.isBaby && (
                        <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-600 dark:text-pink-400 text-sm font-semibold">
                          Bebé
                        </span>
                      )}
                      {!pokemon.classification.isLegendary && !pokemon.classification.isMythical && !pokemon.classification.isBaby && (
                        <span className="px-3 py-1 rounded-full bg-theme-accent text-theme-foreground text-sm">
                          Normal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ratio de captura */}
                  <div className="flex items-center justify-between py-2 border-b border-theme-border">
                    <span className="text-theme-muted-foreground">Ratio de captura</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-theme-foreground">{pokemon.classification.captureRate}</span>
                      <span className="text-sm text-theme-muted-foreground">
                        ({Math.round((pokemon.classification.captureRate / 255) * 100)}%)
                      </span>
                    </div>
                  </div>

                  {/* Felicidad base */}
                  <div className="flex items-center justify-between py-2 border-b border-theme-border">
                    <span className="text-theme-muted-foreground">Felicidad base</span>
                    <span className="font-semibold text-theme-foreground">{pokemon.classification.baseHappiness}</span>
                  </div>

                  {/* Ritmo de crecimiento */}
                  <div className="flex items-center justify-between py-2 border-b border-theme-border">
                    <span className="text-theme-muted-foreground">Ritmo de crecimiento</span>
                    <span className="font-semibold text-theme-foreground capitalize">
                      {pokemon.classification.growthRate?.replace(/-/g, ' ')}
                    </span>
                  </div>

                  {/* Color */}
                  {pokemon.classification.color && (
                    <div className="flex items-center justify-between py-2 border-b border-theme-border">
                      <span className="text-theme-muted-foreground">Color</span>
                      <span className="font-semibold text-theme-foreground capitalize">
                        {pokemon.classification.color}
                      </span>
                    </div>
                  )}

                  {/* Hábitat */}
                  {pokemon.classification.habitat && (
                    <div className="flex items-center justify-between py-2 border-b border-theme-border">
                      <span className="text-theme-muted-foreground">Hábitat</span>
                      <span className="font-semibold text-theme-foreground capitalize">
                        {pokemon.classification.habitat?.replace(/-/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Columna derecha - Cría */}
                <div className="space-y-4">
                  {/* Grupos de huevo */}
                  <div className="py-2 border-b border-theme-border">
                    <span className="text-theme-muted-foreground block mb-2">Grupos de huevo</span>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.classification.eggGroups?.map((group, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-theme-accent text-theme-foreground text-sm capitalize">
                          {group?.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pasos para eclosionar */}
                  <div className="flex items-center justify-between py-2 border-b border-theme-border">
                    <span className="text-theme-muted-foreground">Pasos para eclosionar</span>
                    <span className="font-semibold text-theme-foreground">
                      {pokemon.classification.hatchCounter ? (pokemon.classification.hatchCounter * 256).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  {/* Género */}
                  <div className="py-2 border-b border-theme-border">
                    <span className="text-theme-muted-foreground block mb-2">Distribución de género</span>
                    {pokemon.classification.genderRate === -1 ? (
                      <span className="font-semibold text-theme-foreground">Sin género</span>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 dark:text-blue-400">♂</span>
                          <div className="flex-1 bg-theme-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${((8 - pokemon.classification.genderRate) / 8) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-theme-foreground w-12 text-right">
                            {((8 - pokemon.classification.genderRate) / 8 * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-pink-600 dark:text-pink-400">♀</span>
                          <div className="flex-1 bg-theme-muted rounded-full h-2">
                            <div
                              className="bg-pink-500 h-2 rounded-full"
                              style={{ width: `${(pokemon.classification.genderRate / 8) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-theme-foreground w-12 text-right">
                            {(pokemon.classification.genderRate / 8 * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Forma */}
                  {pokemon.classification.shape && (
                    <div className="flex items-center justify-between py-2 border-b border-theme-border">
                      <span className="text-theme-muted-foreground">Forma</span>
                      <span className="font-semibold text-theme-foreground capitalize">
                        {pokemon.classification.shape?.replace(/-/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Movimientos por nivel */}
        {pokemon.moves && pokemon.moves.length > 0 && (
          <div className="pokedex-panel">
            <div 
              className="pokedex-panel-header cursor-pointer hover:bg-neutral-800/50 transition-colors"
              onClick={() => setIsMovesExpanded(!isMovesExpanded)}
            >
              <div className="flex items-center justify-between">
                <h3 className="panel-title">
                  LEVEL-UP MOVES ({pokemon.moves.length})
                </h3>
                <svg 
                  className={`w-6 h-6 transition-transform duration-200 text-neon ${isMovesExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {isMovesExpanded && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-theme-border">
                        <th className="text-left py-3 px-4 text-theme-muted-foreground font-semibold">Nivel</th>
                        <th className="text-left py-3 px-4 text-theme-muted-foreground font-semibold">Movimiento</th>
                        <th className="text-left py-3 px-4 text-theme-muted-foreground font-semibold">Tipo</th>
                        <th className="text-left py-3 px-4 text-theme-muted-foreground font-semibold">Cat.</th>
                        <th className="text-center py-3 px-4 text-theme-muted-foreground font-semibold">Poder</th>
                        <th className="text-center py-3 px-4 text-theme-muted-foreground font-semibold">Prec.</th>
                        <th className="text-center py-3 px-4 text-theme-muted-foreground font-semibold">PP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pokemon.moves.map((move, index) => (
                        <tr key={index} className="border-b border-theme-border hover:bg-theme-accent transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-theme-primary">{move.level}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-theme-foreground capitalize">
                              {move.name?.replace(/-/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getTypeColor(move.type)}`}>
                              {move.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-theme-muted-foreground capitalize">
                              {move.damageClass === 'physical' ? '💥 Físico' : 
                               move.damageClass === 'special' ? '✨ Especial' : 
                               '🛡️ Estado'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-theme-foreground">
                              {move.power || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-theme-foreground">
                              {move.accuracy || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-semibold text-theme-foreground">{move.pp}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Efectividad de Tipos */}
      {pokemon.types && pokemon.types.length > 0 && (
        <TypeEffectivenessCard 
          types={pokemon.types.map(t => typeof t === 'string' ? t : t?.name || '')}
        />
      )}

      {/* Cadena de evolución */}
      {!loadingEvolution && evolutionChain && evolutionChain.chain && evolutionChain.chain.length > 0 && (
        <div className="pokedex-panel">
          <div className="pokedex-panel-header">
            <h3 className="panel-title">EVOLUTION CHAIN</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {evolutionChain.chain.map((baseChain, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-center gap-4">
                  {renderEvolutionChain(baseChain)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formas Alternativas */}
      {pokemonForms && (pokemonForms.megaEvolutions.length > 0 || pokemonForms.regionalForms.length > 0 || pokemonForms.otherForms.length > 0) && (
        <div className="pokedex-panel">
          <div className="pokedex-panel-header">
            <h3 className="panel-title">
              ✨ ALTERNATE FORMS
            </h3>
          </div>
          <div className="space-y-6">
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
          </div>
        </div>
      )}

      {/* Ubicaciones de Captura */}
      {pokemonLocations && pokemonLocations.total_encounters > 0 && (() => {
        // Filtrar versiones si venimos desde un juego específico
        const filteredVersions = gameContext?.fromGame && gameContext.versionGroupId
          ? pokemonLocations.versions.filter(v => v.version_group_id === gameContext.versionGroupId)
          : pokemonLocations.versions

        const totalFilteredEncounters = filteredVersions.reduce((sum, v) => sum + v.encounters.length, 0)

        if (totalFilteredEncounters === 0 && gameContext?.fromGame) {
          return (
            <div className="pokedex-panel">
              <div className="pokedex-panel-header">
                <h3 className="panel-title flex items-center gap-2">
                  CAPTURE LOCATIONS
                  {gameContext.versionGroupName && (
                    <span className="text-terminal text-xs text-neutral-500">
                      • {capitalizeName(gameContext.versionGroupName)}
                    </span>
                  )}
                </h3>
              </div>
              <div>
                <div className="text-center py-8 text-neutral-500 text-terminal">
                  <p>Este Pokémon no está disponible en {capitalizeName(gameContext.versionGroupName || 'este juego')}</p>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div className="pokedex-panel">
            <div className="pokedex-panel-header">
              <h3 className="panel-title flex items-center gap-2">
                CAPTURE LOCATIONS
                {gameContext?.fromGame && gameContext.versionGroupName && (
                  <span className="text-terminal text-xs text-neutral-500">
                    • {capitalizeName(gameContext.versionGroupName)}
                  </span>
                )}
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-[color:var(--muted)]">
                {totalFilteredEncounters} encuentro(s) en {filteredVersions.length} videojuego(s)
                {gameContext?.fromGame && (
                  <button
                    onClick={() => navigate(`/pokemon/${id}`)}
                    className="ml-2 text-[color:var(--primary)] hover:underline"
                  >
                    Ver todas las ubicaciones
                  </button>
                )}
              </p>

              <div className="space-y-3">
                {filteredVersions.map((versionData) => (
                <div 
                  key={versionData.version}
                  className="rounded-lg overflow-hidden transition-all"
                >
                  {/* Header del videojuego - clickeable para expandir */}
                  <button
                    onClick={() => toggleVersion(versionData.version)}
                    className="btn-secondary w-full px-4 py-3 flex items-center justify-between border-b border-neon/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-display font-bold capitalize text-neutral-200">
                          Pokémon {versionData.version.replace(/-/g, ' ')}
                        </p>
                        <p className="text-terminal text-xs text-neutral-500">
                          {versionData.generation?.replace(/-/g, ' ')} • {versionData.encounters.length} ubicación(es)
                        </p>
                      </div>
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 transition-transform text-neon ${expandedVersions.has(versionData.version) ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Lista de ubicaciones (expandible) */}
                  {expandedVersions.has(versionData.version) && (
                    <div className="bg-neutral-900">
                      {versionData.encounters.map((encounter, idx) => (
                        <div key={idx} className="px-4 py-3 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-neutral-200 capitalize font-mono">
                                {encounter.location?.replace(/-/g, ' ') || 'Ubicación desconocida'}
                              </p>
                              <p className="text-sm text-neutral-400 capitalize font-mono">
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
            </div>
          </div>
        )
      })()}

      {pokemonLocations && pokemonLocations.total_encounters === 0 && (
        <div className="pokedex-panel">
          <div className="pokedex-panel-header">
            <h3 className="panel-title">
              CAPTURE LOCATIONS
            </h3>
          </div>
          <div>
            <div className="text-center py-8 text-neutral-500 text-terminal">
              <p>Este Pokémon no se puede encontrar en estado salvaje</p>
              <p className="text-sm mt-1">(Puede ser obtenido mediante evolución, intercambio o eventos)</p>
            </div>
          </div>
        </div>
      )}

      {loadingLocations && (
        <div className="pokedex-panel">
          <div className="pokedex-panel-header">
            <h3 className="panel-title flex items-center gap-2">
              CAPTURE LOCATIONS
            </h3>
          </div>
          <div>
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 w-full"></div>
              ))}
            </div>
          </div>
        </div>
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
