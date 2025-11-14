export interface TeamPokemon {
  id: string;
  teamId: string;
  pokemonId: number;
  pokemonName: string;
  position: number;
  nickname?: string;
  moves?: string[];
  ability?: string;
  item?: string;
  nature?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  userId: string;
  pokemons: TeamPokemon[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  pokemons?: AddPokemonToTeamDto[];
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export interface AddPokemonToTeamDto {
  pokemonId: number;
  pokemonName: string;
  position: number;
  nickname?: string;
  moves?: string[];
  ability?: string;
  item?: string;
  nature?: string;
}

export interface UpdateTeamPokemonDto {
  position?: number;
  nickname?: string;
  moves?: string[];
  ability?: string;
  item?: string;
  nature?: string;
}
