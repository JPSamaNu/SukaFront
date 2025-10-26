import { api } from './axios'
import { cache } from '@/shared/lib/cache'

// Tipos para las generaciones
export interface Generation {
  id: number
  name: string
  region: string
  pokemonCount: string | number
}

export interface GenerationsResponse {
  data: Generation[]
  total: number
}

export interface GenerationWithPokemon {
  generation: number
  info: {
    name: string
    region: string
  }
  pokemonCount: number
  pokemon?: Array<{
    id: number
    name: string
    types?: string[]
    sprites?: {
      front_default: string | null
      front_shiny: string | null
      front_female: string | null
      front_shiny_female: string | null
      back_default: string | null
      back_shiny: string | null
      back_female: string | null
      back_shiny_female: string | null
      other?: {
        dream_world?: { front_default: string }
        home?: { front_default: string }
        'official-artwork'?: { front_default: string }
      }
    }
    base_experience?: number
  }>
}

/**
 * Servicio de API para Generaciones
 */
export const generationsApi = {
  /**
   * Obtener todas las generaciones
   */
  async getAll(): Promise<GenerationsResponse> {
    // Intentar obtener del caché primero
    const cacheKey = 'generations_all'
    const cached = cache.get<GenerationsResponse>(cacheKey)
    
    if (cached) {
      console.log('📦 Generaciones cargadas desde caché')
      return cached
    }

    // Si no está en caché, hacer la petición
    console.log('🌐 Cargando generaciones desde API')
    const response = await api.get<GenerationsResponse>('/generations')
    
    // Guardar en caché por 24 horas (las generaciones no cambian frecuentemente)
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener generación por ID con sus Pokemon
   */
  async getById(id: number): Promise<GenerationWithPokemon> {
    // Intentar obtener del caché primero
    const cacheKey = `generation_${id}`
    const cached = cache.get<GenerationWithPokemon>(cacheKey)
    
    if (cached) {
      console.log(`📦 Generación ${id} cargada desde caché (${cached.pokemon?.length || 0} Pokémon)`)
      return cached
    }

    // Si no está en caché, hacer la petición
    console.log(`🌐 Cargando generación ${id} desde API`)
    const response = await api.get<GenerationWithPokemon>(`/generations/${id}`)
    
    // Guardar en caché por 24 horas
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener solo Pokemon de una generación
   */
  async getPokemon(id: number) {
    const cacheKey = `generation_${id}_pokemon`
    const cached = cache.get(cacheKey)
    
    if (cached) {
      console.log(`📦 Pokémon de generación ${id} cargados desde caché`)
      return cached
    }

    console.log(`🌐 Cargando Pokémon de generación ${id} desde API`)
    const response = await api.get(`/generations/${id}/pokemon`)
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener conteo de Pokemon en una generación
   */
  async getCount(id: number): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>(`/generations/${id}/count`)
    return response.data
  },

  /**
   * Limpiar caché de generaciones
   */
  clearCache(): void {
    cache.clearAll()
    console.log('🗑️ Caché de generaciones limpiado')
  },
}
