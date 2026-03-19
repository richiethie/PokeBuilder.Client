import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { TYPE_COLORS, ALL_TYPES } from "@/lib/pokemon";
import type { Pokemon, PokemonType, DefensiveChart } from "@/types";
import typeChartData from "@/data/type-chart.json";
import { cn } from "@/lib/utils";

const typeChart = typeChartData as Record<PokemonType, Record<PokemonType, number>>;

function computeDefensiveChart(pokemon: Pokemon): DefensiveChart {
  const chart = {} as DefensiveChart;
  for (const attackingType of ALL_TYPES) {
    chart[attackingType] = pokemon.types.reduce(
      (mult, defType) => mult * (typeChart[attackingType][defType] ?? 1),
      1
    );
  }
  return chart;
}

function multiplierDisplay(mult: number): string {
  if (mult === 0) return "0×";
  if (mult === 0.25) return "¼×";
  if (mult === 0.5) return "½×";
  if (mult === 2) return "2×";
  if (mult === 4) return "4×";
  return `${mult}×`;
}

interface GroupedEntry {
  type: PokemonType;
  mult: number;
}

interface TypeMatchupGridProps {
  pokemon: Pokemon;
}

export function TypeMatchupGrid({ pokemon }: TypeMatchupGridProps) {
  const chart = useMemo(() => computeDefensiveChart(pokemon), [pokemon]);

  const weaknesses = ALL_TYPES.filter((t) => chart[t] > 1).sort(
    (a, b) => chart[b] - chart[a]
  );
  const resistances = ALL_TYPES.filter((t) => chart[t] < 1 && chart[t] > 0).sort(
    (a, b) => chart[a] - chart[b]
  );
  const immunities = ALL_TYPES.filter((t) => chart[t] === 0);

  function renderGroup(label: string, types: PokemonType[], entries: GroupedEntry[]) {
    if (types.length === 0) return null;
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex flex-wrap gap-1">
          {types.map((t) => {
            const entry = entries.find((e) => e.type === t)!;
            return (
              <div key={t} className="flex flex-col items-center gap-0.5">
                <Badge
                  className={cn(
                    "capitalize text-[10px] px-1.5 py-0",
                    TYPE_COLORS[t]
                  )}
                >
                  {t}
                </Badge>
                <span className="text-[9px] font-semibold text-muted-foreground">
                  {multiplierDisplay(entry.mult)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const allEntries: GroupedEntry[] = ALL_TYPES.map((t) => ({
    type: t,
    mult: chart[t],
  }));

  return (
    <div className="flex flex-col gap-3">
      {renderGroup("Weak to", weaknesses, allEntries)}
      {renderGroup("Resists", resistances, allEntries)}
      {renderGroup("Immune to", immunities, allEntries)}
      {weaknesses.length === 0 && resistances.length === 0 && immunities.length === 0 && (
        <p className="text-xs text-muted-foreground">No notable matchups.</p>
      )}
    </div>
  );
}
