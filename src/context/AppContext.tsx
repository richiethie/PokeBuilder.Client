import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type { Pokemon, Game, FilterType } from "@/types";
import { gamesService } from "@/lib/api";
import { storage } from "@/lib/storage";

const MAX_TEAM_SIZE = 6;
export const FULL_POKEDEX_KEY = "fullpokedex";

const FULL_POKEDEX_GAME: Game = {
  key: FULL_POKEDEX_KEY,
  name: "Full Pokédex",
  generation: 0,
};

async function loadFullDex(allGames: Game[]): Promise<Pokemon[]> {
  const allDexes = await Promise.all(
    allGames.map((game) => gamesService.getDex(game.key))
  );

  const byId = new Map<number, Pokemon>();
  for (const dex of allDexes) {
    for (const pokemon of dex) {
      if (!byId.has(pokemon.id)) {
        byId.set(pokemon.id, {
          ...pokemon,
          // In full view we want National order/numbering.
          dexNumber: pokemon.id,
        });
      }
    }
  }

  return [...byId.values()].sort((a, b) => a.id - b.id);
}

export interface ActiveSavedTeam {
  id: string;
  name: string;
  /** Name at load time — used to detect renames. */
  originalName: string;
  /** Slot IDs at load time — used to detect changes. */
  originalPokemonIds: (number | null)[];
}

interface AppContextValue {
  games: Game[];
  selectedGame: Game | null;
  selectGame: (key: string, preserveTeam?: boolean, teamIds?: (number | null)[]) => Promise<void>;
  /** True while the app is restoring a previously saved game from localStorage. */
  isHydrating: boolean;

  dexPokemon: Pokemon[];
  isDexLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  typeFilter: FilterType;
  setTypeFilter: (t: FilterType) => void;
  filteredPokemon: Pokemon[];

  team: (Pokemon | null)[];
  addToTeam: (pokemon: Pokemon) => void;
  removeFromTeam: (slotIndex: number) => void;
  isOnTeam: (id: number) => boolean;
  teamPokemon: Pokemon[];

  /** Load a team directly from IDs using the already-loaded dex (no re-fetch). */
  loadTeamFromIds: (ids: (number | null)[]) => void;
  /** Clear all team slots and decouple from any active saved team. */
  clearTeam: () => void;
  /** Non-null when the current team was loaded from a saved team for editing. */
  activeSavedTeam: ActiveSavedTeam | null;
  setActiveSavedTeam: (v: ActiveSavedTeam | null) => void;
  setActiveSavedTeamName: (name: string) => void;
  /** True when the team or name differs from the saved snapshot. */
  isTeamDirty: boolean;

