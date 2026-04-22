import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useRef, useEffect } from "react";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/features/auth/AuthModal";
import { AppHeader } from "@/components/AppHeader";
import { GameSelector } from "@/features/pokedex/GameSelector";
import { PokedexList } from "@/features/pokedex/PokedexList";
import { SavedTeamsStrip } from "@/features/pokedex/SavedTeamsStrip";
import { TeamBuilder } from "@/features/team-builder/TeamBuilder";
import { TeamAnalysisPanel } from "@/features/team-analysis/TeamAnalysisPanel";
import { TeamSheet } from "@/features/team-builder/TeamSheet";
import { WelcomeHero } from "@/features/welcome/WelcomeHero";
import { PokemonDetailsPage } from "@/pages/PokemonDetailsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SavedTeamPage } from "@/pages/SavedTeamPage";
import { HelpFeedbackPage } from "@/pages/HelpFeedbackPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// ── Main page ─────────────────────────────────────────────────────────────────

interface EditTeamState {
  gameKey: string;
  pokemonIds: (number | null)[];
  id: string;
  name: string;
}

function MainPage() {
  const { selectedGame, isHydrating, selectGame, setActiveSavedTeam, setTeamSheetOpen } = useAppContext();
  const location = useLocation();
  const editHandled = useRef(false);

  // When navigating here from a saved-team edit button, hydrate the team builder
  useEffect(() => {
    if (editHandled.current || isHydrating) return;
    const editTeam = (location.state as { editTeam?: EditTeamState } | null)?.editTeam;
    if (editTeam?.gameKey && Array.isArray(editTeam.pokemonIds) && editTeam.id) {
      editHandled.current = true;
      window.history.replaceState({}, document.title);
      void (async () => {
        await selectGame(editTeam.gameKey, false, editTeam.pokemonIds);
        setActiveSavedTeam({
          id: editTeam.id,
          name: editTeam.name,
          originalName: editTeam.name,
          originalPokemonIds: editTeam.pokemonIds,
        });
        setTeamSheetOpen(true);
      })();
    }
  }, [isHydrating, location.state, selectGame, setActiveSavedTeam, setTeamSheetOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />

      <main className="flex-1">
        {!selectedGame ? (
          <WelcomeHero />
        ) : (
          <div className="mx-auto w-full max-w-5xl px-4 py-4 pb-24 lg:pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">

              {/* Left — Pokédex browser */}
              <section className="flex flex-col gap-4 lg:flex-1 lg:sticky lg:top-18 lg:max-h-[calc(100vh-5rem)]">
                <GameSelector />
                <SavedTeamsStrip />
                <PokedexList />
              </section>

              {/* Right — Team & Analysis (desktop only) */}
              <section className="hidden lg:flex flex-col gap-4 lg:w-80 lg:shrink-0 lg:sticky lg:top-18 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
                <TeamBuilder />
                <TeamAnalysisPanel />
              </section>

            </div>
          </div>
        )}
      </main>

      {/* Mobile FAB + sheet (only useful when a game is loaded) */}
      {selectedGame && <TeamSheet />}
    </div>
  );
}

function SplashDismissOnHydration() {
  const { isHydrating } = useAppContext();
  const { isAuthHydrating } = useAuth();
  const loading = isHydrating || isAuthHydrating;

  useEffect(() => {
    if (loading) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const splash = document.getElementById("app-splash");
        if (splash) {
          splash.style.transition = "opacity 400ms ease";
          splash.style.opacity = "0";
          setTimeout(() => splash.remove(), 400);
        }
      });
    });
  }, [loading]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <SplashDismissOnHydration />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/teams/:id" element={<ProtectedRoute><SavedTeamPage /></ProtectedRoute>} />
            <Route path="/help-feedback" element={<ProtectedRoute><HelpFeedbackPage /></ProtectedRoute>} />
            <Route path="/:game/:pokemon" element={<PokemonDetailsPage />} />
          </Routes>
          {/* Auth modal lives at root so it can be opened from anywhere */}
          <AuthModal />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
