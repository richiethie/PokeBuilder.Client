import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { teamsService } from "@/lib/api";
import type { SavedTeam } from "@/lib/api";
import { getPokemonImageUrl } from "@/lib/pokemon";
import { cn } from "@/lib/utils";
import type { ActiveSavedTeam } from "@/context/AppContext";

export function SavedTeamsStrip() {
  const {
    selectedGame,
    loadTeamFromIds,
    setActiveSavedTeam,
    setTeamSheetOpen,
    activeSavedTeam,
  } = useAppContext();
  const { user } = useAuth();

  const [teams, setTeams] = useState<SavedTeam[]>([]);

  useEffect(() => {
    if (!user || !selectedGame) {
      setTeams([]);
      return;
    }
    teamsService
      .getAll()
      .then((all) => setTeams(all.filter((t) => t.gameKey === selectedGame.key)))
      .catch(() => setTeams([]));
  }, [user, selectedGame?.key]);

  if (!user || teams.length === 0) return null;

  function handleLoad(team: SavedTeam) {
    loadTeamFromIds(team.pokemonIds);
    const next: ActiveSavedTeam = {
      id: team.id,
      name: team.name,
      originalName: team.name,
      originalPokemonIds: team.pokemonIds,
    };
    setActiveSavedTeam(next);
    setTeamSheetOpen(true);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        Saved Teams
      </span>

      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {teams.map((team) => {
          const isActive = activeSavedTeam?.id === team.id;
          return (
            <button
              key={team.id}
              onClick={() => handleLoad(team)}
              className={cn(
                "flex flex-col gap-1.5 rounded-lg border bg-card px-2.5 py-2 shrink-0 text-left",
                "cursor-pointer transition-colors",
                isActive
                  ? "border-primary/60 bg-primary/5"
                  : "hover:border-border/80 hover:bg-accent/30"
              )}
            >
              <span className="text-[11px] font-semibold max-w-28 truncate leading-none">
                {team.name}
              </span>
              <div className="flex items-center">
                {Array.from({ length: 6 }).map((_, i) => {
                  const id = team.pokemonIds[i];
                  return id ? (
                    <img
                      key={i}
                      src={getPokemonImageUrl(id)}
                      alt=""
                      className="h-7 w-7 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      key={i}
                      className="h-7 w-7 flex items-center justify-center"
                    >
                      <div className="h-3 w-3 rounded-full border border-dashed border-border/40" />
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
