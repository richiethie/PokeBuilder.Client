export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  baseStats: BaseStats;
}

export interface Game {
  key: string;
  name: string;
  generation: number;
}

export type TypeEffectiveness = Record<PokemonType, Record<PokemonType, number>>;

export interface TeamSlot {
  pokemon: Pokemon | null;
}

export interface TypeCoverageEntry {
  type: PokemonType;
  multiplier: number;
}

export interface WeaknessEntry {
  type: PokemonType;
  multiplier: number;
  affectedPokemon: string[];
}

export interface TeamAnalysis {
  offensiveCoverage: TypeCoverageEntry[];
  defensiveWeaknesses: WeaknessEntry[];
  teamRating: number;
  ratingLabel: string;
}

export type FilterType = PokemonType | "all";
