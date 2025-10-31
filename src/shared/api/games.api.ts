import { api } from './axios'
import { cache } from '@/shared/lib/cache'

export interface VersionGroup {
  id: number
  name: string
  generationId: number
  generationName: string
  versionCount: number
  versions: Array<{
    id: number
    name: string
  }>
}

export interface Version {
  id: number
  name: string
  versionGroupId: number
  versionGroupName: string
  generationId: number
  generationName: string
}

export interface PokedexEntry {
  id: number
  name: string
  speciesName: string
  order: number
  pokedexNumber: number
  pokedexName: string
}

/**
 * Servicio de API para Juegos de Pokémon
 */
export const gamesApi = {
  /**
   * Obtener todos los grupos de versiones (juegos)
   */
  async getAllVersionGroups(): Promise<VersionGroup[]> {
    const cacheKey = 'version_groups_all'
    const cached = cache.get<VersionGroup[]>(cacheKey)
    
    if (cached) {
      console.log('📦 Version groups cargados desde caché')
      return cached
    }

    console.log('🌐 Cargando version groups desde API')
    const response = await api.get<VersionGroup[]>('/games/version-groups')
    
    cache.set(cacheKey, response.data, 3600000) // 1 hora
    return response.data
  },

  /**
   * Obtener detalles de un grupo de versiones
   */
  async getVersionGroupById(id: number): Promise<VersionGroup> {
    const cacheKey = `version_group_${id}`
    const cached = cache.get<VersionGroup>(cacheKey)
    
    if (cached) {
      console.log(`📦 Version group ${id} cargado desde caché`)
      return cached
    }

    console.log(`🌐 Cargando version group ${id} desde API`)
    const response = await api.get<VersionGroup>(`/games/version-groups/${id}`)
    
    cache.set(cacheKey, response.data, 3600000)
    return response.data
  },

  /**
   * Obtener la Pokédex de un grupo de versiones
   */
  async getPokedexByVersionGroup(versionGroupId: number): Promise<PokedexEntry[]> {
    const cacheKey = `pokedex_version_group_${versionGroupId}`
    const cached = cache.get<PokedexEntry[]>(cacheKey)
    
    if (cached) {
      console.log(`📦 Pokédex del version group ${versionGroupId} cargada desde caché`)
      return cached
    }

    console.log(`🌐 Cargando Pokédex del version group ${versionGroupId} desde API`)
    const response = await api.get<PokedexEntry[]>(`/games/version-groups/${versionGroupId}/pokedex`)
    
    cache.set(cacheKey, response.data, 3600000)
    return response.data
  },

  /**
   * Obtener todas las versiones individuales
   */
  async getAllVersions(): Promise<Version[]> {
    const cacheKey = 'versions_all'
    const cached = cache.get<Version[]>(cacheKey)
    
    if (cached) {
      console.log('📦 Versions cargadas desde caché')
      return cached
    }

    console.log('🌐 Cargando versions desde API')
    const response = await api.get<Version[]>('/games/versions')
    
    cache.set(cacheKey, response.data, 3600000)
    return response.data
  },

  /**
   * Obtener detalles de una versión individual
   */
  async getVersionById(id: number): Promise<Version> {
    const cacheKey = `version_${id}`
    const cached = cache.get<Version>(cacheKey)
    
    if (cached) {
      console.log(`📦 Version ${id} cargada desde caché`)
      return cached
    }

    console.log(`🌐 Cargando version ${id} desde API`)
    const response = await api.get<Version>(`/games/versions/${id}`)
    
    cache.set(cacheKey, response.data, 3600000)
    return response.data
  },
}
