import {
  pokemonTypes,
  sortByRelevance,
  getMultiplierColor,
  getMultiplierBg,
  type TypeEffectiveness
} from '../services/typeEffectivenessService'

interface EffectivenessColumnsProps {
  effectiveness: TypeEffectiveness | null
  effectiveness2: TypeEffectiveness | null
  combinedDefense: { tipo: string; multiplicador: number }[] | null
  selectedType: { name: string } | null
  selectedType2: { name: string } | null
}

export default function EffectivenessColumns({
  effectiveness,
  effectiveness2,
  combinedDefense,
  selectedType,
  selectedType2
}: EffectivenessColumnsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Columna: Al Atacar */}
      <div className="pokedex-panel h-[calc(100vh-240px)] flex flex-col">
        <div className="bg-gradient-to-r from-pokedex-red to-red-600 text-white py-2 px-3 border-b border-white/20">
          <h3 className="text-sm font-display tracking-wider uppercase">⚔️ Al Atacar</h3>
        </div>
        <div className="p-2 flex-1 overflow-y-auto">
          {selectedType2 ? (
            // Vista dividida para tipo dual
            <div className="grid grid-cols-2 gap-1">
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 mb-1 text-center font-mono uppercase">
                  {selectedType?.name}
                </p>
                {sortByRelevance(effectiveness?.atacando || []).map((item) => {
                  const typeData = pokemonTypes.find(t => t.name === item.tipo)
                  return (
                    <div 
                      key={item.tipo} 
                      className={`flex items-center justify-between px-1 py-1 rounded ${getMultiplierBg(item.multiplicador)}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{typeData?.emoji}</span>
                      </div>
                      <span className={`text-xs font-bold font-mono ${getMultiplierColor(item.multiplicador)}`}>
                        ×{item.multiplicador}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 mb-1 text-center font-mono uppercase">
                  {selectedType2?.name}
                </p>
                {sortByRelevance(effectiveness2?.atacando || []).map((item) => {
                  const typeData = pokemonTypes.find(t => t.name === item.tipo)
                  return (
                    <div 
                      key={item.tipo} 
                      className={`flex items-center justify-between px-1 py-1 rounded ${getMultiplierBg(item.multiplicador)}`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{typeData?.emoji}</span>
                      </div>
                      <span className={`text-xs font-bold font-mono ${getMultiplierColor(item.multiplicador)}`}>
                        ×{item.multiplicador}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // Vista normal para un solo tipo
            <div className="space-y-1">
              {sortByRelevance(effectiveness?.atacando || []).map((item) => {
                const typeData = pokemonTypes.find(t => t.name === item.tipo)
                return (
                  <div 
                    key={item.tipo} 
                    className={`flex items-center justify-between px-2 py-1 rounded ${getMultiplierBg(item.multiplicador)}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{typeData?.emoji}</span>
                      <span className={`text-xs font-medium font-mono ${getMultiplierColor(item.multiplicador)}`}>
                        {item.tipo}
                      </span>
                    </div>
                    <span className={`text-xs font-bold font-mono ${getMultiplierColor(item.multiplicador)}`}>
                      ×{item.multiplicador}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Columna: Al Defender */}
      <div className="pokedex-panel h-[calc(100vh-240px)] flex flex-col">
        <div className="bg-gradient-to-r from-pokedex-neon to-cyan-600 text-white py-2 px-3 border-b border-white/20">
          <h3 className="text-sm font-display tracking-wider uppercase">🛡️ Al Defender</h3>
        </div>
        <div className="p-2 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {sortByRelevance(selectedType2 ? combinedDefense || [] : effectiveness?.defendiendo || []).map((item) => {
              const typeData = pokemonTypes.find(t => t.name === item.tipo)
              return (
                <div 
                  key={item.tipo} 
                  className={`flex items-center justify-between px-2 py-1 rounded ${getMultiplierBg(item.multiplicador)}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{typeData?.emoji}</span>
                    <span className={`text-xs font-medium font-mono ${getMultiplierColor(item.multiplicador)}`}>
                      {item.tipo}
                    </span>
                  </div>
                  <span className={`text-xs font-bold font-mono ${getMultiplierColor(item.multiplicador)}`}>
                    ×{item.multiplicador}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
