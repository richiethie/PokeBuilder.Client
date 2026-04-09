import { apiClient } from "./client";

// ── Domain types ──────────────────────────────────────────────────────────────

/** A team as it comes back from the API. */
export interface SavedTeam {
  id: string;
  name: string;
  gameKey: string;
  /** 6-slot array — null entries represent empty slots. */
  pokemonIds: (number | null)[];
  createdAt: string;
  updatedAt: string;
}

// ── Request shapes ────────────────────────────────────────────────────────────

export interface SaveTeamRequest {
  name: string;
  gameKey: string;
  pokemonIds: (number | null)[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const teamsService = {
  /**
   * GET /teams
   * Returns all teams belonging to the authenticated user.
   */
  getAll: (): Promise<SavedTeam[]> =>
    apiClient.get<SavedTeam[]>("/teams").then((r) => r.data),

  /**
   * GET /teams/:id
   * Returns a single team by ID.
   */
  getById: (id: string): Promise<SavedTeam> =>
    apiClient.get<SavedTeam>(`/teams/${id}`).then((r) => r.data),

  /**
   * POST /teams
   * Creates a new saved team.
   */
  create: (data: SaveTeamRequest): Promise<SavedTeam> =>
    apiClient.post<SavedTeam>("/teams", data).then((r) => r.data),

  /**
   * PUT /teams/:id
   * Replaces a team entirely (name, game, and all slots).
   */
  update: (id: string, data: SaveTeamRequest): Promise<SavedTeam> =>
    apiClient.put<SavedTeam>(`/teams/${id}`, data).then((r) => r.data),

  /**
   * DELETE /teams/:id
   * Permanently removes a saved team.
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/teams/${id}`).then(() => undefined),
};
