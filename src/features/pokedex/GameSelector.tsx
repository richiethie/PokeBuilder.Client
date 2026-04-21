import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";

const AVAILABLE_GAMES = new Set(["firered", "heartgold", "emerald", "blackwhite", "platinum"]);

export function GameSelector() {
  const { games, selectedGame, selectGame } = useAppContext();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Select Game
      </label>
      <Select
        value={selectedGame?.key ?? ""}
        onValueChange={(val) => selectGame(val)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a Pokémon game…" />
        </SelectTrigger>
        <SelectContent>
          {games.map((game) => {
            const available = AVAILABLE_GAMES.has(game.key);
            return (
              <SelectItem
                key={game.key}
                value={game.key}
                disabled={!available}
                className={!available ? "opacity-40" : ""}
              >
                {game.name}
                {!available && " (coming soon)"}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
