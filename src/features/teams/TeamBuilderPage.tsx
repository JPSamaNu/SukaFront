import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teamsApi } from '@/shared/api/teams.api';
import { pokemonApi } from '@/shared/api/pokemon.api';
import type { Team, AddPokemonToTeamDto } from '@/shared/types/team';

export default function TeamBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  // Estado para crear nuevo equipo
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Estado del equipo existente
  const [team, setTeam] = useState<Team | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(!isNew);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  // Estado para agregar Pokémon
  const [showPokemonSearch, setShowPokemonSearch] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const [adding, setAdding] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Refs para infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPokemonRef = useRef<HTMLTableRowElement | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const nextPageRef = useRef(1);

  useEffect(() => {
    if (!isNew && id) {
      fetchTeam();
    }
  }, [id, isNew]);

  const fetchTeam = async () => {
    try {
      setLoadingTeam(true);
      const data = await teamsApi.getById(id!);
      setTeam(data);
      setTempName(data.name);
      setTempDescription(data.description || '');
    } catch (err) {
      console.error('Error fetching team:', err);
      alert('Error al cargar el equipo');
      navigate('/teams');
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert('El nombre del equipo es requerido');
      return;
    }

    try {
      setCreating(true);
      await teamsApi.create({
        name: teamName,
        description: teamDescription,
      });
      navigate('/teams');
    } catch (err) {
      console.error('Error creating team:', err);
      alert('Error al crear el equipo');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTeamInfo = async () => {
    if (!team || !tempName.trim()) {
      alert('El nombre del equipo es requerido');
      return;
    }

    try {
      await teamsApi.update(team.id, {
        name: tempName,
        description: tempDescription,
      });
      setTeam({ ...team, name: tempName, description: tempDescription });
      setEditingName(false);
    } catch (err) {
      console.error('Error updating team:', err);
      alert('Error al actualizar el equipo');
    }
  };

  const handleOpenSlot = (position: number) => {
    const pokemon = getPokemonInSlot(position);
    if (pokemon) {
      if (confirm(`¿Deseas remover a ${pokemon.pokemonName} del equipo?`)) {
        handleRemovePokemon(pokemon.id);
      }
    } else {
      setSelectedSlot(position);
      setShowPokemonSearch(true);
      setSearchQuery('');
      setDebouncedSearch('');
      setPokemonList([]);
      nextPageRef.current = 1;
      setHasMore(true);
    }
  };

  // Función para cargar Pokémon con infinite scroll
  const loadMorePokemon = useCallback(async (page: number, search: string) => {
    if (loadingPokemon) return;

    try {
      setLoadingPokemon(true);
      const response = await pokemonApi.getAll({
        page,
        limit: 20,
        search: search || undefined,
        sortBy: 'id',
        sortOrder: 'ASC',
      });

      setPokemonList(prev => {
        if (page === 1) {
          return response.data;
        }
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNew = response.data.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });

      setTotalCount(response.total);
      setHasMore(response.page < response.totalPages);
      nextPageRef.current = page + 1;
    } catch (err) {
      console.error('Error loading pokemon:', err);
      setHasMore(false);
    } finally {
      setLoadingPokemon(false);
    }
  }, [loadingPokemon]);

  // Debounce para búsqueda
  useEffect(() => {
    if (!showPokemonSearch) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPokemonList([]);
      nextPageRef.current = 1;
      setHasMore(true);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, showPokemonSearch]);

  // Cargar Pokémon cuando cambia la búsqueda
  useEffect(() => {
    if (showPokemonSearch) {
      loadMorePokemon(1, debouncedSearch);
    }
  }, [debouncedSearch, showPokemonSearch, loadMorePokemon]);

  // Intersection Observer para infinite scroll
  useEffect(() => {
    if (!showPokemonSearch || loadingPokemon || !hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingPokemon) {
          loadMorePokemon(nextPageRef.current, debouncedSearch);
        }
      },
      { threshold: 0.1 }
    );

    if (lastPokemonRef.current) {
      observerRef.current.observe(lastPokemonRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [showPokemonSearch, loadingPokemon, hasMore, debouncedSearch, loadMorePokemon]);

  const handleAddPokemon = async (pokemon: any) => {
    if (!team || !selectedSlot) return;

    try {
      setAdding(true);
      const pokemonData: AddPokemonToTeamDto = {
        pokemonId: pokemon.id,
        pokemonName: pokemon.name,
        position: selectedSlot,
      };
      
      await teamsApi.addPokemon(team.id, pokemonData);
      await fetchTeam(); // Recargar equipo
      setShowPokemonSearch(false);
      setSearchQuery('');
      setPokemonList([]);
      setSelectedSlot(null);
    } catch (err: any) {
      console.error('Error adding pokemon:', err);
      alert(err.response?.data?.message || 'Error al agregar Pokémon al equipo');
    } finally {
      setAdding(false);
    }
  };

  const handleRemovePokemon = async (pokemonId: string) => {
    if (!team) return;

    try {
      await teamsApi.removePokemon(team.id, pokemonId);
      await fetchTeam();
    } catch (err) {
      console.error('Error removing pokemon:', err);
      alert('Error al remover Pokémon del equipo');
    }
  };

  const getPokemonInSlot = (position: number) => {
    return team?.pokemons?.find((p) => p.position === position);
  };

  const getPokemonSprite = (pokemonId: number) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  };

  // Modo: Crear nuevo equipo
  if (isNew) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <div className="pokedex-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-display text-3xl text-neon">CREATE NEW TEAM</h1>
            <button onClick={() => navigate('/teams')} className="btn-secondary text-sm">
              ← BACK
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="stat-label block mb-2">
                TEAM NAME *
              </label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ex: My Competitive Team"
                maxLength={100}
                className="input-terminal w-full"
              />
            </div>
            <div>
              <label className="stat-label block mb-2">
                DESCRIPTION (OPTIONAL)
              </label>
              <input
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Ex: Balanced team for online battles"
                maxLength={500}
                className="input-terminal w-full"
              />
            </div>
            <button
              onClick={handleCreateTeam}
              disabled={creating || !teamName.trim()}
              className="btn-sukadex w-full disabled:opacity-50"
            >
              {creating ? 'CREATING...' : 'CREATE TEAM'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modo: Ver/Editar equipo existente
  if (loadingTeam) {
    return (
      <div className="space-y-6 p-4">
        <div className="skeleton h-10 w-64"></div>
        <div className="skeleton h-96 w-full"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="pokedex-panel text-center py-12 m-4">
        <div className="text-6xl mb-4 opacity-30">❌</div>
        <p className="text-neutral-400 mb-6 text-terminal">TEAM NOT FOUND</p>
        <button onClick={() => navigate('/teams')} className="btn-sukadex">
          BACK TO MY TEAMS
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header con información del equipo */}
      <div className="pokedex-panel p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {editingName ? (
              <div className="space-y-3">
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Team name"
                  className="input-terminal w-full text-2xl font-bold"
                />
                <input
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="input-terminal w-full"
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateTeamInfo} className="btn-sukadex text-sm">
                    💾 SAVE
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setTempName(team.name);
                      setTempDescription(team.description || '');
                    }}
                    className="btn-secondary text-sm"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-display text-3xl text-neon">{team.name.toUpperCase()}</h1>
                  <button onClick={() => setEditingName(true)} className="btn-icon">
                    ✏️
                  </button>
                </div>
                {team.description && (
                  <p className="text-neutral-400 mt-2 text-terminal text-sm">{team.description}</p>
                )}
              </div>
            )}
          </div>
          <button onClick={() => navigate('/teams')} className="btn-secondary text-sm">
            ← BACK
          </button>
        </div>
      </div>

      {/* Grid de 6 slots */}
      <div className="pokedex-panel">
        <div className="pokedex-panel-header">
          <h3 className="panel-title">POKÉMON TEAM (MAX 6)</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((position) => {
              const pokemon = getPokemonInSlot(position);
              
              return (
                <div
                  key={position}
                  onClick={() => handleOpenSlot(position)}
                  className="relative border-2 border-dashed border-terminal rounded-lg p-4 hover:border-neon hover:bg-neutral-900/50 transition-all cursor-pointer min-h-[180px] flex flex-col items-center justify-center hover-lift"
                >
                  <div className="absolute top-2 left-2 badge-neon w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {position}
                  </div>
                  
                  {pokemon ? (
                    <>
                      <img
                        src={getPokemonSprite(pokemon.pokemonId)}
                        alt={pokemon.pokemonName}
                        className="w-24 h-24 object-contain"
                      />
                      <p className="text-center font-medium text-neutral-200 capitalize mt-2 text-terminal">
                        {pokemon.nickname || pokemon.pokemonName}
                      </p>
                      {pokemon.nickname && (
                        <p className="text-xs text-neutral-500 capitalize text-terminal">
                          ({pokemon.pokemonName})
                        </p>
                      )}
                      <div className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl">
                        ×
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl text-neutral-600 mb-2">+</div>
                      <p className="stat-label">ADD POKÉMON</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de búsqueda de Pokémon */}
      {showPokemonSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="pokedex-panel w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="pokedex-panel-header">
              <div className="flex items-center justify-between">
                <h3 className="panel-title">SELECT POKÉMON - SLOT {selectedSlot}</h3>
                <button
                  onClick={() => {
                    setShowPokemonSearch(false);
                    setSearchQuery('');
                    setPokemonList([]);
                    setSelectedSlot(null);
                  }}
                  className="btn-icon"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col p-6">
              {/* Búsqueda */}
              <div className="mb-4">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or number..."
                  className="input-terminal w-full"
                />
              </div>

              {/* Tabla de Pokémon */}
              <div className="flex-1 overflow-y-auto border border-terminal rounded-lg">
                {pokemonList.length === 0 && loadingPokemon ? (
                  <div className="loading-spinner"></div>
                ) : pokemonList.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-6xl mb-4">🔍</p>
                      <p className="text-theme-muted">No se encontraron Pokémon</p>
                      {searchQuery && (
                        <p className="text-sm text-theme-muted mt-2">
                          Intenta con otro término de búsqueda
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-panel sticky top-0 z-10">
                      <tr>
                        <th className="text-left p-3 stat-label">#NO</th>
                        <th className="text-left p-3 stat-label">SPRITE</th>
                        <th className="text-left p-3 stat-label">NAME</th>
                        <th className="text-center p-3 stat-label">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pokemonList.map((pokemon, index) => (
                        <tr
                          key={pokemon.id}
                          ref={index === pokemonList.length - 1 ? lastPokemonRef : null}
                          className="border-t border-terminal hover:bg-neutral-900/50 transition-colors"
                        >
                          <td className="p-3 text-neutral-500 text-terminal">#{pokemon.id.toString().padStart(3, '0')}</td>
                          <td className="p-3">
                            <img
                              src={pokemon.sprites.front_default || getPokemonSprite(pokemon.id)}
                              alt={pokemon.name}
                              className="w-12 h-12 object-contain"
                              loading="lazy"
                            />
                          </td>
                          <td className="p-3">
                            <p className="font-medium capitalize text-neutral-200 text-terminal">{pokemon.name}</p>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleAddPokemon(pokemon)}
                              disabled={adding}
                              className="btn-sukadex text-sm disabled:opacity-50"
                            >
                              {adding ? '...' : 'ADD'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Loading indicator while scrolling */}
                      {loadingPokemon && pokemonList.length > 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center">
                            <div className="loading-text">
                              <div className="loading-spinner"></div>
                              <span>Cargando más...</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Info de resultados */}
              {pokemonList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-terminal text-center">
                  <p className="text-terminal text-sm text-neutral-500">
                    Showing {pokemonList.length} of {totalCount} Pokémon
                    {!hasMore && ' - You have seen them all ✨'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
