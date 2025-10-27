import { useNavigate } from 'react-router-dom'
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/card'

export default function DashboardPage() {
  const navigate = useNavigate()

  const menuOptions = [
    {
      id: 'generations',
      title: 'Generaciones',
      description: 'Explora Pokémon organizados por generaciones',
      icon: '🔴',
      route: '/generations',
      color: 'from-[color:var(--primary)] to-[color:var(--primary-600)]'
    },
    {
      id: 'pokedex',
      title: 'Pokédex Completa',
      description: 'Navega por todos los Pokémon disponibles',
      icon: '📕',
      route: '/all-pokemon',
      color: 'from-[color:var(--brand)] to-[color:var(--brand-600)]'
    },
    {
      id: 'types',
      title: 'Tabla de Tipos',
      description: 'Consulta las fortalezas y debilidades de cada tipo',
      icon: '⚡',
      route: '/types',
      color: 'from-[color:var(--accent)] to-[color:var(--accent-700)]'
    }
  ]

  return (
    <div className="space-y-6 px-2">
      {/* Encabezado de bienvenida - más compacto */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--text)]">
          Bienvenido a SukaDex
        </h1>
        <p className="text-sm md:text-base text-[color:var(--muted)]">
          Selecciona una opción para comenzar
        </p>
      </div>

      {/* Lista de opciones del menú - diseño vertical */}
      <div className="flex flex-col gap-3 max-w-2xl mx-auto">
        {menuOptions.map((option) => (
          <Card
            key={option.id}
            className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
            onClick={() => navigate(option.route)}
          >
            <div className={`bg-gradient-to-r ${option.color} rounded-xl p-4 flex items-center space-x-4`}>
              <div className="text-4xl group-hover:scale-110 transition-transform flex-shrink-0">
                {option.icon}
              </div>
              <div className="flex-1 text-white">
                <CardTitle className="text-lg md:text-xl font-bold text-white mb-1">
                  {option.title}
                </CardTitle>
                <CardDescription className="text-sm text-white/90">
                  {option.description}
                </CardDescription>
              </div>
              <div className="text-white text-2xl group-hover:translate-x-1 transition-transform flex-shrink-0">
                →
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Información adicional - más compacta */}
      <div className="text-center mt-6">
        <div className="inline-block bg-[color:var(--surface)] border border-[color:var(--card-border)] rounded-lg px-4 py-2 shadow-sm">
          <p className="text-xs text-[color:var(--muted)]">
            💡 <span className="font-semibold">Tip:</span> Usa el toggle superior para cambiar el tema
          </p>
        </div>
      </div>
    </div>
  )
}
