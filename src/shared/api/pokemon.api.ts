import { api } from './axios'
import { cache } from '@/shared/lib/cache'
import type { Pokemon } from '@/shared/types/pokemon'

/**
 * Servicio de API para Pokémon individuales
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
