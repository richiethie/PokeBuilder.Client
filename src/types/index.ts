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

/** Shape of what we write to localStorage. */
export interface PersistedState {
  gameKey: string | null;
  /** 6-slot array — each element is a Pokémon ID or null to preserve slot positions. */
  teamSlots: (number | null)[];
}

/** Per-type defensive multiplier for a single Pokémon. */
export type DefensiveChart = Record<PokemonType, number>;

/** A single base stat with display metadata. */
export interface StatEntry {
  key: keyof BaseStats;
  label: string;
  value: number;
  /** 0–1 fill ratio, normalised against the practical max (255). */
  fill: number;
  color: string;
}

// ── Game-specific detail types ────────────────────────────────────────────────

export type ObtainMethod =
  | "starter"
  | "wild"
  | "evolve"
  | "trade"
  | "gift"
  | "fossil"
  | "safari"
  | "legendary"
  | "mythical";

export interface LevelUpMove {
  level: number;
  name: string;
}

export interface GamePokemonMoves {
  levelUp: LevelUpMove[];
  tm: string[];
  tutor: string[];
}

export interface GamePokemonDetails {
  obtainMethods: ObtainMethod[];
  locations: string[];
  notes?: string;
  moves: GamePokemonMoves;
}

/** Full game detail file shape — keyed by Pokémon slug (e.g. "charizard"). */
export type GameDetailData = Record<string, GamePokemonDetails>;
