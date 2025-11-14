import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamsApi } from '@/shared/api/teams.api';
import type { Team } from '@/shared/types/team';

export default function TeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamsApi.getAll();
      setTeams(data);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      // El interceptor de axios.ts ya maneja errores 401
      setError(err instanceof Error ? err.message : 'Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      return;
    }

    try {
      setDeletingId(id);
      await teamsApi.delete(id);
      setTeams(teams.filter((team) => team.id !== id));
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Error al eliminar el equipo');
    } finally {
      setDeletingId(null);
    }
  };

  const getPokemonSprite = (pokemonId: number) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="pokedex-panel p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton h-8 w-48"></div>
              <div className="skeleton h-4 w-64"></div>
            </div>
            <div className="skeleton h-10 w-32"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pokedex-panel skeleton h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="pokedex-panel p-6 max-w-md mx-auto">
          <p className="text-red-400 mb-4 text-terminal">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pokedex-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display text-2xl md:text-3xl text-neon mb-2">
              MY TEAMS
            </h1>
            <p className="text-terminal text-sm text-neutral-400">
              Create and manage your battle teams
            </p>
          </div>
          <button
            onClick={() => navigate('/teams/new')}
            className="btn-sukadex text-sm"
          >
            ✨ NEW TEAM
          </button>
        </div>
      </div>

      {/* Lista de equipos */}
      {teams.length === 0 ? (
        <div className="pokedex-panel text-center py-12">
          <div className="text-6xl mb-4 opacity-30">🎮</div>
          <h2 className="text-display text-xl text-neon mb-2">
            NO TEAMS YET
          </h2>
          <p className="text-neutral-400 mb-6 text-terminal text-sm">
            Create your first Pokémon team and start planning battle strategies
          </p>
          <button
            onClick={() => navigate('/teams/new')}
            className="btn-sukadex"
          >
            Create My First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="pokedex-panel cursor-pointer group hover:ring-2 hover:ring-pokedex-neon/60 transition-all"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              {/* Header de la card */}
              <div className="p-4 border-b border-terminal">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-neutral-200 truncate flex-1">
                    {team.name}
                  </h3>
                  <span className="stat-label ml-2">
                    {team.pokemons?.length || 0}/6
                  </span>
                </div>
                {team.description && (
                  <p className="text-sm text-neutral-400 line-clamp-2">
                    {team.description}
                  </p>
                )}
              </div>

              {/* Grid de Pokémon con badges */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 6].map((position) => {
                    const pokemon = team.pokemons?.find((p) => p.position === position);
                    return (
                      <div
                        key={position}
                        className={`aspect-square rounded-lg border-2 ${
                          pokemon
                            ? 'border-pokedex-neon/40 bg-neutral-900/50'
                            : 'border-dashed border-neutral-800 bg-neutral-900/20'
                        } flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform`}
                      >
                        {pokemon ? (
                          <div className="relative w-full h-full">
                            <img
                              src={getPokemonSprite(pokemon.pokemonId)}
                              alt={pokemon.pokemonName}
                              className="w-full h-full object-contain p-1"
                            />
                            {pokemon.nickname && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-neon text-[10px] text-center py-0.5 truncate px-1 text-terminal">
                                {pokemon.nickname}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-2xl text-neutral-700">?</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    className="btn-secondary flex-1 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teams/${team.id}/edit`);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-danger text-sm disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(team.id);
                    }}
                    disabled={deletingId === team.id}
                  >
                    {deletingId === team.id ? '...' : '🗑️'}
                  </button>
                </div>

                <div className="text-[10px] text-neutral-600 mt-3 text-center text-terminal">
                  CREATED: {new Date(team.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
