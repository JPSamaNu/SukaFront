export interface PokemonType {
  name: string
  color: string
  emoji: string
}

export const pokemonTypes: PokemonType[] = [
  { name: 'Normal', color: 'bg-gray-400', emoji: '⚪' },
  { name: 'Fuego', color: 'bg-orange-500', emoji: '🔥' },
  { name: 'Agua', color: 'bg-blue-500', emoji: '💧' },
  { name: 'Planta', color: 'bg-green-500', emoji: '🌿' },
  { name: 'Eléctrico', color: 'bg-yellow-400', emoji: '⚡' },
  { name: 'Hielo', color: 'bg-cyan-300', emoji: '❄️' },
  { name: 'Lucha', color: 'bg-red-600', emoji: '🥊' },
  { name: 'Veneno', color: 'bg-purple-500', emoji: '☠️' },
  { name: 'Tierra', color: 'bg-amber-600', emoji: '🏔️' },
  { name: 'Volador', color: 'bg-indigo-400', emoji: '🦅' },
  { name: 'Psíquico', color: 'bg-pink-500', emoji: '🔮' },
  { name: 'Bicho', color: 'bg-lime-500', emoji: '🐛' },
  { name: 'Roca', color: 'bg-stone-600', emoji: '🪨' },
  { name: 'Fantasma', color: 'bg-purple-700', emoji: '👻' },
  { name: 'Dragón', color: 'bg-indigo-600', emoji: '🐉' },
  { name: 'Siniestro', color: 'bg-gray-800', emoji: '🌑' },
  { name: 'Acero', color: 'bg-slate-400', emoji: '⚙️' },
  { name: 'Hada', color: 'bg-pink-300', emoji: '🧚' },
]

// Matriz de efectividad 18x18 (atacante x defensor)
// 2 = Súper efectivo, 1 = Normal, 0.5 = Poco efectivo, 0 = No afecta
const matrizEfectividad: number[][] = [
  // Nor  Fue  Agu  Pla  Ele  Hie  Luc  Ven  Tie  Vol  Psi  Bic  Roc  Fan  Dra  Sin  Ace  Had
  [1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   0.5, 0,   1,   1,   0.5, 1  ], // Normal
  [1,   0.5, 0.5, 2,   1,   2,   1,   1,   1,   1,   1,   2,   0.5, 1,   0.5, 1,   2,   1  ], // Fuego
  [1,   2,   0.5, 0.5, 1,   1,   1,   1,   2,   1,   1,   1,   2,   1,   0.5, 1,   1,   1  ], // Agua
  [1,   0.5, 2,   0.5, 1,   1,   1,   0.5, 2,   0.5, 1,   0.5, 2,   1,   0.5, 1,   0.5, 1  ], // Planta
  [1,   1,   2,   0.5, 0.5, 1,   1,   1,   0,   2,   1,   1,   1,   1,   0.5, 1,   1,   1  ], // Eléctrico
  [1,   0.5, 0.5, 2,   1,   0.5, 1,   1,   2,   2,   1,   1,   1,   1,   2,   1,   0.5, 1  ], // Hielo
  [2,   1,   1,   1,   1,   2,   1,   0.5, 1,   0.5, 0.5, 0.5, 2,   0,   1,   2,   2,   0.5], // Lucha
  [1,   1,   1,   2,   1,   1,   1,   0.5, 0.5, 1,   1,   1,   0.5, 0.5, 1,   1,   0,   2  ], // Veneno
  [1,   2,   1,   0.5, 2,   1,   1,   2,   1,   0,   1,   0.5, 2,   1,   1,   1,   2,   1  ], // Tierra
  [1,   1,   1,   2,   0.5, 1,   2,   1,   1,   1,   1,   2,   0.5, 1,   1,   1,   0.5, 1  ], // Volador
  [1,   1,   1,   1,   1,   1,   2,   2,   1,   1,   0.5, 1,   1,   1,   1,   0,   0.5, 1  ], // Psíquico
  [1,   0.5, 1,   2,   1,   1,   0.5, 0.5, 1,   0.5, 2,   1,   1,   0.5, 1,   2,   0.5, 0.5], // Bicho
  [1,   2,   1,   1,   1,   2,   0.5, 1,   0.5, 2,   1,   2,   1,   1,   1,   1,   0.5, 1  ], // Roca
  [0,   1,   1,   1,   1,   1,   1,   1,   1,   1,   2,   1,   1,   2,   1,   0.5, 1,   1  ], // Fantasma
  [1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   2,   1,   0.5, 0  ], // Dragón
  [1,   1,   1,   1,   1,   1,   0.5, 1,   1,   1,   2,   1,   1,   2,   1,   0.5, 1,   0.5], // Siniestro
  [1,   0.5, 0.5, 1,   0.5, 2,   1,   1,   1,   1,   1,   1,   2,   1,   1,   1,   0.5, 2  ], // Acero
  [1,   0.5, 1,   1,   1,   1,   2,   0.5, 1,   1,   1,   1,   1,   1,   2,   2,   0.5, 1  ]  // Hada
]

