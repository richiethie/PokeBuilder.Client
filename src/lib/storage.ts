const GAME_KEY = "pokebuilder_game";
const TEAM_KEY = "pokebuilder_team";

/**
 * Safe localStorage wrapper — all reads/writes are wrapped in try/catch
 * so private browsing or storage quota errors never crash the app.
 */
export const storage = {
  getGame(): string | null {
    try {
      return localStorage.getItem(GAME_KEY);
    } catch {
      return null;
    }
  },

  setGame(key: string): void {
    try {
      localStorage.setItem(GAME_KEY, key);
    } catch { /* quota exceeded or private browsing */ }
  },

  clearGame(): void {
    try {
      localStorage.removeItem(GAME_KEY);
    } catch { /* ignore */ }
  },

  /**
   * Returns an array of 6 slots where each slot is a Pokémon ID or null.
   * Slot positions are preserved so the team looks identical after refresh.
   */
  getTeam(): (number | null)[] {
    try {
      const raw = localStorage.getItem(TEAM_KEY);
      if (!raw) return Array(6).fill(null);
      const parsed: unknown = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.length === 6 &&
        parsed.every((v) => v === null || typeof v === "number")
      ) {
        return parsed as (number | null)[];
      }
      return Array(6).fill(null);
    } catch {
      return Array(6).fill(null);
    }
  },

  setTeam(slots: (number | null)[]): void {
    try {
      localStorage.setItem(TEAM_KEY, JSON.stringify(slots));
    } catch { /* ignore */ }
  },
};
