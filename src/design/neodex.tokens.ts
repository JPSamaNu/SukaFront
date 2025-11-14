/**
 * NeoDex Design Tokens
 * Exportable constants for colors, types, and theme utilities
 */

export const POKEDEX_COLORS = {
  red: '#E63946',
  graphite: '#1E1E1E',
  steel: '#3A3A3A',
  neon: '#00B4D8',
  amber: '#FFD60A',
} as const;

export const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  grass: '#7AC74C',
  electric: '#F7D02C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
} as const;

export type PokemonType = keyof typeof TYPE_COLORS;

/**
 * Get Tailwind background class for a Pokémon type
 */
export function typeBackground(type: string): string {
  const normalizedType = type.toLowerCase() as PokemonType;
  return TYPE_COLORS[normalizedType] ? `bg-types-${normalizedType}` : 'bg-neutral-500';
}

/**
 * Get Tailwind text class for a Pokémon type
 */
export function typeText(type: string): string {
  const normalizedType = type.toLowerCase() as PokemonType;
  return TYPE_COLORS[normalizedType] ? `text-types-${normalizedType}` : 'text-neutral-500';
}

/**
 * Get hex color for a Pokémon type
 */
export function typeColor(type: string): string {
  const normalizedType = type.toLowerCase() as PokemonType;
  return TYPE_COLORS[normalizedType] || '#A8A77A';
}

/**
 * Get background color with opacity for badges
 */
export function typeBadgeClasses(type: string, size: 'sm' | 'md' = 'md'): string {
  const normalizedType = type.toLowerCase() as PokemonType;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  if (!TYPE_COLORS[normalizedType]) {
    return `${sizeClasses} rounded bg-neutral-500/20 text-neutral-400 ring-1 ring-neutral-500/40`;
  }
  
  return `${sizeClasses} rounded bg-types-${normalizedType}/20 text-types-${normalizedType} ring-1 ring-types-${normalizedType}/40`;
}
