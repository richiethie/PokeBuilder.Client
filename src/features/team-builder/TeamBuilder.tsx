import { Users } from "lucide-react";
import { TeamSlot } from "./TeamSlot";
import { useAppContext } from "@/context/AppContext";

interface TeamBuilderProps {
  hideHeader?: boolean;
}

export function TeamBuilder({ hideHeader = false }: TeamBuilderProps) {
  const { team, teamPokemon, selectedGame } = useAppContext();

  return (
    <div className="flex flex-col gap-3">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Your Team</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {teamPokemon.length} / 6
          </span>
        </div>
      )}

      {!selectedGame ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          Select a game to start building your team.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {team.map((pokemon, i) => (
            <TeamSlot key={i} index={i} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}
