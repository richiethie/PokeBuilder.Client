import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";

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
          {games.map((game) => (
            <SelectItem key={game.key} value={game.key}>
              {game.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
