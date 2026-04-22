import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Plus, X,
  MapPin, Zap, Gift, RefreshCw, Leaf, ArrowLeftRight,
  BookOpen, TreePine, Star, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatBar } from "@/features/pokemon-details/StatBar";
import { TypeMatchupGrid } from "@/features/pokemon-details/TypeMatchupGrid";
import { useAppContext } from "@/context/AppContext";
import { gamesService } from "@/lib/api";
import type { PokemonDetailResponse, PokemonDetailGameInfo } from "@/lib/api";
import {
  getPokemonImageUrl,
  TYPE_COLORS,
  formatStatName,
} from "@/lib/pokemon";
import { cn } from "@/lib/utils";
import type { ObtainMethod, StatEntry } from "@/types";

const STAT_MAX = 255;
const STAT_COLORS: Record<string, string> = {
  hp:        "#4ade80",
  attack:    "#f87171",
  defense:   "#60a5fa",
  spAttack:  "#c084fc",
  spDefense: "#7dd3fc",
  speed:     "#fbbf24",
};

const OBTAIN_META: Record<ObtainMethod, { label: string; Icon: React.ElementType; color: string }> = {
  starter:   { label: "Starter",    Icon: Star,          color: "text-yellow-400" },
  wild:      { label: "Wild",       Icon: Leaf,          color: "text-green-400"  },
  evolve:    { label: "Evolution",  Icon: RefreshCw,     color: "text-blue-400"   },
  trade:     { label: "Trade",      Icon: ArrowLeftRight,color: "text-purple-400" },
  gift:      { label: "Gift",       Icon: Gift,          color: "text-pink-400"   },
  fossil:    { label: "Fossil",     Icon: BookOpen,      color: "text-amber-400"  },
  safari:    { label: "Safari",     Icon: TreePine,      color: "text-lime-400"   },
  legendary: { label: "Legendary", Icon: Zap,           color: "text-orange-400" },
  mythical:  { label: "Mythical",  Icon: Sparkles,      color: "text-rose-400"   },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function NotFoundPage({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-4xl">😕</p>
      <p className="text-lg font-semibold">{message}</p>
      <Button asChild variant="outline">
        <Link to="/">← Back to team builder</Link>
      </Button>
    </div>
  );
}

function AcquisitionSection({ details }: { details: PokemonDetailGameInfo }) {
  const methods = details.obtainMethods.filter(
    (method): method is ObtainMethod => method in OBTAIN_META
  );

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">How to Get</h2>

      {/* Method badges */}
      <div className="flex flex-wrap gap-2">
        {methods.map((method) => {
          const { label, Icon, color } = OBTAIN_META[method];
          return (
            <span
              key={method}
              className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium"
            >
              <Icon className={cn("h-3.5 w-3.5", color)} />
              {label}
            </span>
          );
        })}
      </div>

      {/* Locations */}
      <div className="flex flex-col gap-1.5">
        {details.locations.map((loc, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>{loc}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      {details.notes && (
        <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {details.notes}
        </p>
      )}
    </section>
  );
}

function MovesSection({ details }: { details: PokemonDetailGameInfo }) {
  const { levelUp, tm, tutor } = details.moves;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">Moves</h2>

      <Tabs defaultValue="levelup">
        <TabsList className="w-full">
          <TabsTrigger value="levelup" className="flex-1 text-xs">
            Level Up {levelUp.length > 0 && `(${levelUp.length})`}
          </TabsTrigger>
          <TabsTrigger value="tm" className="flex-1 text-xs">
            TM / HM {tm.length > 0 && `(${tm.length})`}
          </TabsTrigger>
          {tutor.length > 0 && (
            <TabsTrigger value="tutor" className="flex-1 text-xs">
              Tutor ({tutor.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="levelup" className="mt-3">
          {levelUp.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              Does not learn moves by leveling up.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-[3.5rem_1fr] bg-muted/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Level</span>
                <span>Move</span>
              </div>
              {levelUp.map((move, i) => (
                <div
                  key={i}
                  className={cn(
                    "grid grid-cols-[3.5rem_1fr] px-3 py-2 text-sm",
                    i % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {move.level === 1 ? "—" : move.level}
                  </span>
                  <span className="font-medium">{move.name}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tm" className="mt-3">
          {tm.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No TM/HM compatibility.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {tm.map((name) => (
                <Badge key={name} variant="secondary" className="text-xs font-normal">
                  {name}
                </Badge>
              ))}
            </div>
          )}
        </TabsContent>

        {tutor.length > 0 && (
          <TabsContent value="tutor" className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {tutor.map((name) => (
                <Badge key={name} variant="secondary" className="text-xs font-normal">
                  {name}
                </Badge>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function PokemonDetailsPage() {
  const { game: gameParam, pokemon: pokemonParam } = useParams<{
    game: string;
    pokemon: string;
  }>();
  const navigate = useNavigate();
  const { games, addToTeam, removeFromTeam, isOnTeam, team } = useAppContext();

  const [detail, setDetail] = useState<PokemonDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!gameParam || !pokemonParam) return;
    setLoadingDetail(true);
    setNotFound(false);
    gamesService
      .getPokemonDetail(gameParam, pokemonParam)
      .then(setDetail)
      .catch(() => setNotFound(true))
      .finally(() => setLoadingDetail(false));
  }, [gameParam, pokemonParam]);

  // Use the game name from context (games loads async, falls back gracefully)
  const game = games.find((g) => g.key === gameParam);

  if (notFound)
    return <NotFoundPage message={`Pokémon "${pokemonParam}" not found in ${gameParam}.`} />;

  if (loadingDetail || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const pokemon = detail;
  const details = detail.gameInfo;

  const onTeam = isOnTeam(pokemon.id);
  const teamFull = team.every((s) => s !== null);
  const teamSlotIndex = team.findIndex((p) => p?.id === pokemon.id);

  const stats: StatEntry[] = (
    Object.entries(pokemon.baseStats) as [
      keyof typeof pokemon.baseStats,
      number,
    ][]
  ).map(([key, value]) => ({
    key,
    label: formatStatName(key),
    value,
    fill: value / STAT_MAX,
    color: STAT_COLORS[key] ?? "#94a3b8",
  }));

  const bst = stats.reduce((s, e) => s + e.value, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{pokemon.name}</p>
          <p className="text-xs text-muted-foreground">{game?.name ?? gameParam}</p>
        </div>
        {onTeam ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => removeFromTeam(teamSlotIndex)}
            className="shrink-0"
          >
            <X className="h-3.5 w-3.5 mr-1" />Remove
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            disabled={teamFull}
            onClick={() => addToTeam(pokemon)}
            className="shrink-0"
          >
            {teamFull ? "Team full" : <><Plus className="h-3.5 w-3.5 mr-1" />Add</>}
          </Button>
        )}
      </header>

      <main className="mx-auto w-full max-w-xl px-4 py-6 flex flex-col gap-6">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={getPokemonImageUrl(pokemon.id)}
            alt={pokemon.name}
            className="h-40 w-40 object-contain drop-shadow-xl"
          />
          <div className="flex flex-col items-center gap-1.5">
            {pokemon.dexNumber !== undefined && pokemon.dexNumber !== pokemon.id ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Regional #{String(pokemon.dexNumber).padStart(3, "0")}</span>
                <span className="opacity-40">·</span>
                <span>National #{String(pokemon.id).padStart(3, "0")}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                #{String(pokemon.dexNumber ?? pokemon.id).padStart(3, "0")}
              </span>
            )}
            <h1 className="text-2xl font-bold">{pokemon.name}</h1>
            <div className="flex gap-2">
              {pokemon.types.map((type) => (
                <Badge
                  key={type}
                  className={cn("capitalize px-3 py-0.5 text-sm", TYPE_COLORS[type])}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Base Stats */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Base Stats</h2>
            <span className="text-xs text-muted-foreground">
              BST <span className="font-semibold text-foreground">{bst}</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {stats.map((stat) => (
              <StatBar key={stat.key} stat={stat} />
            ))}
          </div>
        </section>

        <Separator />

        {/* Type Matchups */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Type Matchups</h2>
          <TypeMatchupGrid pokemon={pokemon} />
        </section>

        <Separator />

        {/* Game-specific data */}
        {details ? (
          <>
            <AcquisitionSection details={details} />
            <Separator />
            <MovesSection details={details} />
          </>
        ) : (
          <div className="rounded-lg border border-dashed px-4 py-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No game-specific data available for {pokemon.name} in {game?.name ?? gameParam} yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
