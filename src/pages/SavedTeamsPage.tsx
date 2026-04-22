import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Trash2, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teamsService, getErrorMessage } from "@/lib/api";
import type { SavedTeam } from "@/lib/api";
import { getPokemonImageUrl } from "@/lib/pokemon";
import { AppHeader } from "@/components/AppHeader";
import { FULL_POKEDEX_KEY, useAppContext } from "@/context/AppContext";

const GAME_ORDER_BY_GENERATION: Record<number, string[]> = {
  3: ["rubysapphire", "emerald", "omegarubyalphasapphire"],
  4: ["diamondpearl", "platinum", "brilliantdiamondshiningpearl"],
  5: ["blackwhite", "black2white2"],
  7: ["sunmoon", "ultrasunmoon"],
};

const GAME_ICON_POKEMON_ID: Record<string, number> = {
  redblueyellow: 25,
  firered: 6,
  goldsilvercrystal: 249,
  heartgold: 250,
  rubysapphire: 383,
  emerald: 384,
  diamondpearl: 483,
  platinum: 487,
  blackwhite: 643,
  black2white2: 646,
  xy: 716,
  omegarubyalphasapphire: 382,
  sunmoon: 791,
  ultrasunmoon: 800,
  swordshield: 888,
  brilliantdiamondshiningpearl: 484,
  scarletviolet: 1007,
  [FULL_POKEDEX_KEY]: 25,
};

function getGenerationLabel(generation: number): string {
  if (generation === 0) return "Full Pokédex";
  return `Generation ${generation}`;
}

