import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AppHeader } from "@/components/AppHeader";
import { GameSelector } from "@/features/pokedex/GameSelector";
import { PokedexList } from "@/features/pokedex/PokedexList";
import { TeamBuilder } from "@/features/team-builder/TeamBuilder";
import { TeamAnalysisPanel } from "@/features/team-analysis/TeamAnalysisPanel";
import { TeamSheet } from "@/features/team-builder/TeamSheet";
import { PokemonDetailsPage } from "@/pages/PokemonDetailsPage";

function MainPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 pb-24 lg:pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">

          {/* Left — Pokédex browser */}
          <section className="flex flex-col gap-4 lg:flex-1 lg:sticky lg:top-18 lg:max-h-[calc(100vh-5rem)]">
            <GameSelector />
            <PokedexList />
          </section>

          {/* Right — Team & Analysis (desktop only, mobile uses TeamSheet FAB) */}
          <section className="hidden lg:flex flex-col gap-4 lg:w-80 lg:shrink-0">
            <TeamBuilder />
            <TeamAnalysisPanel />
          </section>

        </div>
      </main>

      {/* Floating team button + bottom sheet (mobile only) */}
      <TeamSheet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/:game/:pokemon" element={<PokemonDetailsPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
