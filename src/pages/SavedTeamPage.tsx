import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Loader2, ShieldAlert, Swords, Star, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { teamsService, gamesService } from "@/lib/api";
import type { SavedTeam } from "@/lib/api";
import { useTeamAnalysis } from "@/hooks/useTeamAnalysis";
import { useAppContext } from "@/context/AppContext";
import { getPokemonImageUrl, TYPE_COLORS } from "@/lib/pokemon";
import { cn } from "@/lib/utils";
import type { Pokemon } from "@/types";

// ── Read-only slot card ───────────────────────────────────────────────────────

function ReadOnlySlot({ pokemon }: { pokemon: Pokemon | null }) {
  if (!pokemon) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/30 p-2 min-h-24">
        <div className="h-10 w-10 rounded-full border border-dashed border-muted-foreground/30 bg-muted/50" />
        <span className="text-[10px] text-muted-foreground">Empty</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-2 min-h-24">
      <img
        src={getPokemonImageUrl(pokemon.id)}
        alt={pokemon.name}
        className="h-10 w-10 object-contain drop-shadow-sm"
        loading="lazy"
      />
      <span className="w-full truncate text-center text-[10px] font-medium leading-tight">
        {pokemon.name}
      </span>
      <div className="flex flex-wrap justify-center gap-0.5">
        {pokemon.types.map((type) => (
          <Badge
            key={type}
            className={cn("capitalize px-1 py-0 text-[8px] leading-tight", TYPE_COLORS[type])}
          >
            {type}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// ── Inline analysis display ───────────────────────────────────────────────────

function multiplierLabel(mult: number): string {
  if (mult === 0) return "Immune";
  if (mult <= 0.5) return "Resists";
  if (mult === 2) return "Super";
  return "4×";
}

function AnalysisSection({ slots }: { slots: (Pokemon | null)[] }) {
  const analysis = useTeamAnalysis(slots);
  const { teamRating, ratingLabel, offensiveCoverage, defensiveWeaknesses } = analysis;

  const superEffective = offensiveCoverage.filter((e) => e.multiplier >= 2);
  const notCovered = offensiveCoverage.filter((e) => e.multiplier < 1);
  const severeWeaknesses = defensiveWeaknesses.filter((w) => w.affectedPokemon.length >= 2);

  const ratingColor =
    teamRating >= 80 ? "text-green-600" : teamRating >= 50 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="flex flex-col gap-4">
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
        {superEffective.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] text-muted-foreground">Super effective against:</p>
            <div className="flex flex-wrap gap-1">
              {superEffective.map((e) => (
                <Badge
                  key={e.type}
                  className={cn("capitalize text-[10px] px-1.5 py-0", TYPE_COLORS[e.type])}
                  title={multiplierLabel(e.multiplier)}
                >
                  {e.type}
                  {e.multiplier >= 4 && " ×4"}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {notCovered.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] text-muted-foreground">
              Not covered ({notCovered.length}):
            </p>
            <div className="flex flex-wrap gap-1">
              {notCovered.map((e) => (
                <Badge key={e.type} variant="outline" className="capitalize text-[10px] px-1.5 py-0">
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
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SavedTeamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { games } = useAppContext();

  const [savedTeam, setSavedTeam] = useState<SavedTeam | null>(null);
  const [slots, setSlots] = useState<(Pokemon | null)[]>(Array(6).fill(null));
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    teamsService
      .getById(id)
      .then((team) => {
        setSavedTeam(team);
        return gamesService.getDex(team.gameKey).then((dex) => {
          setSlots(
            team.pokemonIds.map((pid) =>
              pid === null ? null : (dex.find((p) => p.id === pid) ?? null)
            )
          );
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!savedTeam) return;
    setDeleting(true);
    try {
      await teamsService.delete(savedTeam.id);
      navigate("/profile", { replace: true });
    } catch {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !savedTeam) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Team not found.</p>
      </div>
    );
  }

  const gameName = games.find((g) => g.key === savedTeam.gameKey)?.name ?? savedTeam.gameKey;
  const filledCount = savedTeam.pokemonIds.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-xl px-4 py-6 flex flex-col gap-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>

        {/* Team header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-xl font-bold truncate">{savedTeam.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-2">
                {gameName}
              </Badge>
              <span className="text-xs text-muted-foreground">{filledCount} / 6 Pokémon</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              title="Edit team"
              onClick={() =>
                navigate("/", {
                  state: {
                    editTeam: {
                      id: savedTeam.id,
                      name: savedTeam.name,
                      gameKey: savedTeam.gameKey,
                      pokemonIds: savedTeam.pokemonIds,
                    },
                  },
                })
              }
            >
              <Pencil className="h-4 w-4" />
            </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this team?</AlertDialogTitle>
                <AlertDialogDescription>
                  "{savedTeam.name}" will be permanently deleted. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </div>

        {/* Pokémon grid */}
        <div className="grid grid-cols-3 gap-2">
          {slots.map((pokemon, i) => (
            <ReadOnlySlot key={i} pokemon={pokemon} />
          ))}
        </div>

        <Separator />

        {/* Analysis */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Team Analysis</h2>
          </div>
          {filledCount === 0 ? (
            <p className="text-xs text-muted-foreground">Add Pokémon to see analysis.</p>
          ) : (
            <AnalysisSection slots={slots} />
          )}
        </div>

      </div>
    </div>
  );
}
