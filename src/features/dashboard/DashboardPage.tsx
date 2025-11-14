import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  const mainMenuOptions = [
    {
      id: 'generations',
      title: 'GENERATIONS',
      description: 'Explore Pokémon by generation',
      icon: '🌍',
      route: '/generations',
      color: 'pokedex-red',
    },
    {
      id: 'pokedex',
      title: 'NATIONAL DEX',
      description: 'Complete Pokémon database',
      icon: '📖',
      route: '/pokemon',
      color: 'pokedex-neon',
    },
    {
      id: 'types',
      title: 'TYPE CHART',
      description: 'Type effectiveness matrix',
      icon: '⚡',
      route: '/types',
      color: 'pokedex-amber',
    }
  ]

  const secondaryMenuOptions = [
    {
      id: 'teams',
      title: 'MY TEAMS',
      description: 'Build battle teams',
      icon: '⚔️',
      route: '/teams',
    },
    {
      id: 'games',
      title: 'GAMES',
      description: 'Game versions & Pokédex',
      icon: '🎮',
      route: '/games',
    },
    {
      id: 'moves',
      title: 'MOVES',
      description: 'Attack database',
      icon: '💥',
      route: '/moves',
    },
    {
      id: 'items',
      title: 'ITEMS',
      description: 'Tools & equipment',
      icon: '🎒',
      route: '/items',
    },
    {
      id: 'berries',
      title: 'BERRIES',
      description: 'Berry collection',
      icon: '🍓',
      route: '/berries',
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="pokedex-panel p-6 text-center">
        <h1 className="font-display text-3xl md:text-4xl tracking-wider text-pokedex-neon mb-3">
          WELCOME TO SUKADEX
        </h1>
        <p className="text-neutral-400 font-mono text-sm">
          YOUR COMPLETE POKÉMON ENCYCLOPEDIA
        </p>
      </div>

      {/* Main Sections */}
      <div>
        <h2 className="font-display text-lg tracking-wider text-neutral-500 mb-4 px-2 uppercase">
          🌟 Main Sections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mainMenuOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => navigate(option.route)}
              className="group pokedex-panel p-6 hover:ring-2 hover:ring-pokedex-neon/60 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl group-hover:scale-125 transition-transform duration-300">
                  {option.icon}
                </div>
                <div className={`w-3 h-3 rounded-full bg-${option.color} animate-pulse`}></div>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl tracking-wider text-neutral-200">
                  {option.title}
                </h3>
                <p className="text-sm text-neutral-500 font-mono">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Sections */}
      <div>
        <h2 className="font-display text-lg tracking-wider text-neutral-500 mb-4 px-2 uppercase">
          📚 Additional Resources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {secondaryMenuOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => navigate(option.route)}
              className="group pokedex-panel p-4 hover:bg-neutral-900/80 transition-all text-left flex items-center gap-4"
            >
              <div className="text-3xl bg-neutral-900/50 p-3 rounded-lg group-hover:scale-110 transition-transform">
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-sm tracking-wider text-neutral-200 mb-1">
                  {option.title}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  {option.description}
                </p>
              </div>
              <div className="text-pokedex-neon/50 group-hover:text-pokedex-neon group-hover:translate-x-1 transition-all">
                →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <div className="pokedex-panel p-4 text-center">
        <p className="text-xs text-neutral-500 font-mono">
          💡 <span className="text-pokedex-neon">TIP:</span> Use theme toggle in header to switch light/dark mode
        </p>
      </div>
    </div>
  )
}
