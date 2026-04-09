import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPokemonImageUrl, TYPE_COLORS } from "@/lib/pokemon";
import { useAppContext } from "@/context/AppContext";
import type { Pokemon } from "@/types";
import { cn } from "@/lib/utils";

interface TeamSlotProps {
  index: number;
  pokemon: Pokemon | null;
}

export function TeamSlot({ index, pokemon }: TeamSlotProps) {
  const { removeFromTeam } = useAppContext();

  if (!pokemon) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/30 p-2 min-h-24">
        <div className="h-10 w-10 rounded-full border border-dashed border-muted-foreground/30 bg-muted/50" />
        <span className="text-[10px] text-muted-foreground">Empty</span>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col items-center gap-1 rounded-lg border bg-card p-2 min-h-24 transition-colors hover:border-destructive/40">
      <button
        onClick={() => removeFromTeam(index)}
        title={`Remove ${pokemon.name}`}
        className={cn(
          "absolute right-0.5 top-0.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full",
          "bg-muted/80 text-muted-foreground transition-colors",
          "hover:bg-destructive hover:text-destructive-foreground",
          // Always visible on touch screens; fade in on pointer devices
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
        )}
        aria-label={`Remove ${pokemon.name}`}
      >
        <X className="h-2.5 w-2.5" />
      </button>

      <img
        src={getPokemonImageUrl(pokemon.id)}
        alt={pokemon.name}
        className="h-10 w-10 object-contain drop-shadow-sm"
        loading="lazy"
      />

      <span className="w-full truncate text-center text-[10px] font-medium leading-tight">
        {pokemon.name}
      </span>

      <div className="flex flex-wrap justify-center gap-0.5">
        {pokemon.types.map((type) => (
          <Badge
            key={type}
            className={cn(
              "capitalize px-1 py-0 text-[8px] leading-tight",
              TYPE_COLORS[type]
            )}
          >
            {type}
          </Badge>
        ))}
      </div>
    </div>
  );
}
