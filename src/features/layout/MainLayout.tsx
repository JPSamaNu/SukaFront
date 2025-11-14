import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { useTheme } from '@/shared/theme/useTheme'
import { LedDot } from '@/shared/components/neodex'
import { useState } from 'react'

interface MenuItem {
  label: string
  path: string
  icon: string
}

const menuItems: MenuItem[] = [
  { label: 'Pokédex', path: '/pokemon', icon: '⭐' },
  { label: 'Generación', path: '/generations', icon: '✕' },
  { label: 'Items', path: '/items', icon: '🎒' },
  { label: 'Moves', path: '/moves', icon: '⚡' },
  { label: 'Teams', path: '/teams', icon: '👥' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
]

export default function MainLayout() {
  const { logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {/* Pokédex Device Container */}
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-2 md:p-6">
        
        {/* Red Pokédex Frame */}
        <div className="max-w-7xl mx-auto bg-gradient-to-b from-pokedex-red via-red-700 to-red-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-red-950/50">
          
          {/* Top Hardware Section */}
          <div className="relative bg-gradient-to-b from-pokedex-red to-red-700 p-4 md:p-6 border-b-4 border-red-950/50">
            <div className="flex items-center justify-between">
              {/* LED Indicators */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-4 border-red-900/50 shadow-inner-led">
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-300 to-red-500 animate-led"></div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <LedDot className="w-2 h-2 bg-amber-400" />
                  <LedDot className="w-2 h-2 bg-green-400" />
                </div>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden px-3 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors border border-red-950/50"
              >
                {sidebarOpen ? '✕' : '☰'}
              </button>

              {/* Desktop Status */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 text-red-100">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs font-mono">Connected</span>
                </div>
                <button 
                  onClick={toggle}
                  className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors text-xs font-semibold border border-red-950/50"
                >
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors text-xs font-semibold border border-red-950/50"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Decorative screws */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-red-950/40"></div>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-950/40"></div>
          </div>

          {/* Main Device Body */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black p-3 md:p-6">
            <div className="grid md:grid-cols-[80px_1fr] gap-3 md:gap-6">
              
              {/* Left Icon Sidebar */}
              <aside className={`
                fixed md:static inset-0 z-50 md:z-0
                transform md:transform-none transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                bg-neutral-950 md:bg-transparent
                p-4 md:p-0
              `}>
                {/* Mobile overlay */}
                {sidebarOpen && (
                  <div 
                    className="fixed inset-0 bg-black/70 md:hidden -z-10"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
                
                <div className="relative z-10 bg-neutral-900/50 backdrop-blur-sm border border-pokedex-neon/20 rounded-2xl p-2 md:p-3 shadow-panel">
                  <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path)
                          setSidebarOpen(false)
                        }}
                        title={item.label}
                        className={`
                          group relative w-full aspect-square rounded-xl transition-all
                          flex flex-col items-center justify-center gap-1
                          ${isActive(item.path)
                            ? 'bg-pokedex-neon/20 text-pokedex-neon ring-2 ring-pokedex-neon/60'
                            : 'bg-neutral-800/40 text-neutral-400 hover:bg-neutral-800/70 hover:text-pokedex-neon/80'
                          }
                        `}
                      >
                        <span className="text-xl md:text-2xl">{item.icon}</span>
                        <span className="text-[8px] md:hidden font-mono">{item.label}</span>
                        {isActive(item.path) && (
                          <div className="absolute -right-1 -top-1 w-2 h-2 bg-pokedex-neon rounded-full animate-pulse"></div>
                        )}
                        {/* Tooltip for desktop */}
                        <span className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-pokedex-neon text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </nav>

                  {/* Mobile controls */}
                  <div className="mt-4 pt-4 border-t border-neutral-800 flex flex-col gap-2 md:hidden">
                    <button 
                      onClick={toggle}
                      className="px-3 py-2 rounded-lg bg-neutral-800/60 hover:bg-neutral-800/80 transition-colors text-sm"
                    >
                      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors text-sm"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Screen Area */}
              <main className="relative">
                {/* Screen Bezel */}
                <div className="bg-neutral-950 rounded-2xl border-4 border-neutral-800/50 shadow-bezel overflow-hidden">
                  {/* Screen Header */}
                  <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-4 py-3 border-b border-pokedex-neon/20 flex items-center justify-between">
                    <button 
                      onClick={() => navigate('/')}
                      className="focus:outline-none focus:ring-2 focus:ring-pokedex-neon/40 rounded-lg"
                    >
                      <h1 className="font-display tracking-[0.3em] text-pokedex-neon text-sm md:text-base">
                        SUKADEX
                      </h1>
                    </button>
                    <div className="h-1 flex-1 mx-4 bg-gradient-to-r from-pokedex-neon/0 via-pokedex-neon/40 to-pokedex-neon/0"></div>
                    <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                      <span>⚡</span>
                      <span className="hidden md:inline">READY</span>
                    </div>
                  </div>

                  {/* Screen Content with Glass Effect */}
                  <div className="relative bg-neutral-950/95 min-h-[500px]">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 scanline"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-4 md:p-6">
                      <Outlet />
                    </div>
                  </div>
                </div>

                {/* Decorative bottom screws */}
                <div className="absolute -bottom-2 left-4 w-2 h-2 rounded-full bg-neutral-800/60"></div>
                <div className="absolute -bottom-2 right-4 w-2 h-2 rounded-full bg-neutral-800/60"></div>
              </main>
            </div>
          </div>

          {/* Bottom Hardware Section */}
          <div className="bg-gradient-to-b from-red-900 to-red-950 p-3 border-t-4 border-red-950/50">
            <div className="flex items-center justify-center gap-2">
              <div className="w-16 h-1 rounded-full bg-red-950/50"></div>
              <div className="w-1 h-1 rounded-full bg-red-950/50"></div>
              <div className="w-1 h-1 rounded-full bg-red-950/50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}