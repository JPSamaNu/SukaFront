import { api } from './axios'
import { cache } from '@/shared/lib/cache'
import type { Pokemon } from '@/shared/types/pokemon'

interface PokemonListResponse {
  data: Array<{
    id: number
    name: string
    types: Array<{ name: string; slot: number }>
    sprites: {
      front_default: string | null
      other?: {
        'official-artwork'?: {
          front_default: string | null
        }
      }
    }
  }>
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Servicio de API para Pokémon
 */
export const pokemonApi = {
  /**
   * Obtener un Pokémon por ID
   */
  async getById(id: number | string): Promise<Pokemon> {
    // Intentar obtener del caché primero
    const cacheKey = `pokemon_${id}`
    const cached = cache.get<Pokemon>(cacheKey)
    
    if (cached) {
      console.log(`📦 Pokémon #${id} cargado desde caché`)
      return cached
    }

    // Si no está en caché, hacer la petición
    console.log(`🌐 Cargando Pokémon #${id} desde API`)
    const response = await api.get<Pokemon>(`/pokemon/${id}`)
    
    // Guardar en caché por 24 horas
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener lista paginada de todos los Pokémon
   * NOTA: No usa caché debido al gran volumen de datos y paginación dinámica
   */
  async getAll(params?: {
    page?: number
    limit?: number
    generation?: number
    type?: string
    search?: string
    sortBy?: 'id' | 'name' | 'base_experience'
    sortOrder?: 'ASC' | 'DESC'
  }): Promise<PokemonListResponse> {
    // Construir parámetros de la query
    const queryParams: Record<string, string> = {}
    
    if (params?.page !== undefined) queryParams.page = params.page.toString()
    if (params?.limit !== undefined) queryParams.limit = params.limit.toString()
    if (params?.generation !== undefined) queryParams.generation = params.generation.toString()
    if (params?.type) queryParams.type = params.type
    if (params?.search) queryParams.search = params.search
    if (params?.sortBy) queryParams.sortBy = params.sortBy
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder

    console.log(`🌐 Cargando lista de Pokémon página ${params?.page || 1} desde API`)
    const response = await api.get<PokemonListResponse>('/pokemon', { params: queryParams })
    
    return response.data
  },

  /**
   * Obtener cadena de evolución de un Pokémon
   */
  async getEvolutionChain(id: number | string): Promise<{
    chain: Array<{
      id: number
      name: string
      sprite: string
      isCurrent: boolean
      requirements: string | null
      evolvesTo: any[]
    }>
  }> {
    // Intentar obtener del caché primero
    const cacheKey = `pokemon_evolution_${id}`
    const cached = cache.get<any>(cacheKey)
    
    if (cached) {
      console.log(`📦 Evolución de Pokémon #${id} cargada desde caché`)
      return cached
    }

    // Si no está en caché, hacer la petición
    console.log(`🌐 Cargando evolución de Pokémon #${id} desde API`)
    const response = await api.get(`/pokemon/${id}/evolution`)
    
    // Guardar en caché por 24 horas (las evoluciones no cambian)
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener formas alternativas de un Pokémon (mega evoluciones, formas regionales, etc.)
   */
  async getForms(id: number | string): Promise<{
    megaEvolutions: Array<{
      pokemonId: number
      pokemonName: string
      formId: number
      formName: string
      sprite: string
      isBattleOnly: boolean
    }>
    regionalForms: Array<{
      pokemonId: number
      pokemonName: string
      formId: number
      formName: string
      sprite: string
      isBattleOnly: boolean
    }>
    otherForms: Array<{
      pokemonId: number
      pokemonName: string
      formId: number
      formName: string
      sprite: string
      isBattleOnly: boolean
    }>
    totalForms: number
  }> {
    // Intentar obtener del caché primero
    const cacheKey = `pokemon_forms_${id}`
    const cached = cache.get<any>(cacheKey)
    
    if (cached) {
      console.log(`📦 Formas de Pokémon #${id} cargadas desde caché`)
      return cached
    }

    // Si no está en caché, hacer la petición
    console.log(`🌐 Cargando formas de Pokémon #${id} desde API`)
    const response = await api.get(`/pokemon/${id}/forms`)
    
    // Guardar en caché por 24 horas (las formas no cambian)
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener ubicaciones de captura de un Pokémon por videojuego
   */
  async getLocations(id: number | string): Promise<{
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
    message: string
  }> {
    // Intentar obtener del caché primero
    const cacheKey = `pokemon_locations_${id}`
    const cached = cache.get<any>(cacheKey)
    
    if (cached) {
      console.log(`📦 Ubicaciones de Pokémon #${id} cargadas desde caché`)
      return cached
    }

    // Si no está en caché, hacer la petición
    console.log(`🌐 Cargando ubicaciones de Pokémon #${id} desde API`)
    const response = await api.get(`/pokemon/${id}/locations`)
    
    // Guardar en caché por 24 horas (las ubicaciones no cambian)
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Limpiar caché de un Pokémon específico
   */
  clearCache(id: number | string): void {
    cache.remove(`pokemon_${id}`)
    cache.remove(`pokemon_evolution_${id}`)
    cache.remove(`pokemon_forms_${id}`)
    cache.remove(`pokemon_locations_${id}`)
    console.log(`🗑️ Caché del Pokémon #${id} limpiado`)
  },

  /**
   * Limpiar todo el caché de Pokémon
   */
  clearAllCache(): void {
    cache.clearAll()
    console.log('🗑️ Todo el caché de Pokémon limpiado')
  },
}
