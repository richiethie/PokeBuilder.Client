import { useState } from "react";
import { Users, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { TeamBuilder } from "./TeamBuilder";
import { TeamAnalysisPanel } from "@/features/team-analysis/TeamAnalysisPanel";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function TeamSheet() {
  const [open, setOpen] = useState(false);
  const { teamPokemon } = useAppContext();
  const count = teamPokemon.length;

  return (
    <>
      {/* Floating Action Button — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "lg:hidden fixed bottom-5 right-5 z-50 flex items-center gap-2",
          "rounded-full shadow-lg border border-border/60",
          "bg-primary text-primary-foreground",
          "px-4 py-3 text-sm font-semibold",
          "transition-all active:scale-95"
        )}
        aria-label="Open team"
      >
        <Users className="h-4 w-4 shrink-0" />
        <span>Team</span>
        {/* Slot pip indicators */}
        <div className="flex gap-0.5 ml-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i < count
                  ? "bg-primary-foreground"
                  : "bg-primary-foreground/25"
              )}
            />
          ))}
        </div>
      </button>

      {/* Bottom Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="h-[85dvh] rounded-t-2xl px-4 pb-6 flex flex-col gap-0 overflow-hidden"
        >
          {/* Custom header row — title and close button share the same flex baseline */}
          <div className="flex items-center justify-between py-4">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4" />
              Your Team
              <span className="text-sm font-normal text-muted-foreground">
                ({count}/6)
              </span>
            </SheetTitle>
            <SheetClose className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-2">
            <TeamBuilder hideHeader />
            <TeamAnalysisPanel />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
