import {
  Select,
  SelectGroup,
  SelectContent,
  SelectLabel,
  SelectSeparator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FULL_POKEDEX_KEY, useAppContext } from "@/context/AppContext";
import type { Game } from "@/types";
import { getPokemonImageUrl } from "@/lib/pokemon";

const AVAILABLE_GAMES = new Set([
  "redblueyellow",
  "firered",
  "goldsilvercrystal",
  "heartgold",
  "rubysapphire",
  "emerald",
  "diamondpearl",
  "platinum",
  "blackwhite",
  "black2white2",
  "xy",
  "omegarubyalphasapphire",
  "sunmoon",
  "ultrasunmoon",
  "swordshield",
  "brilliantdiamondshiningpearl",
  "scarletviolet",
]);

const GAME_ICON_POKEMON_ID: Record<string, number> = {
  redblueyellow: 25, // Pikachu
  firered: 6, // Charizard
  goldsilvercrystal: 249, // Lugia
  heartgold: 250, // Ho-Oh
  rubysapphire: 383, // Groudon
  emerald: 384, // Rayquaza
  diamondpearl: 483, // Dialga
  platinum: 487, // Giratina
  blackwhite: 643, // Reshiram
  black2white2: 646, // Kyurem
  xy: 716, // Xerneas
  omegarubyalphasapphire: 382, // Kyogre
  sunmoon: 791, // Solgaleo
  ultrasunmoon: 800, // Necrozma
  swordshield: 888, // Zacian
  brilliantdiamondshiningpearl: 484, // Palkia
  scarletviolet: 1007, // Koraidon
};

const GAME_ORDER_BY_GENERATION: Record<number, string[]> = {
  3: ["rubysapphire", "emerald", "omegarubyalphasapphire"],
  4: ["diamondpearl", "platinum", "brilliantdiamondshiningpearl"],
  5: ["blackwhite", "black2white2"],
  7: ["sunmoon", "ultrasunmoon"],
};

function getGenerationLabel(generation: number): string {
  return `Generation ${generation}`;
}

function sortGamesWithinGeneration(generation: number, games: Game[]): Game[] {
  const preferred = GAME_ORDER_BY_GENERATION[generation];
  if (!preferred) return games;

  const rank = new Map(preferred.map((key, index) => [key, index]));
  return [...games].sort((a, b) => {
    const aRank = rank.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const bRank = rank.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.name.localeCompare(b.name);
  });
}

function GameOptionContent({ game }: { game: Game }) {
  const iconPokemonId = GAME_ICON_POKEMON_ID[game.key];

  return (
    <span className="flex items-center gap-2">
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
      <span>{game.name}</span>
    </span>
  );
}

export function GameSelector() {
  const { games, selectedGame, selectGame } = useAppContext();
  const generationOrder = [...new Set(games.map((game) => game.generation))].sort(
    (a, b) => a - b
  );

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
        <SelectContent position="popper" align="start">
          <SelectGroup>
            <SelectLabel>Special</SelectLabel>
            <SelectItem value={FULL_POKEDEX_KEY}>Full Pokédex</SelectItem>
            <SelectSeparator />
          </SelectGroup>
          {generationOrder.map((generation, generationIndex) => (
            <SelectGroup key={generation}>
              <SelectLabel>{getGenerationLabel(generation)}</SelectLabel>
              {sortGamesWithinGeneration(
                generation,
                games.filter((game) => game.generation === generation)
              )
                .map((game) => {
                  const available = AVAILABLE_GAMES.has(game.key);
                  return (
                    <SelectItem
                      key={game.key}
                      value={game.key}
                      disabled={!available}
                      className={!available ? "opacity-40" : ""}
                    >
                      <GameOptionContent game={game} />
                      {!available && " (coming soon)"}
                    </SelectItem>
                  );
                })}
              {generationIndex < generationOrder.length - 1 && <SelectSeparator />}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