export interface TypeEffectiveness {
  atacando: { tipo: string; multiplicador: number }[]
  defendiendo: { tipo: string; multiplicador: number }[]
}

/**
 * Analiza la efectividad de un tipo Pokémon
 * @param tipo - Nombre del tipo a analizar
 * @returns Objeto con arrays de efectividad al atacar y al defender
 */
export function analizarTipo(tipo: string): TypeEffectiveness {
  const indice = pokemonTypes.findIndex(t => t.name === tipo)
  
  if (indice === -1) {
    return { atacando: [], defendiendo: [] }
  }

  const atacando = pokemonTypes.map((defensor, i) => ({
    tipo: defensor.name,
    multiplicador: matrizEfectividad[indice][i]
  }))

  const defendiendo = pokemonTypes.map((atacante, i) => ({
    tipo: atacante.name,
    multiplicador: matrizEfectividad[i][indice]
  }))

  return { atacando, defendiendo }
}

/**
 * Calcula la defensa combinada para Pokémon de tipo dual
 * @param tipo1 - Primer tipo
 * @param tipo2 - Segundo tipo
 * @returns Array con multiplicadores combinados (multiplicados entre sí)
 */
export function calcularDefensaCombinada(
  tipo1: string,
  tipo2: string
): { tipo: string; multiplicador: number }[] {
  const effectiveness1 = analizarTipo(tipo1)
  const effectiveness2 = analizarTipo(tipo2)

  return effectiveness1.defendiendo.map((item, index) => ({
    tipo: item.tipo,
    multiplicador: item.multiplicador * effectiveness2.defendiendo[index].multiplicador
  }))
}

/**
 * Ordena tipos por relevancia: primero los diferentes a 1 (neutral), luego los normales
 * @param items - Array de tipos con sus multiplicadores
 * @returns Array ordenado por relevancia
 */
export function sortByRelevance(
  items: { tipo: string; multiplicador: number }[]
): { tipo: string; multiplicador: number }[] {
  return [...items].sort((a, b) => {
    // Si ambos son normales (×1), mantener orden alfabético
    if (a.multiplicador === 1 && b.multiplicador === 1) {
      return a.tipo.localeCompare(b.tipo)
    }
    // Si solo uno es normal, el otro va primero
    if (a.multiplicador === 1) return 1
    if (b.multiplicador === 1) return -1
    // Para no normales, ordenar por multiplicador descendente
    return b.multiplicador - a.multiplicador
  })
}

/**
 * Obtiene el color del texto según el multiplicador
 * @param mult - Multiplicador de efectividad
 * @returns Clases de Tailwind para el color del texto
 */
export function getMultiplierColor(mult: number): string {
  if (mult === 0) return 'text-gray-400'
  if (mult === 0.25) return 'text-red-700'
  if (mult === 0.5) return 'text-red-500'
  if (mult === 1) return 'text-gray-600'
  if (mult === 2) return 'text-green-600'
  if (mult === 4) return 'text-green-700'
  return 'text-gray-600'
}

/**
 * Obtiene el color de fondo según el multiplicador
 * @param mult - Multiplicador de efectividad
 * @returns Clases de Tailwind para el color de fondo
 */
export function getMultiplierBg(mult: number): string {
  if (mult === 0) return 'bg-gray-100 dark:bg-gray-800'
  if (mult === 0.25) return 'bg-red-100 dark:bg-red-900/30'
  if (mult === 0.5) return 'bg-red-50 dark:bg-red-900/20'
  if (mult === 1) return 'bg-gray-50 dark:bg-gray-800/50'
  if (mult === 2) return 'bg-green-50 dark:bg-green-900/20'
  if (mult === 4) return 'bg-green-100 dark:bg-green-900/30'
  return 'bg-gray-50 dark:bg-gray-800/50'
}
