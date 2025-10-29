import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { movesApi, type Move } from '@/shared/api/moves.api'

export default function MovesPage() {
  const [moves, setMoves] = useState<Move[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDamageClass, setSelectedDamageClass] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [types, setTypes] = useState<Array<{ id: number; name: string }>>([])
  const [damageClasses, setDamageClasses] = useState<Array<{ id: number; name: string }>>([])

  // Cargar tipos y clases de daño al iniciar
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [typesData, classesData] = await Promise.all([
          movesApi.getTypes(),
          movesApi.getDamageClasses(),
        ])
        setTypes(typesData)
        setDamageClasses(classesData)
      } catch (error) {
        console.error('Error loading filters:', error)
      }
    }
    
    loadFilters()
  }, [])

  // Cargar movimientos
  useEffect(() => {
    const fetchMoves = async () => {
      try {
        setLoading(true)
        const response = await movesApi.getAll({
          page,
          limit: 20,
          search: searchTerm || undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
          damageClass: selectedDamageClass !== 'all' ? selectedDamageClass : undefined,
        })
        
        setMoves(response.data)
        setTotalPages(response.pagination.totalPages)
        setTotal(response.pagination.total)
      } catch (error) {
        console.error('Error fetching moves:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMoves()
  }, [page, searchTerm, selectedType, selectedDamageClass])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      grass: 'bg-green-500',
      electric: 'bg-yellow-500',
      psychic: 'bg-pink-500',
      ice: 'bg-blue-200',
      dragon: 'bg-purple-600',
      dark: 'bg-gray-800',
      fairy: 'bg-pink-300',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      bug: 'bg-green-400',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      steel: 'bg-gray-500',
      normal: 'bg-gray-400',
    }
    return colors[type] || 'bg-gray-400'
  }

  const getDamageClassIcon = (damageClass: string) => {
    switch (damageClass) {
      case 'physical':
        return '⚔️'
      case 'special':
        return '✨'
      case 'status':
        return '🎯'
      default:
        return '❓'
    }
  }

  const capitalizeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-[color:var(--text)]">
          Movimientos Pokémon
        </h1>
        <p className="text-[color:var(--muted)]">
          Explora todos los movimientos disponibles en el mundo Pokémon
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="text-sm font-medium text-[color:var(--text)] mb-2 block">
                Buscar movimiento
              </label>
              <Input
                type="text"
                placeholder="Ej: Flamethrower"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="text-sm font-medium text-[color:var(--text)] mb-2 block">
                Tipo
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--surface)] text-[color:var(--text)]"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {types.map(type => (
                  <option key={type.id} value={type.name}>
                    {capitalizeName(type.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Clase de daño */}
            <div>
              <label className="text-sm font-medium text-[color:var(--text)] mb-2 block">
                Categoría
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-[color:var(--card-border)] bg-[color:var(--surface)] text-[color:var(--text)]"
                value={selectedDamageClass}
                onChange={(e) => setSelectedDamageClass(e.target.value)}
              >
                <option value="all">Todas</option>
                {damageClasses.map(dc => (
                  <option key={dc.id} value={dc.name}>
                    {getDamageClassIcon(dc.name)} {capitalizeName(dc.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">
          Mostrando {moves.length} de {total} movimientos
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Anterior
          </Button>
          <span className="px-4 py-2 text-sm text-[color:var(--text)]">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Lista de movimientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moves.map((move) => (
          <Card key={move.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {capitalizeName(move.name)}
                </CardTitle>
                <span className="text-2xl">{getDamageClassIcon(move.damageClass)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getTypeColor(move.type)}`}>
                  {capitalizeName(move.type)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[color:var(--muted)]">Poder</p>
                  <p className="font-semibold text-[color:var(--text)]">
                    {move.power || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[color:var(--muted)]">Precisión</p>
                  <p className="font-semibold text-[color:var(--text)]">
                    {move.accuracy ? `${move.accuracy}%` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[color:var(--muted)]">PP</p>
                  <p className="font-semibold text-[color:var(--text)]">{move.pp}</p>
                </div>
                <div>
                  <p className="text-[color:var(--muted)]">Prioridad</p>
                  <p className="font-semibold text-[color:var(--text)]">
                    {move.priority > 0 ? `+${move.priority}` : move.priority}
                  </p>
                </div>
              </div>

              {/* Efecto */}
              <div>
                <p className="text-xs text-[color:var(--muted)] line-clamp-2">
                  {move.effect}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sin resultados */}
      {moves.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[color:var(--muted)]">
              No se encontraron movimientos con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
