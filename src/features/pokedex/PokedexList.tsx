import { ScrollArea } from "@/components/ui/scroll-area";
import { PokemonCard } from "./PokemonCard";
import { useAppContext } from "@/context/AppContext";
import { SearchBar } from "./SearchBar";

export function PokedexList() {
  const { selectedGame, filteredPokemon, dexPokemon } = useAppContext();

  if (!selectedGame) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Select a game to load its Pokédex
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 min-h-0">
      <SearchBar />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {filteredPokemon.length} of {dexPokemon.length} Pokémon
        </span>
      </div>

      <ScrollArea className="flex-1 rounded-lg border">
        <div className="flex flex-col gap-1.5 p-2">
          {filteredPokemon.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No Pokémon match your search.
            </p>
          ) : (
            filteredPokemon.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
