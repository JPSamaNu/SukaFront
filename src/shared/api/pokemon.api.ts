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

    // Cachear por página específica
    const cacheKey = `pokemon_list_${JSON.stringify(queryParams)}`
    const cached = cache.get<PokemonListResponse>(cacheKey)
    
    if (cached) {
      console.log(`📦 Lista de Pokémon página ${params?.page || 1} cargada desde caché`)
      return cached
    }

    console.log(`🌐 Cargando lista de Pokémon página ${params?.page || 1} desde API`)
    const response = await api.get<PokemonListResponse>('/pokemon', { params: queryParams })
    
    // Guardar en caché por 1 hora (las listas pueden cambiar más seguido)
    cache.set(cacheKey, response.data, 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Limpiar caché de un Pokémon específico
   */
  clearCache(id: number | string): void {
    cache.remove(`pokemon_${id}`)
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
