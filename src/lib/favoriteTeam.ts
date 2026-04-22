const FAVORITE_TEAM_STORAGE_PREFIX = "pb.favorite-team.v1";
const EMPTY_FAVORITE_TEAM: (number | null)[] = Array(6).fill(null);

function getFavoriteTeamStorageKey(userId: string) {
  return `${FAVORITE_TEAM_STORAGE_PREFIX}:${userId}`;
}

export function getFavoriteTeam(userId: string): (number | null)[] {
  try {
    const raw = localStorage.getItem(getFavoriteTeamStorageKey(userId));
    if (!raw) return [...EMPTY_FAVORITE_TEAM];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 6) return [...EMPTY_FAVORITE_TEAM];
    return parsed.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));
  } catch {
    return [...EMPTY_FAVORITE_TEAM];
  }
}

export function setFavoriteTeam(userId: string, teamIds: (number | null)[]) {
  const normalized = Array.from({ length: 6 }, (_, i) => {
    const value = teamIds[i];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  });
  localStorage.setItem(getFavoriteTeamStorageKey(userId), JSON.stringify(normalized));
}
