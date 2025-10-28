import { api } from './axios'
import { cache } from '@/shared/lib/cache'

export interface Move {
  id: number
  name: string
  type: string
  damageClass: string
  power: number | null
  accuracy: number | null
  pp: number
  priority: number
  effect: string
  generationId: number
}

interface MovesListResponse {
  data: Move[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface MoveDetailsResponse {
  id: number
  name: string
  type: string
  damageClass: string
  power: number | null
  accuracy: number | null
  pp: number
  priority: number
  effectChance: number | null
  effect: string
  detailedEffect: string
  generationId: number
  target: string
  meta: {
    ailmentChance: number | null
    critRate: number
    drain: number
    flinchChance: number | null
    healing: number
    maxHits: number | null
    maxTurns: number | null
    minHits: number | null
    minTurns: number | null
    statChance: number | null
  }
}

/**
 * Servicio de API para Movimientos
 */
export const movesApi = {
  /**
   * Obtener lista de movimientos con filtros
   */
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    type?: string
    damageClass?: string
    generation?: number
  }): Promise<MovesListResponse> {
    const cacheKey = `moves_list_${JSON.stringify(params || {})}`
    const cached = cache.get<MovesListResponse>(cacheKey)
    
    if (cached) {
      console.log('📦 Movimientos cargados desde caché')
      return cached
    }

    console.log('🌐 Cargando movimientos desde API')
    const response = await api.get<MovesListResponse>('/moves', { params })
    
    // Guardar en caché por 24 horas (los movimientos no cambian)
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener detalles de un movimiento por ID
   */
  async getById(id: number | string): Promise<MoveDetailsResponse> {
    const cacheKey = `move_${id}`
    const cached = cache.get<MoveDetailsResponse>(cacheKey)
    
    if (cached) {
      console.log(`📦 Movimiento #${id} cargado desde caché`)
      return cached
    }

    console.log(`🌐 Cargando movimiento #${id} desde API`)
    const response = await api.get<MoveDetailsResponse>(`/moves/${id}`)
    
    // Guardar en caché por 24 horas
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener todos los tipos de movimientos
   */
  async getTypes(): Promise<Array<{ id: number; name: string }>> {
    const cacheKey = 'move_types'
    const cached = cache.get<any>(cacheKey)
    
    if (cached) {
      return cached.data
    }

    const response = await api.get<{ data: Array<{ id: number; name: string }> }>('/moves/types')
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data.data
  },

  /**
   * Obtener todas las clases de daño
   */
  async getDamageClasses(): Promise<Array<{ id: number; name: string }>> {
    const cacheKey = 'move_damage_classes'
    const cached = cache.get<any>(cacheKey)
    
    if (cached) {
      return cached.data
    }

    const response = await api.get<{ data: Array<{ id: number; name: string }> }>('/moves/damage-classes')
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data.data
  },

  /**
   * Limpiar caché de movimientos
   */
  clearCache(): void {
    cache.clearAll()
    console.log('🗑️ Caché de movimientos limpiado')
  },
}
