import type { Pokemon, PokemonType } from "@/types";

export function getPokemonImageUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: "bg-stone-400 text-white",
  fire: "bg-orange-500 text-white",
  water: "bg-blue-500 text-white",
  electric: "bg-yellow-400 text-black",
  grass: "bg-green-500 text-white",
  ice: "bg-cyan-300 text-black",
  fighting: "bg-red-700 text-white",
  poison: "bg-purple-500 text-white",
  ground: "bg-amber-600 text-white",
  flying: "bg-indigo-400 text-white",
  psychic: "bg-pink-500 text-white",
  bug: "bg-lime-500 text-white",
  rock: "bg-yellow-700 text-white",
  ghost: "bg-violet-700 text-white",
  dragon: "bg-blue-700 text-white",
  dark: "bg-stone-700 text-white",
  steel: "bg-slate-400 text-white",
  fairy: "bg-pink-300 text-black",
};

export const ALL_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export function formatStatName(key: string): string {
  const map: Record<string, string> = {
    hp: "HP",
    attack: "Atk",
    defense: "Def",
    spAttack: "Sp.Atk",
    spDefense: "Sp.Def",
    speed: "Spd",
  };
  return map[key] ?? key;
}

/**
 * Converts a Pokémon name to a URL-safe slug.
 * "Mr. Mime" → "mr-mime", "Farfetch'd" → "farfetch-d", "Ho-Oh" → "ho-oh"
 */
export function toPokemonSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Finds a Pokémon in the roster by matching its slug against the URL param. */
export function pokemonFromSlug(
  slug: string,
  roster: Pokemon[]
): Pokemon | undefined {
  return roster.find((p) => toPokemonSlug(p.name) === slug);
}

export function getTotalBST(baseStats: {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}): number {
  return (
    baseStats.hp +
    baseStats.attack +
    baseStats.defense +
    baseStats.spAttack +
    baseStats.spDefense +
    baseStats.speed
  );
}
