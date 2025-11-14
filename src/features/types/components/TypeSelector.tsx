import type { PokemonType } from '../services/typeEffectivenessService'

interface TypeSelectorProps {
  selectedType: PokemonType
  selectedType2: PokemonType | null
  onRemoveType2: () => void
  onAddType2: () => void
}

export default function TypeSelector({
  selectedType,
  selectedType2,
  onRemoveType2,
  onAddType2
}: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Tipo seleccionado */}
      <div className={`${selectedType.color} text-white shadow-lg rounded-lg overflow-hidden border-2 border-white/20`}>
        <div className="p-3 flex items-center justify-center space-x-2">
          <span className="text-3xl">{selectedType.emoji}</span>
          <span className="text-base font-bold font-display tracking-wider uppercase">{selectedType.name}</span>
        </div>
      </div>

      {/* Segundo tipo o botón para agregar */}
      {selectedType2 ? (
        <div className={`${selectedType2.color} text-white shadow-lg relative rounded-lg overflow-hidden border-2 border-white/20`}>
          <button
            onClick={onRemoveType2}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 z-10 shadow-lg"
          >
            ✕
          </button>
          <div className="p-3 flex items-center justify-center space-x-2">
            <span className="text-3xl">{selectedType2.emoji}</span>
            <span className="text-base font-bold font-display tracking-wider uppercase">{selectedType2.name}</span>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 transition-colors cursor-pointer rounded-lg"
          onClick={onAddType2}
        >
          <div className="p-3 flex items-center justify-center space-x-2 text-neutral-500 hover:text-pokedex-neon transition-colors">
            <span className="text-3xl">➕</span>
          </div>
        </div>
      )}
    </div>
  )
}
