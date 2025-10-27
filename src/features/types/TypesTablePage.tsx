import { Button } from '@/shared/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import TypeGrid from './components/TypeGrid'
import TypeSelector from './components/TypeSelector'
import EffectivenessColumns from './components/EffectivenessColumns'
import {
  pokemonTypes,
  analizarTipo,
  calcularDefensaCombinada,
  type PokemonType
} from './services/typeEffectivenessService'

export default function TypesTablePage() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null)
  const [selectedType2, setSelectedType2] = useState<PokemonType | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  const effectiveness = selectedType ? analizarTipo(selectedType.name) : null
  const effectiveness2 = selectedType2 ? analizarTipo(selectedType2.name) : null
  const combinedDefense = selectedType && selectedType2 
    ? calcularDefensaCombinada(selectedType.name, selectedType2.name)
    : null

  const handleTypeSelect = (type: PokemonType) => {
    setSelectedType(type)
  }

  const handleType2Select = (type: PokemonType) => {
    setSelectedType2(type)
    setShowTypeSelector(false)
  }

  const handleRemoveType2 = () => {
    setSelectedType2(null)
  }

  const handleAddType2 = () => {
    setShowTypeSelector(true)
  }

  const handleBack = () => {
    if (selectedType) {
      setSelectedType(null)
      setSelectedType2(null)
      setShowTypeSelector(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="space-y-4 px-2">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--text)]">
            Tabla de Tipos
          </h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            {selectedType ? 'Efectividad de tipos' : 'Selecciona un tipo'}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleBack}
        >
          {selectedType ? '← Tipos' : '← Menú'}
        </Button>
      </div>

      {/* Matriz de tipos o vista de efectividad */}
      {!selectedType ? (
        <TypeGrid 
          types={pokemonTypes} 
          onTypeSelect={handleTypeSelect}
        />
      ) : showTypeSelector ? (
        // Selector de segundo tipo
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-[color:var(--muted)]">
              Selecciona un segundo tipo para combinar con{' '}
              <span className="font-bold">{selectedType.name}</span>
            </p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={() => setShowTypeSelector(false)}
            >
              Cancelar
            </Button>
          </div>
          <TypeGrid 
            types={pokemonTypes} 
            onTypeSelect={handleType2Select}
            disabledType={selectedType.name}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <TypeSelector
            selectedType={selectedType}
            selectedType2={selectedType2}
            onRemoveType2={handleRemoveType2}
            onAddType2={handleAddType2}
          />

          <EffectivenessColumns
            effectiveness={effectiveness}
            effectiveness2={effectiveness2}
            combinedDefense={combinedDefense}
            selectedType={selectedType}
            selectedType2={selectedType2}
          />
        </div>
      )}
    </div>
  )
}