export function SavedTeamsPage() {
  const navigate = useNavigate();
  const { games } = useAppContext();
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("all");

  useEffect(() => {
    teamsService
      .getAll()
      .then(setTeams)
      .catch((err) => setError(getErrorMessage(err, "Failed to load teams.")))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await teamsService.delete(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete team."));
    } finally {
      setDeletingId(null);
    }
  }

  const gamesByKey = useMemo(() => {
    return new Map(games.map((g) => [g.key, g]));
  }, [games]);

  const gameOptions = useMemo(() => {
    const seen = new Set<string>();
    return teams
      .filter((team) => {
        if (seen.has(team.gameKey)) return false;
        seen.add(team.gameKey);
        return true;
      })
      .map((team) => {
        if (team.gameKey === FULL_POKEDEX_KEY) {
          return {
            key: team.gameKey,
            name: "Full Pokédex",
            generation: 0,
          };
        }
        const game = gamesByKey.get(team.gameKey);
        return {
          key: team.gameKey,
          name: game?.name ?? team.gameKey,
          generation: game?.generation ?? Number.MAX_SAFE_INTEGER,
        };
      })
      .sort((a, b) => {
        if (a.generation !== b.generation) return a.generation - b.generation;
        return a.name.localeCompare(b.name);
      });
  }, [teams, gamesByKey]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return teams.filter((team) => {
      const gameName = gamesByKey.get(team.gameKey)?.name ?? team.gameKey;
      const matchesSearch =
        query.length === 0 ||
        team.name.toLowerCase().includes(query) ||
        gameName.toLowerCase().includes(query);
      const matchesGame = gameFilter === "all" || team.gameKey === gameFilter;
      return matchesSearch && matchesGame;
    });
  }, [teams, searchQuery, gameFilter, gamesByKey]);

  const groupedTeams = useMemo(() => {
    const buckets = new Map<number, Map<string, SavedTeam[]>>();
    filteredTeams.forEach((team) => {
      const generation =
        team.gameKey === FULL_POKEDEX_KEY
          ? 0
          : (gamesByKey.get(team.gameKey)?.generation ?? Number.MAX_SAFE_INTEGER);
      if (!buckets.has(generation)) buckets.set(generation, new Map());
      const gameMap = buckets.get(generation)!;
      if (!gameMap.has(team.gameKey)) gameMap.set(team.gameKey, []);
      gameMap.get(team.gameKey)!.push(team);
    });

    return [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([generation, gameMap]) => {
        const preferredOrder = GAME_ORDER_BY_GENERATION[generation] ?? [];
        const rank = new Map(preferredOrder.map((key, index) => [key, index]));
        const gamesInGeneration = [...gameMap.keys()].sort((a, b) => {
          const aRank = rank.get(a) ?? Number.MAX_SAFE_INTEGER;
          const bRank = rank.get(b) ?? Number.MAX_SAFE_INTEGER;
          if (aRank !== bRank) return aRank - bRank;
          const aName = gamesByKey.get(a)?.name ?? a;
          const bName = gamesByKey.get(b)?.name ?? b;
          return aName.localeCompare(bName);
        });

        return {
          generation,
          label: generation === Number.MAX_SAFE_INTEGER ? "Other" : getGenerationLabel(generation),
          games: gamesInGeneration.map((gameKey) => ({
            gameKey,
            gameName:
              gameKey === FULL_POKEDEX_KEY
                ? "Full Pokédex"
                : (gamesByKey.get(gameKey)?.name ?? gameKey),
            teams: gameMap.get(gameKey)!,
          })),
        };
      });
  }, [filteredTeams, gamesByKey]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto w-full max-w-5xl px-4 py-6 flex flex-col gap-6">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col gap-2">
          <h1 className="text-base font-semibold">Saved Teams</h1>
          <p className="text-sm text-muted-foreground">Teams you've saved across all games.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search team name or game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {gameOptions.map((game) => (
                  <SelectItem key={game.key} value={game.key}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                {teams.length === 0 ? "No saved teams yet" : "No teams match your filters"}
              </p>
              <p className="text-xs text-muted-foreground max-w-[260px]">
                {teams.length === 0
                  ? "Build a team on the main page and hit Save Team to store it here."
                  : "Try a different search term or switch the game filter."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {groupedTeams.map((group) => (
                <section key={group.label} className="flex flex-col gap-3">
                  <div className="border-b pb-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {group.label}
                    </p>
                  </div>

                  {group.games.map((gameGroup) => {
                    const iconPokemonId = GAME_ICON_POKEMON_ID[gameGroup.gameKey];
                    return (
                      <div
                        key={gameGroup.gameKey}
                        className="rounded-lg border border-border bg-card/30 p-3"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          {iconPokemonId ? (
                            <img
                              src={getPokemonImageUrl(iconPokemonId)}
                              alt=""
                              className="h-5 w-5 rounded-full bg-muted/50 object-contain p-0.5"
                              loading="lazy"
                            />
                          ) : (
                            <span className="h-5 w-5 rounded-full bg-muted/50" />
                          )}
                          <p className="text-xs font-medium text-muted-foreground">
                            {gameGroup.gameName}
                          </p>
                        </div>
                        <ul className="flex flex-col divide-y divide-border">
                          {gameGroup.teams.map((team) => (
                            <li key={team.id} className="py-3 first:pt-0 last:pb-0">
                              <Link
                                to={`/teams/${team.id}`}
                                className="flex flex-col gap-2 rounded-lg p-2 -mx-2 transition-colors hover:bg-accent/40 cursor-pointer"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-col gap-1 min-w-0">
                                    <span className="text-sm font-semibold truncate">{team.name}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                        {gameGroup.gameName}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {team.pokemonIds.filter(Boolean).length} / 6
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                    disabled={deletingId === team.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDelete(team.id);
                                    }}
                                  >
                                    {deletingId === team.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>

                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 6 }).map((_, i) => {
                                    const id = team.pokemonIds[i];
                                    return id ? (
                                      <img
                                        key={i}
                                        src={getPokemonImageUrl(id)}
                                        alt={`Slot ${i + 1}`}
                                        className="h-11 w-11 object-contain drop-shadow-sm"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div
                                        key={i}
                                        className="h-11 w-11 rounded-full border border-dashed border-border/40"
                                      />
                                    );
                                  })}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
