import { api } from './axios';
import type { Team, CreateTeamDto, UpdateTeamDto, AddPokemonToTeamDto, UpdateTeamPokemonDto } from '../types/team';

export const teamsApi = {
  // Obtener todos los equipos del usuario
  getAll: async (): Promise<Team[]> => {
    const response = await api.get<Team[]>('/teams');
    return response.data;
  },

  // Obtener un equipo por ID
  getById: async (id: string): Promise<Team> => {
    const response = await api.get<Team>(`/teams/${id}`);
    return response.data;
  },

  // Crear nuevo equipo
  create: async (data: CreateTeamDto): Promise<Team> => {
    const response = await api.post<Team>('/teams', data);
    return response.data;
  },

  // Actualizar equipo
  update: async (id: string, data: UpdateTeamDto): Promise<Team> => {
    const response = await api.patch<Team>(`/teams/${id}`, data);
    return response.data;
  },

  // Eliminar equipo
  delete: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },

  // Agregar Pokémon al equipo
  addPokemon: async (teamId: string, pokemon: AddPokemonToTeamDto): Promise<Team> => {
    const response = await api.post<Team>(`/teams/${teamId}/pokemons`, pokemon);
    return response.data;
  },

  // Actualizar Pokémon en el equipo
  updatePokemon: async (
    teamId: string,
    pokemonId: string,
    data: UpdateTeamPokemonDto
  ): Promise<Team> => {
    const response = await api.patch<Team>(`/teams/${teamId}/pokemons/${pokemonId}`, data);
    return response.data;
  },

  // Eliminar Pokémon del equipo
  removePokemon: async (teamId: string, pokemonId: string): Promise<Team> => {
    const response = await api.delete<Team>(`/teams/${teamId}/pokemons/${pokemonId}`);
    return response.data;
  },
};
