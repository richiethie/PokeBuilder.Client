import { Search, Users, BarChart3, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameSelector } from "@/features/pokedex/GameSelector";
import { useAuth } from "@/context/AuthContext";

const FEATURED_TYPES = [
  { label: "Fire", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { label: "Water", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Grass", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  { label: "Electric", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { label: "Psychic", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  { label: "Dragon", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { label: "Ghost", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "Steel", color: "bg-slate-400/20 text-slate-300 border-slate-400/30" },
  { label: "Dark", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
];

const FEATURES = [
  {
    icon: Search,
    title: "Browse the Pokédex",
    description: "Search and filter any game's full roster by name or type.",
  },
  {
    icon: Users,
    title: "Build Your Team",
    description: "Fill all 6 slots and plan the perfect party for your run.",
  },
  {
    icon: BarChart3,
    title: "Analyze Coverage",
    description: "Instantly see type matchups, weaknesses, and a team rating.",
  },
];

export function WelcomeHero() {
  const { user, openAuthModal } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12">

      {/* Decorative type badges */}
      <div className="mb-10 flex flex-wrap justify-center gap-2 opacity-60">
        {FEATURED_TYPES.map((t) => (
          <Badge
            key={t.label}
            variant="outline"
            className={`text-xs font-semibold tracking-wide border ${t.color}`}
          >
            {t.label}
          </Badge>
        ))}
      </div>

      {/* Title block */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Poké<span className="text-primary">Builder</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg max-w-md mx-auto">
          Build smarter teams for every Pokémon journey. Plan, analyse, and perfect your party.
        </p>
      </div>

      {/* Feature grid */}
      <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3 w-full max-w-2xl">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-2 rounded-lg border bg-card/50 p-4 text-center backdrop-blur-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      {/* Game selector CTA */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <ChevronDown className="h-3 w-3" />
          <span>Pick a game to get started</span>
          <ChevronDown className="h-3 w-3" />
        </div>

        <GameSelector />

        {/* Auth nudge — only shown to guests */}
        {!user && (
          <p className="text-center text-xs text-muted-foreground mt-1">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="cursor-pointer text-primary underline-offset-2 hover:underline"
            >
              Sign in
            </button>{" "}
            to access your saved teams.
          </p>
        )}

        {/* Sign up nudge */}
        {!user && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => openAuthModal("signup")}
          >
            Create a free account →
          </Button>
        )}
      </div>
    </div>
  );
}
