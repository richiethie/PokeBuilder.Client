import { Sword } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
        <Sword className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold tracking-tight">PokéBuilder</span>
      </div>
    </header>
  );
}
