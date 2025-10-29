import axios from 'axios'
import { cache } from '@/shared/lib/cache'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas

export const berriesApi = {
  /**
   * Obtener berries con filtros
   */
  async getBerries(params: {
    search?: string
    firmness?: string
    page?: number
    limit?: number
  }) {
    const cacheKey = `berries-${JSON.stringify(params)}`
    const cached = cache.get(cacheKey)
    
    if (cached) {
      console.log('🎯 Berries cargadas desde caché')
      return cached
    }

    const response = await axios.get(`${API_URL}/berries`, { params })
    cache.set(cacheKey, response.data, CACHE_DURATION)
    
    return response.data
  },

  /**
   * Obtener berry por ID
   */
  async getById(id: string | number) {
    const cacheKey = `berry-${id}`
    const cached = cache.get(cacheKey)
    
    if (cached) {
      console.log(`🎯 Berry ${id} cargada desde caché`)
      return cached
    }

    const response = await axios.get(`${API_URL}/berries/${id}`)
    cache.set(cacheKey, response.data, CACHE_DURATION)
    
    return response.data
  },

  /**
   * Obtener firmezas disponibles
   */
  async getFirmnesses() {
    const cacheKey = 'berry-firmnesses'
    const cached = cache.get(cacheKey)
    
    if (cached) {
      console.log('🎯 Firmezas cargadas desde caché')
      return cached
    }

    const response = await axios.get(`${API_URL}/berries/firmnesses`)
    cache.set(cacheKey, response.data, CACHE_DURATION)
    
    return response.data
  },

  /**
   * Obtener sabores disponibles
   */
  async getFlavors() {
    const cacheKey = 'berry-flavors'
    const cached = cache.get(cacheKey)
    
    if (cached) {
      console.log('🎯 Sabores cargados desde caché')
      return cached
    }

    const response = await axios.get(`${API_URL}/berries/flavors`)
    cache.set(cacheKey, response.data, CACHE_DURATION)
    
    return response.data
  },
}
