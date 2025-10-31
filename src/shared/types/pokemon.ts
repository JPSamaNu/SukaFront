// Tipos básicos para Pokemon
export interface Pokemon {
  id: number
  name: string
  sprites: {
    front_default: string | null
    front_shiny?: string | null
    back_default?: string | null
    back_shiny?: string | null
    back_female?: string | null
    front_female?: string | null
    other?: {
      'official-artwork'?: {
        front_default: string | null
      }
      dream_world?: {
        front_default: string | null
      }
      home?: {
        front_default: string | null
      }
    }
    versions?: any
  }
  // SOPORTE PARA AMBOS FORMATOS (temporal hasta aplicar estandarización)
  types: Array<string | { name: string; slot: number }>
  stats: Array<{
    name: string
    base_stat?: number  // formato snake_case (estandarizado)
    baseStat?: number   // formato camelCase (legacy)
    effort: number
  }>
  abilities: Array<string | { name: string; slot: number; is_hidden: boolean }>
  height: number
  weight: number
  baseExperience: number
  speciesId: number
  speciesName: string
  generationId: number
  generationName: string
  moves?: Array<{
    level: number
    name: string
    type: string
    power: number | null
    accuracy: number | null
    pp: number
    damageClass: string
  }>
  classification?: {
    isLegendary: boolean
    isMythical: boolean
    isBaby: boolean
    captureRate: number
    baseHappiness: number
    hatchCounter: number
    genderRate: number
    growthRate: string
    habitat: string | null
    color: string
    shape: string
    eggGroups: string[]
  }
}

// Respuesta de la API de listado
export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Array<{
    name: string
    url: string
  }>
}

// Pokemon simplificado para la lista
export interface PokemonSummary {
  id: number
  name: string
  image: string
}