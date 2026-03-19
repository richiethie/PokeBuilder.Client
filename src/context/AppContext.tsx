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
import allPokemonData from "@/data/pokemon.json";
import gamesData from "@/data/games.json";
import { storage } from "@/lib/storage";

const MAX_TEAM_SIZE = 6;

const allPokemon = allPokemonData as Pokemon[];
const games = gamesData as Game[];

function rehydrateTeam(slots: (number | null)[]): (Pokemon | null)[] {
  return slots.map((id) =>
    id === null ? null : (allPokemon.find((p) => p.id === id) ?? null)
  );
}

interface AppContextValue {
  games: Game[];
  selectedGame: Game | null;
  selectGame: (key: string, preserveTeam?: boolean) => Promise<void>;

  dexPokemon: Pokemon[];
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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [dexIds, setDexIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");

  const [team, setTeam] = useState<(Pokemon | null)[]>(() =>
    rehydrateTeam(storage.getTeam())
  );

  const isHydrated = useRef(false);

  const selectGame = useCallback(
    async (key: string, preserveTeam = false) => {
      const game = games.find((g) => g.key === key) ?? null;
      setSelectedGame(game);

      if (!preserveTeam) {
        setTeam(Array(MAX_TEAM_SIZE).fill(null));
        setSearchQuery("");
        setTypeFilter("all");
      }

      if (!game) {
        setDexIds([]);
        return;
      }

      try {
        const module = await import(`@/data/gameDexes/${key}.json`);
        setDexIds(module.default as number[]);
      } catch {
        setDexIds([]);
      }
    },
    []
  );

  // Restore game from localStorage on mount
  useEffect(() => {
    const savedKey = storage.getGame();
    if (savedKey) void selectGame(savedKey, true);
    isHydrated.current = true;
  }, [selectGame]);

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

  const dexPokemon = useMemo(
    () =>
      dexIds
        .map((id) => allPokemon.find((p) => p.id === id))
        .filter((p): p is Pokemon => p !== undefined),
    [dexIds]
  );

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
    dexPokemon,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
