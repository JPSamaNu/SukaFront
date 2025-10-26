// Tipos básicos para Pokemon
export interface Pokemon {
  id: number
  name: string
  sprites: {
    front_default: string | null
    other: {
      'official-artwork': {
        front_default: string | null
      }
    }
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  height: number
  weight: number
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