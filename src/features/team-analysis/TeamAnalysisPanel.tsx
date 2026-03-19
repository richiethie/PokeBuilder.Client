import { ShieldAlert, Swords, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/context/AppContext";
import { useTeamAnalysis } from "@/hooks/useTeamAnalysis";
import { TYPE_COLORS } from "@/lib/pokemon";
import { cn } from "@/lib/utils";

function multiplierLabel(mult: number): string {
  if (mult === 0) return "Immune";
  if (mult <= 0.5) return "Resists";
  if (mult === 1) return "Neutral";
  if (mult === 2) return "Super";
  return "4×";
}

export function TeamAnalysisPanel() {
  const { team, teamPokemon, selectedGame } = useAppContext();
  const analysis = useTeamAnalysis(team);

  if (!selectedGame || teamPokemon.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4" />
            Team Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-2">
            Add Pokémon to your team to see analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { teamRating, ratingLabel, offensiveCoverage, defensiveWeaknesses } =
    analysis;

  const superEffective = offensiveCoverage.filter((e) => e.multiplier >= 2);
  const notCovered = offensiveCoverage.filter((e) => e.multiplier < 1);
  const severeWeaknesses = defensiveWeaknesses.filter(
    (w) => w.affectedPokemon.length >= 2
  );

  const ratingColor =
    teamRating >= 80
      ? "text-green-600"
      : teamRating >= 50
        ? "text-yellow-600"
        : "text-red-500";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4" />
          Team Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Rating */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Team Rating</span>
            <span className={cn("text-sm font-bold", ratingColor)}>
              {ratingLabel} ({teamRating}/100)
            </span>
          </div>
          <Progress value={teamRating} className="h-2" />
        </div>

        <Separator />

        {/* Offensive Coverage */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Swords className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">Offensive Coverage</span>
          </div>

          {superEffective.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] text-muted-foreground">
                Super effective against:
              </p>
              <div className="flex flex-wrap gap-1">
                {superEffective.map((e) => (
                  <Badge
                    key={e.type}
                    className={cn(
                      "capitalize text-[10px] px-1.5 py-0",
                      TYPE_COLORS[e.type]
                    )}
                    title={multiplierLabel(e.multiplier)}
                  >
                    {e.type}
                    {e.multiplier >= 4 && " ×4"}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {notCovered.length > 0 && (
            <div>
              <p className="mb-1 text-[10px] text-muted-foreground">
                Not covered ({notCovered.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {notCovered.map((e) => (
                  <Badge
                    key={e.type}
                    variant="outline"
                    className="capitalize text-[10px] px-1.5 py-0"
                  >
                    {e.type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Defensive Weaknesses */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">Defensive Weaknesses</span>
          </div>

          {severeWeaknesses.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">
              No shared weaknesses — great coverage!
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {severeWeaknesses.slice(0, 6).map((w) => (
                <div key={w.type} className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "capitalize text-[10px] px-1.5 py-0 shrink-0 w-16 justify-center",
                      TYPE_COLORS[w.type]
                    )}
                  >
                    {w.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {w.affectedPokemon.join(", ")}
                  </span>
                </div>
              ))}
              {severeWeaknesses.length > 6 && (
                <p className="text-[10px] text-muted-foreground">
                  +{severeWeaknesses.length - 6} more…
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
