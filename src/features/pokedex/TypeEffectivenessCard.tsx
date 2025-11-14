import { useState } from 'react'
import {
  pokemonTypes,
  analizarTipo,
  calcularDefensaCombinada,
  sortByRelevance,
  getMultiplierColor,
  getMultiplierBg
} from '@/features/types/services/typeEffectivenessService'

interface TypeEffectivenessCardProps {
  types: string[]
}

// Mapeo de nombres de tipos en inglés a español
const typeNameMap: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  grass: 'Planta',
  electric: 'Eléctrico',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
}

export default function TypeEffectivenessCard({ types }: TypeEffectivenessCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Convertir los tipos en inglés a español
  const spanishTypes = types
    .map(type => typeNameMap[type.toLowerCase()])
    .filter(Boolean)

  if (spanishTypes.length === 0) {
    return null
  }

  // Obtener datos de tipos del servicio
  const typeData1 = pokemonTypes.find(t => t.name === spanishTypes[0])
  const typeData2 = spanishTypes.length > 1 ? pokemonTypes.find(t => t.name === spanishTypes[1]) : null

  // Calcular efectividad
  const effectiveness1 = analizarTipo(spanishTypes[0])
  const effectiveness2 = spanishTypes.length > 1 ? analizarTipo(spanishTypes[1]) : null
  const combinedDefense = spanishTypes.length > 1 
    ? calcularDefensaCombinada(spanishTypes[0], spanishTypes[1])
    : null

  return (
    <div className="pokedex-panel overflow-hidden">
      <div 
        className="pokedex-panel-header cursor-pointer hover:bg-neutral-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <h3 className="panel-title flex items-center gap-2">
            ⚔️ TYPE EFFECTIVENESS
          </h3>
          <div className="flex items-center gap-2">
            {/* Mostrar tipos */}
            {typeData1 && (
              <div className={`${typeData1.color} text-white px-2 py-1 rounded text-xs flex items-center gap-1 text-terminal`}>
                <span>{typeData1.emoji}</span>
                <span>{typeData1.name}</span>
              </div>
            )}
            {typeData2 && (
              <div className={`${typeData2.color} text-white px-2 py-1 rounded text-xs flex items-center gap-1 text-terminal`}>
                <span>{typeData2.emoji}</span>
                <span>{typeData2.name}</span>
              </div>
            )}
            <svg 
              className={`w-6 h-6 transition-transform duration-200 text-neon ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna: Al Atacar */}
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-pokedex-red to-red-600 text-white py-2 px-3 rounded-lg">
                <h3 className="text-sm font-bold font-display tracking-wider">⚔️ ATTACKING</h3>
              </div>
              
              {spanishTypes.length > 1 ? (
                // Vista dividida para tipo dual
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="stat-label text-center">
                      {spanishTypes[0]}
                    </p>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {sortByRelevance(effectiveness1?.atacando || []).map((item) => {
                        const typeData = pokemonTypes.find(t => t.name === item.tipo)
                        return (
                          <div 
                            key={item.tipo} 
                            className={`flex items-center justify-between px-1 py-1 rounded text-xs ${getMultiplierBg(item.multiplicador)}`}
                          >
                            <span>{typeData?.emoji}</span>
                            <span className={`font-bold ${getMultiplierColor(item.multiplicador)}`}>
                              ×{item.multiplicador}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="stat-label text-center">
                      {spanishTypes[1]}
                    </p>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {sortByRelevance(effectiveness2?.atacando || []).map((item) => {
                        const typeData = pokemonTypes.find(t => t.name === item.tipo)
                        return (
                          <div 
                            key={item.tipo} 
                            className={`flex items-center justify-between px-1 py-1 rounded text-xs ${getMultiplierBg(item.multiplicador)}`}
                          >
                            <span>{typeData?.emoji}</span>
                            <span className={`font-bold ${getMultiplierColor(item.multiplicador)}`}>
                              ×{item.multiplicador}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                // Vista normal para un solo tipo
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {sortByRelevance(effectiveness1?.atacando || []).map((item) => {
                    const typeData = pokemonTypes.find(t => t.name === item.tipo)
                    return (
                      <div 
                        key={item.tipo} 
                        className={`flex items-center justify-between px-2 py-1 rounded ${getMultiplierBg(item.multiplicador)}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{typeData?.emoji}</span>
                          <span className={`text-xs font-medium ${getMultiplierColor(item.multiplicador)}`}>
                            {item.tipo}
                          </span>
                        </div>
                        <span className={`text-xs font-bold ${getMultiplierColor(item.multiplicador)}`}>
                          ×{item.multiplicador}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Columna: Al Defender */}
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-pokedex-neon to-cyan-600 text-white py-2 px-3 rounded-lg">
                <h3 className="text-sm font-bold font-display tracking-wider">🛡️ DEFENDING</h3>
              </div>
              
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {sortByRelevance(combinedDefense || effectiveness1?.defendiendo || []).map((item) => {
                  const typeData = pokemonTypes.find(t => t.name === item.tipo)
                  return (
                    <div 
                      key={item.tipo} 
                      className={`flex items-center justify-between px-2 py-1 rounded ${getMultiplierBg(item.multiplicador)}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{typeData?.emoji}</span>
                        <span className={`text-xs font-medium ${getMultiplierColor(item.multiplicador)}`}>
                          {item.tipo}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${getMultiplierColor(item.multiplicador)}`}>
                        ×{item.multiplicador}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-4 pt-4 border-t border-terminal">
            <p className="text-terminal text-xs text-neutral-500 text-center">
              <span className="text-green-400 font-bold">Verde</span> = Súper efectivo • 
              <span className="text-red-400 font-bold"> Rojo</span> = Poco efectivo • 
              <span className="text-gray-500 font-bold"> Gris</span> = No afecta
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
