import { Plus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPokemonImageUrl, TYPE_COLORS, toPokemonSlug } from "@/lib/pokemon";
import { useAppContext } from "@/context/AppContext";
import type { Pokemon } from "@/types";
import { cn } from "@/lib/utils";

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const navigate = useNavigate();
  const { addToTeam, isOnTeam, team, selectedGame } = useAppContext();

  const onTeam = isOnTeam(pokemon.id);
  const teamFull = team.every((slot) => slot !== null);
  const disabled = onTeam || teamFull;

  function handleCardClick() {
    if (selectedGame) {
      navigate(`/${selectedGame.key}/${toPokemonSlug(pokemon.name)}`);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-2 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        onTeam
          ? "border-primary/40 bg-primary/5"
          : "hover:border-border/80 hover:bg-accent/30"
      )}
    >
      <div className="h-14 w-14 shrink-0">
        <img
          src={getPokemonImageUrl(pokemon.id)}
          alt={pokemon.name}
          className="h-full w-full object-contain drop-shadow-sm"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-muted-foreground">
            #{String(pokemon.id).padStart(3, "0")}
          </span>
          <span className="truncate text-sm font-semibold">{pokemon.name}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {pokemon.types.map((type) => (
            <Badge
              key={type}
              className={cn("capitalize text-[10px] px-1.5 py-0", TYPE_COLORS[type])}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Add button — stopPropagation so it doesn't also navigate */}
      <Button
        size="icon"
        variant={onTeam ? "secondary" : "default"}
        className="h-8 w-8 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          addToTeam(pokemon);
        }}
        disabled={disabled}
        title={
          onTeam ? "Already on team" : teamFull ? "Team is full" : `Add ${pokemon.name}`
        }
      >
        {onTeam ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </Button>
    </div>
  );
}
