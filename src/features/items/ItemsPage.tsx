import { useState, useEffect, useRef, startTransition, useCallback } from 'react'
import { itemsApi, type Item } from '@/shared/api/items.api'

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  
  // Refs para infinite scroll optimizado
  const currentPageRef = useRef(1)
  const isLoadingRef = useRef(false)

  // Cargar categorías al iniciar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await itemsApi.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    
    loadCategories()
  }, [])

  // Función para cargar más items (infinite scroll optimizado)
  const loadMoreItems = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return
    
    isLoadingRef.current = true
    setLoadingMore(true)
    
    try {
      const page = currentPageRef.current
      console.log(`📦 Cargando página ${page} de items...`)
      
      const response = await itemsApi.getAll({
        page,
        limit: 50,
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      })
      
      if (response.data.length > 0) {
        startTransition(() => {
          setItems(prev => {
            const existingIds = new Set(prev.map(i => i.id))
            const uniqueNew = response.data.filter(i => !existingIds.has(i.id))
            return [...prev, ...uniqueNew]
          })
        })
        
        setTotal(response.pagination.total)
        currentPageRef.current += 1
        
        if (page >= response.pagination.totalPages) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more items:', error)
    } finally {
      isLoadingRef.current = false
      setLoadingMore(false)
    }
  }, [hasMore, searchTerm, selectedCategory])

  // Resetear y cargar inicial cuando cambian los filtros
  useEffect(() => {
    const resetAndLoad = async () => {
      setLoading(true)
      setItems([])
      currentPageRef.current = 1
      setHasMore(true)
      isLoadingRef.current = false
      
      await loadMoreItems()
      setLoading(false)
    }
    
    resetAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory])

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingRef.current || !hasMore) return
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadMoreItems()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadMoreItems])

  const capitalizeName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatPrice = (cost: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cost)
  }

  if (loading && items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-12 w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-48"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="header-gradient-purple">
        <div className="p-6">
          <h1 className="page-title">
            🎒 ITEMS DATABASE
          </h1>
          <p className="page-subtitle text-purple-100">
            Explora todos los objetos disponibles en el mundo Pokémon
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="pokedex-panel">
        <div className="pokedex-panel-header">
          <h3 className="panel-title">FILTERS</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="stat-label mb-2 block">
                Buscar item
              </label>
              <input
                type="text"
                placeholder="Ej: Potion, Master Ball"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-terminal"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="stat-label mb-2 block">
                Categoría
              </label>
              <select
                className="select-terminal"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {capitalizeName(category.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-terminal text-sm text-neutral-500">
          Mostrando {items.length} de {total} items
        </p>
        {loadingMore && (
          <div className="loading-text">
            <div className="loading-spinner h-4 w-4"></div>
            <span>Cargando más...</span>
          </div>
        )}
      </div>

      {/* Lista de items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="data-list-item cursor-pointer">
            <div className="pb-3 p-4 border-b border-terminal">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-display text-base leading-tight text-neutral-200">
                    {capitalizeName(item.name)}
                  </h3>
                  <p className="text-terminal text-xs text-neutral-500 mt-1">
                    {capitalizeName(item.category)}
                  </p>
                </div>
                {item.sprite && (
                  <img 
                    src={item.sprite} 
                    alt={item.name}
                    className="w-12 h-12 object-contain"
                  />
                )}
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Precio */}
              <div className="flex items-center justify-between">
                <span className="stat-label">Precio:</span>
                <span className="stat-value text-lg">
                  {item.cost === 0 ? 'N/A' : formatPrice(item.cost)}
                </span>
              </div>

              {/* Efecto */}
              <div>
                <p className="text-terminal text-xs text-neutral-400 line-clamp-3">
                  {item.effect || 'Sin descripción'}
                </p>
              </div>

              {/* Fling info (si existe) */}
              {item.flingPower && (
                <div className="pt-2 border-t border-neutral-800">
                  <p className="text-xs text-neutral-500 font-mono">
                    Fling Power: <span className="font-semibold text-pokedex-neon">{item.flingPower}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sin resultados */}
      {items.length === 0 && !loading && (
        <div className="pokedex-panel">
          <div className="py-12 text-center">
            <p className="text-neutral-500 font-mono">
              No se encontraron items con los filtros seleccionados
            </p>
          </div>
        </div>
      )}

      {/* Indicador de fin de lista */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500 font-mono">
            ✅ Has visto todos los items ({total} en total)
          </p>
        </div>
      )}

      {/* Loading más items */}
      {loadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-neutral-800/50 animate-pulse rounded"></div>
          ))}
        </div>
      )}
    </div>
  )
}
