import type { PokemonType } from '../services/typeEffectivenessService'

interface TypeGridProps {
  types: PokemonType[]
  onTypeSelect: (type: PokemonType) => void
  disabledType?: string | null
}

export default function TypeGrid({ types, onTypeSelect, disabledType }: TypeGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 h-[calc(100vh-180px)]">
      {types.map((type) => (
        <button
          key={type.name}
          onClick={() => onTypeSelect(type)}
          disabled={type.name === disabledType}
          className={`${type.color} ${
            type.name === disabledType
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:scale-105 hover:shadow-lg active:scale-95'
          } text-white rounded-lg p-3 md:p-4 flex flex-col items-center justify-center space-y-1 transition-all duration-200`}
        >
          <span className="text-3xl md:text-4xl">{type.emoji}</span>
          <span className="text-xs md:text-sm font-bold">{type.name}</span>
        </button>
      ))}
    </div>
  )
}
