/**
 * Sistema de caché usando localStorage
 * Almacena datos con tiempo de expiración
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresIn: number // en milisegundos
}

class CacheManager {
  private prefix = 'sukadex_cache_'

  /**
   * Guardar datos en caché
   * @param key - Clave única para identificar los datos
   * @param data - Datos a guardar
   * @param expiresIn - Tiempo de expiración en milisegundos (default: 1 hora)
   */
  set<T>(key: string, data: T, expiresIn: number = 60 * 60 * 1000): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      }
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem))
    } catch (error) {
      console.error('Error guardando en caché:', error)
      // Si el localStorage está lleno, limpiar caché antiguo
      this.clearExpired()
    }
  }

  /**
   * Obtener datos del caché
   * @param key - Clave de los datos
   * @returns Los datos si existen y no han expirado, null en caso contrario
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return null

      const cacheItem: CacheItem<T> = JSON.parse(item)
      const now = Date.now()

      // Verificar si el caché ha expirado
      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        this.remove(key)
        return null
      }

      return cacheItem.data
    } catch (error) {
      console.error('Error obteniendo del caché:', error)
      return null
    }
  }

  /**
   * Eliminar un elemento del caché
   */
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  /**
   * Limpiar todos los elementos expirados del caché
   */
  clearExpired(): void {
    const now = Date.now()
    const keys = Object.keys(localStorage)

    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const cacheItem: CacheItem<any> = JSON.parse(item)
            if (now - cacheItem.timestamp > cacheItem.expiresIn) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          // Si hay error parseando, eliminar el item
          localStorage.removeItem(key)
        }
      }
    })
  }

  /**
   * Limpiar todo el caché de SukaDex
   */
  clearAll(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }

  /**
   * Obtener el tamaño del caché en KB
   */
  getCacheSize(): number {
    const keys = Object.keys(localStorage)
    let size = 0
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        const item = localStorage.getItem(key)
        if (item) {
          size += item.length
        }
      }
    })
    return Math.round(size / 1024) // Convertir a KB
  }
}

// Exportar instancia singleton
export const cache = new CacheManager()

// Limpiar caché expirado al cargar la aplicación
cache.clearExpired()
