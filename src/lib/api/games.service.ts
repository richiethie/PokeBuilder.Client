import { apiClient } from "./client";
import type { Game, Pokemon } from "@/types";

// ── Response shapes (mirror backend DTOs) ─────────────────────────────────────

export interface PokemonDetailGameInfo {
  obtainMethods: string[];
  locations: string[];
  notes?: string;
  moves: {
    levelUp: { level: number; name: string }[];
    tm: string[];
    tutor: string[];
  };
}

export interface PokemonDetailResponse extends Pokemon {
  /** Null when the DB has no game-specific data for this Pokémon yet. */
  gameInfo: PokemonDetailGameInfo | null;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const gamesService = {
  /** GET /api/games — all games ordered by generation. */
  getGames: (): Promise<Game[]> =>
    apiClient.get<Game[]>("/games").then((r) => r.data),

  /** GET /api/games/{key}/pokemon — ordered Pokédex list for a game. */
  getDex: (gameKey: string): Promise<Pokemon[]> =>
    apiClient.get<Pokemon[]>(`/games/${gameKey}/pokemon`).then((r) => r.data),

  /** GET /api/games/{key}/pokemon/{slug} — full detail for one Pokémon. */
  getPokemonDetail: (
    gameKey: string,
    slug: string
  ): Promise<PokemonDetailResponse> =>
    apiClient
      .get<PokemonDetailResponse>(`/games/${gameKey}/pokemon/${slug}`)
      .then((r) => r.data),
};
