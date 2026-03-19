import { useMemo } from "react";
import type { Pokemon, TeamAnalysis } from "@/types";
import { analyzeTeam } from "@/lib/teamAnalysis";

export function useTeamAnalysis(team: (Pokemon | null)[]): TeamAnalysis {
  const activePokemon = team.filter((p): p is Pokemon => p !== null);

  return useMemo(() => analyzeTeam(activePokemon), [activePokemon]);
}
