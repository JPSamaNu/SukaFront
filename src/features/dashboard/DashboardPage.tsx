import { useNavigate } from 'react-router-dom'
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/card'

export default function DashboardPage() {
  const navigate = useNavigate()

  const mainMenuOptions = [
    {
      id: 'generations',
      title: 'Generaciones',
      description: 'Explora Pokemon organizados por generaciones',
      icon: '🔴',
      route: '/generations',
      gradient: 'from-red-500 to-red-700',
      bgHover: 'hover:bg-red-50 dark:hover:bg-red-950/20'
    },
    {
      id: 'pokedex',
      title: 'Pokedex Nacional',
      description: 'Lista completa de todos los Pokemon',
      icon: '📖',
      route: '/all-pokemon',
      gradient: 'from-blue-500 to-blue-700',
      bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-950/20'
    },
    {
      id: 'types',
      title: 'Tabla de Tipos',
      description: 'Consulta las fortalezas y debilidades de cada tipo',
      icon: '⚡',
      route: '/types',
      gradient: 'from-yellow-500 to-yellow-700',
      bgHover: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
    }
  ]

  const secondaryMenuOptions = [
    {
      id: 'games',
      title: 'Juegos',
      description: 'Explora los juegos Pokemon y sus Pokedex',
      icon: '🎮',
      route: '/games',
      gradient: 'from-indigo-500 to-indigo-700',
      bgHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
    },
    {
      id: 'moves',
      title: 'Movimientos',
      description: 'Descubre todos los movimientos Pokemon',
      icon: '💥',
      route: '/moves',
      gradient: 'from-purple-500 to-purple-700',
      bgHover: 'hover:bg-purple-50 dark:hover:bg-purple-950/20'
    },
    {
      id: 'items',
      title: 'Items',
      description: 'Explora objetos y herramientas',
      icon: '🎒',
      route: '/items',
      gradient: 'from-green-500 to-green-700',
      bgHover: 'hover:bg-green-50 dark:hover:bg-green-950/20'
    },
    {
      id: 'berries',
      title: 'Berries',
      description: 'Conoce todas las bayas disponibles',
      icon: '🍓',
      route: '/berries',
      gradient: 'from-pink-500 to-pink-700',
      bgHover: 'hover:bg-pink-50 dark:hover:bg-pink-950/20'
    }
  ]

  return (
    <div className="space-y-8 px-2 py-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--text)]">
          Bienvenido a SukaDex 🎮
        </h1>
        <p className="text-base md:text-lg text-[color:var(--muted)]">
          Tu enciclopedia Pokemon completa
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[color:var(--text)] mb-4 px-2">
          🌟 Secciones Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {mainMenuOptions.map((option) => (
            <Card
              key={option.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group overflow-hidden border-2 border-transparent hover:border-[color:var(--border)]"
              onClick={() => navigate(option.route)}
            >
              <div className={'bg-gradient-to-br ' + option.gradient + ' rounded-xl p-6 min-h-[180px] flex flex-col justify-between'}>
                <div className="flex items-start justify-between">
                  <div className="text-5xl group-hover:scale-125 transition-transform duration-300">
                    {option.icon}
                  </div>
                  <div className="text-white/70 text-3xl group-hover:rotate-45 transition-transform duration-300">
                    ✨
                  </div>
                </div>
                <div className="text-white space-y-2">
                  <CardTitle className="text-2xl font-bold text-white">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-white/90 leading-relaxed">
                    {option.description}
                  </CardDescription>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[color:var(--text)] mb-4 px-2">
          📚 Recursos Adicionales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {secondaryMenuOptions.map((option) => (
            <Card
              key={option.id}
              className={'cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group border border-[color:var(--border)] ' + option.bgHover}
              onClick={() => navigate(option.route)}
            >
              <div className="p-5 flex items-center space-x-4">
                <div className={'bg-gradient-to-br ' + option.gradient + ' rounded-xl p-3 text-3xl group-hover:scale-110 transition-transform shadow-lg'}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-[color:var(--text)] mb-1">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[color:var(--muted)]">
                    {option.description}
                  </CardDescription>
                </div>
                <div className="text-[color:var(--muted)] text-xl group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <div className="inline-block bg-[color:var(--surface)] border border-[color:var(--card-border)] rounded-lg px-6 py-3 shadow-sm">
          <p className="text-sm text-[color:var(--muted)]">
            💡 <span className="font-semibold">Tip:</span> Usa el toggle de tema en la esquina superior para cambiar entre modo claro y oscuro
          </p>
        </div>
      </div>
    </div>
  )
}
