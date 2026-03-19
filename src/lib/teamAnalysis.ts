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
 * Computes a simple team rating from 0-100.
 *
 * Factors:
 *  - Type diversity (unique types on team / 12 possible, capped)
 *  - BST average normalized to 600
 *  - Coverage score (how many of 18 types can be hit super-effectively)
 *  - Weakness penalty (types that hit 4+ members)
 */
export function computeTeamRating(team: Pokemon[]): number {
  if (team.length === 0) return 0;

  const uniqueTypes = new Set<PokemonType>(team.flatMap((p) => p.types));
  const typeDiversityScore = Math.min(uniqueTypes.size / 10, 1) * 30;

  const avgBST =
    team.reduce((sum, p) => sum + getTotalBST(p.baseStats), 0) / team.length;
  const bstScore = Math.min(avgBST / 550, 1) * 30;

  const teamTypes = new Set<PokemonType>(team.flatMap((p) => p.types));
  const coveredTypes = ALL_TYPES.filter((defType) =>
    Array.from(teamTypes).some(
      (attType) => (typeChart[attType][defType] ?? 1) > 1
    )
  ).length;
  const coverageScore = (coveredTypes / 18) * 25;

  const weaknesses = computeDefensiveWeaknesses(team);
  const severeWeaknesses = weaknesses.filter(
    (w) => w.affectedPokemon.length >= 3
  ).length;
  const weaknessPenalty = Math.min(severeWeaknesses * 5, 15);

  const raw =
    typeDiversityScore + bstScore + coverageScore - weaknessPenalty;

  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function getRatingLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Decent";
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