  teamSheetOpen: boolean;
  setTeamSheetOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [dexPokemon, setDexPokemon] = useState<Pokemon[]>([]);
  const [isDexLoading, setIsDexLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [team, setTeam] = useState<(Pokemon | null)[]>(
    Array(MAX_TEAM_SIZE).fill(null)
  );

  // True while restoring a saved game session — prevents flashing the welcome hero
  const [isHydrating, setIsHydrating] = useState<boolean>(
    () => !!storage.getGame()
  );
  const [activeSavedTeam, setActiveSavedTeam] = useState<ActiveSavedTeam | null>(null);
  const [teamSheetOpen, setTeamSheetOpen] = useState(false);

  const isHydrated = useRef(false);

  const setActiveSavedTeamName = useCallback((name: string) => {
    setActiveSavedTeam((prev) => (prev ? { ...prev, name } : null));
  }, []);

  const isTeamDirty = useMemo(() => {
    if (!activeSavedTeam) return false;
    const currentIds = team.map((p) => p?.id ?? null);
    return (
      activeSavedTeam.name !== activeSavedTeam.originalName ||
      !currentIds.every((id, i) => id === activeSavedTeam.originalPokemonIds[i])
    );
  }, [activeSavedTeam, team]);

  const gamesRef = useRef(games);
  gamesRef.current = games;

  const selectGame = useCallback(
    async (key: string, preserveTeam = false, teamIds?: (number | null)[]) => {
      setIsDexLoading(true);
      setSearchQuery("");
      setTypeFilter("all");

      if (!preserveTeam) {
        setTeam(Array(MAX_TEAM_SIZE).fill(null));
      }

      if (!teamIds) {
        setActiveSavedTeam(null);
      }

      try {
        const cached = gamesRef.current;
        const allGames =
          cached.length > 0 ? cached : await gamesService.getGames();

        const game =
          key === FULL_POKEDEX_KEY
            ? FULL_POKEDEX_GAME
            : (allGames.find((g) => g.key === key) ?? null);
        const dex =
          key === FULL_POKEDEX_KEY
            ? await loadFullDex(allGames)
            : await gamesService.getDex(key);
        setSelectedGame(game);

        if (cached.length === 0 && allGames.length > 0) {
          setGames(allGames);
        }

        setDexPokemon(dex);

        if (teamIds) {
          setTeam(
            teamIds.map((id) =>
              id === null ? null : (dex.find((p) => p.id === id) ?? null)
            )
          );
        } else if (preserveTeam) {
          const savedSlots = storage.getTeam();
          setTeam(
            savedSlots.map((id) =>
              id === null ? null : (dex.find((p) => p.id === id) ?? null)
            )
          );
        }
      } catch {
        setSelectedGame(null);
        setDexPokemon([]);
      } finally {
        setIsDexLoading(false);
      }
    },
    [] // stable — reads games via ref
  );

  // Hydrate everything on mount: games list + saved game + saved team.
  // This is one atomic operation — isHydrating stays true until everything resolves.
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const allGames = await gamesService.getGames();
        if (cancelled) return;
        setGames(allGames);

        const savedKey = storage.getGame();
        if (savedKey) {
          const dex =
            savedKey === FULL_POKEDEX_KEY
              ? await loadFullDex(allGames)
              : await gamesService.getDex(savedKey);
          if (cancelled) return;

          const game =
            savedKey === FULL_POKEDEX_KEY
              ? FULL_POKEDEX_GAME
              : (allGames.find((g) => g.key === savedKey) ?? null);
          setSelectedGame(game);
          setDexPokemon(dex);

          const savedSlots = storage.getTeam();
          setTeam(
            savedSlots.map((id) =>
              id === null ? null : (dex.find((p) => p.id === id) ?? null)
            )
          );
        }
      } catch {
        // If hydration fails, just start fresh
      } finally {
        if (!cancelled) {
          isHydrated.current = true;
          setIsHydrating(false);
        }
      }
    }
    hydrate();
    return () => { cancelled = true; };
  }, []);

  // Persist game changes
  useEffect(() => {
    if (!isHydrated.current) return;
    if (selectedGame) storage.setGame(selectedGame.key);
    else storage.clearGame();
  }, [selectedGame]);

  // Persist team changes
  useEffect(() => {
    storage.setTeam(team.map((p) => p?.id ?? null));
  }, [team]);

  const filteredPokemon = useMemo(
    () =>
      dexPokemon.filter((p) => {
        const matchesSearch = p.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesType =
          typeFilter === "all" || p.types.includes(typeFilter);
        return matchesSearch && matchesType;
      }),
    [dexPokemon, searchQuery, typeFilter]
  );

  const teamPokemon = useMemo(
    () => team.filter((p): p is Pokemon => p !== null),
    [team]
  );

  const isOnTeam = useCallback(
    (id: number) => team.some((p) => p?.id === id),
    [team]
  );

  const addToTeam = useCallback(
    (pokemon: Pokemon) => {
      if (isOnTeam(pokemon.id)) return;
      setTeam((prev) => {
        const emptyIndex = prev.findIndex((slot) => slot === null);
        if (emptyIndex === -1) return prev;
        const next = [...prev];
        next[emptyIndex] = pokemon;
        return next;
      });
    },
    [isOnTeam]
  );

  const loadTeamFromIds = useCallback(
    (ids: (number | null)[]) => {
      setTeam(
        ids.map((id) =>
          id === null ? null : (dexPokemon.find((p) => p.id === id) ?? null)
        )
      );
    },
    [dexPokemon]
  );

  const clearTeam = useCallback(() => {
    setTeam(Array(MAX_TEAM_SIZE).fill(null));
    setActiveSavedTeam(null);
  }, []);

  const removeFromTeam = useCallback((slotIndex: number) => {
    setTeam((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  }, []);

  const value: AppContextValue = {
    games,
    selectedGame,
    selectGame,
    isHydrating,
    dexPokemon,
    isDexLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    filteredPokemon,
    team,
    addToTeam,
    removeFromTeam,
    isOnTeam,
    teamPokemon,
    loadTeamFromIds,
    clearTeam,
    activeSavedTeam,
    setActiveSavedTeam,
    setActiveSavedTeamName,
    isTeamDirty,
    teamSheetOpen,
    setTeamSheetOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
