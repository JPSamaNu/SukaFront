import { api } from './axios'
import { cache } from '@/shared/lib/cache'

export interface Item {
  id: number
  name: string
  cost: number
  category: string
  effect: string
  sprite: string | null
  flingPower: number | null
  flingEffect: string | null
}

interface ItemsListResponse {
  data: Item[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface ItemDetailsResponse {
  id: number
  name: string
  cost: number
  category: string
  effect: string
  shortEffect: string
  sprite: string | null
  flingPower: number | null
  flingEffect: string | null
  flavorText: string
}

/**
 * Servicio de API para Items
 */
export const itemsApi = {
  /**
   * Obtener lista de items con filtros
   */
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
  }): Promise<ItemsListResponse> {
    const cacheKey = `items_list_${JSON.stringify(params || {})}`
    const cached = cache.get<ItemsListResponse>(cacheKey)
    
    if (cached) {
      console.log('📦 Items cargados desde caché')
      return cached
    }

    console.log('🌐 Cargando items desde API')
    const response = await api.get<ItemsListResponse>('/items', { params })
    
    // Guardar en caché por 24 horas (los items no cambian)
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener detalles de un item por ID
   */
  async getById(id: number | string): Promise<ItemDetailsResponse> {
    const cacheKey = `item_${id}`
    const cached = cache.get<ItemDetailsResponse>(cacheKey)
    
    if (cached) {
      console.log(`📦 Item #${id} cargado desde caché`)
      return cached
    }

    console.log(`🌐 Cargando item #${id} desde API`)
    const response = await api.get<ItemDetailsResponse>(`/items/${id}`)
    
    // Guardar en caché por 24 horas
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data
  },

  /**
   * Obtener todas las categorías de items
   */
  async getCategories(): Promise<Array<{ id: number; name: string }>> {
    const cacheKey = 'item_categories'
    const cached = cache.get<any>(cacheKey)
    
    if (cached) {
      return cached.data
    }

    const response = await api.get<{ data: Array<{ id: number; name: string }> }>('/items/categories')
    cache.set(cacheKey, response.data, 24 * 60 * 60 * 1000)
    
    return response.data.data
  },

  /**
   * Limpiar caché de items
   */
  clearCache(): void {
    cache.clearAll()
    console.log('🗑️ Caché de items limpiado')
  },
}
