import type {
  Pokemon,
  PokemonType,
  TypeEffectiveness,
  TeamAnalysis,
  TypeCoverageEntry,
  WeaknessEntry,
} from "@/types";
import { ALL_TYPES, getTotalBST } from "@/lib/pokemon";
import typeChartData from "@/data/type-chart.json";

const typeChart = typeChartData as TypeEffectiveness;

/**
 * Returns the combined defensive multiplier for an attacking type vs a defending Pokémon.
 * Accounts for dual types.
 */
function getDefensiveMultiplier(
  attackingType: PokemonType,
  defender: Pokemon
): number {
  return defender.types.reduce((mult, defType) => {
    return mult * (typeChart[attackingType][defType] ?? 1);
  }, 1);
}

/**
 * Computes the best offensive multiplier each attacking type achieves
 * against any of the 18 types, given the team's move coverage
 * (simplified: each mon can attack with both its own types).
 */
export function computeOffensiveCoverage(
  team: Pokemon[]
): TypeCoverageEntry[] {
  if (team.length === 0) return [];

  const teamTypes = new Set<PokemonType>(team.flatMap((p) => p.types));

  return ALL_TYPES.map((defendingType) => {
    const bestMultiplier = Math.max(
      ...Array.from(teamTypes).map(
        (attackingType) => typeChart[attackingType][defendingType] ?? 1
      )
    );
    return { type: defendingType, multiplier: bestMultiplier };
  }).sort((a, b) => b.multiplier - a.multiplier);
}

/**
 * Computes all attacking types that hit at least one team member for super-effective (>1x).
 */
export function computeDefensiveWeaknesses(
  team: Pokemon[]
): WeaknessEntry[] {
  if (team.length === 0) return [];

  const weaknesses: WeaknessEntry[] = [];

  for (const attackingType of ALL_TYPES) {
    const affected: { name: string; multiplier: number }[] = [];

    for (const pokemon of team) {
      const mult = getDefensiveMultiplier(attackingType, pokemon);
      if (mult > 1) {
        affected.push({ name: pokemon.name, multiplier: mult });
      }
    }

    if (affected.length > 0) {
      const maxMult = Math.max(...affected.map((a) => a.multiplier));
      weaknesses.push({
        type: attackingType,
        multiplier: maxMult,
        affectedPokemon: affected.map((a) => a.name),
      });
    }
  }

  return weaknesses.sort((a, b) => b.affectedPokemon.length - a.affectedPokemon.length);
}

/**
 * Computes a team rating from 0-100.
 *
 * Factors (sum to 100 before penalty):
 *  - Type diversity: unique types on the team (6 types = full marks)
 *  - BST average: normalized to 480 (easily reachable by mid-tier Pokémon)
 *  - Offensive coverage: how many of 18 types can be hit super-effectively
 *  - Defensive balance: reward types the team resists, not just penalize weaknesses
 *  - Weakness penalty: shared weaknesses (3+ members hit)
 */
export function computeTeamRating(team: Pokemon[]): number {
  if (team.length === 0) return 0;

  // ── Type diversity (0–20) ───────────────────────────────────────────────
  // 6 Pokémon with dual types can have at most 12 unique types;
  // 6 is a realistic "good" number for a balanced team.
  const uniqueTypes = new Set<PokemonType>(team.flatMap((p) => p.types));
  const typeDiversityScore = Math.min(uniqueTypes.size / 6, 1) * 20;

  // ── BST average (0–20) ─────────────────────────────────────────────────
  // 480 is the average for fully-evolved non-legendary Pokémon.
  const avgBST =
    team.reduce((sum, p) => sum + getTotalBST(p.baseStats), 0) / team.length;
  const bstScore = Math.min(avgBST / 480, 1) * 20;

  // ── Offensive coverage (0–30) ──────────────────────────────────────────
  const teamTypes = new Set<PokemonType>(team.flatMap((p) => p.types));
  const coveredTypes = ALL_TYPES.filter((defType) =>
    Array.from(teamTypes).some(
      (attType) => (typeChart[attType][defType] ?? 1) > 1
    )
  ).length;
  const coverageScore = (coveredTypes / 18) * 30;

  // ── Defensive balance (0–20) ───────────────────────────────────────────
  // For each attacking type, check if at least one team member resists it (<1x).
  const resistedTypes = ALL_TYPES.filter((attType) =>
    team.some((p) => getDefensiveMultiplier(attType, p) < 1)
  ).length;
  const defenseScore = (resistedTypes / 18) * 20;

  // ── Weakness penalty (0–10) ────────────────────────────────────────────
  const weaknesses = computeDefensiveWeaknesses(team);
  const severeWeaknesses = weaknesses.filter(
    (w) => w.affectedPokemon.length >= 3
  ).length;
  const weaknessPenalty = Math.min(severeWeaknesses * 3, 10);

  const raw =
    typeDiversityScore + bstScore + coverageScore + defenseScore - weaknessPenalty;

  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function getRatingLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 55) return "Decent";
  if (score >= 35) return "Needs Work";
  return "Weak";
}

export function analyzeTeam(team: Pokemon[]): TeamAnalysis {
  const rating = computeTeamRating(team);
  return {
    offensiveCoverage: computeOffensiveCoverage(team),
    defensiveWeaknesses: computeDefensiveWeaknesses(team),
    teamRating: rating,
    ratingLabel: getRatingLabel(rating),
  };
}
