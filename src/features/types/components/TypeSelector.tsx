import { Card, CardContent } from '@/shared/components/ui/card'
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
      <Card className={`${selectedType.color} text-white shadow-lg`}>
        <CardContent className="p-3 flex items-center justify-center space-x-2">
          <span className="text-3xl">{selectedType.emoji}</span>
          <span className="text-base font-bold">{selectedType.name}</span>
        </CardContent>
      </Card>

      {/* Segundo tipo o botón para agregar */}
      {selectedType2 ? (
        <Card className={`${selectedType2.color} text-white shadow-lg relative`}>
          <button
            onClick={onRemoveType2}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 z-10"
          >
            ✕
          </button>
          <CardContent className="p-3 flex items-center justify-center space-x-2">
            <span className="text-3xl">{selectedType2.emoji}</span>
            <span className="text-base font-bold">{selectedType2.name}</span>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className="border-2 border-dashed border-[color:var(--card-border)] bg-[color:var(--surface)]/50 hover:bg-[color:var(--surface)] transition-colors cursor-pointer"
          onClick={onAddType2}
        >
          <CardContent className="p-3 flex items-center justify-center space-x-2 text-[color:var(--muted)]">
            <span className="text-3xl">➕</span>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
