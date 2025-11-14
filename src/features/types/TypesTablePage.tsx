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
      <div className="pokedex-panel">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-200 font-display tracking-wider uppercase">
              TYPE CHART
            </h1>
            <p className="text-sm text-neutral-500 mt-1 font-mono">
              {selectedType ? 'Efectividad de tipos' : 'Selecciona un tipo'}
            </p>
          </div>
          <button 
            onClick={handleBack}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-200 border border-neutral-700 hover:border-pokedex-neon font-mono text-sm"
          >
            {selectedType ? '← Tipos' : '← Menú'}
          </button>
        </div>
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
          <div className="pokedex-panel text-center p-4">
            <p className="text-sm text-neutral-400 font-mono">
              Selecciona un segundo tipo para combinar con{' '}
              <span className="font-bold text-pokedex-neon">{selectedType.name}</span>
            </p>
            <button 
              className="mt-3 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-200 border border-neutral-700 hover:border-pokedex-neon font-mono text-sm"
              onClick={() => setShowTypeSelector(false)}
            >
              Cancelar
            </button>
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
