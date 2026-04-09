import { useState, useRef, useEffect } from "react";
import { Users, ChevronDown, Eraser } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamBuilder } from "./TeamBuilder";
import { TeamAnalysisPanel } from "@/features/team-analysis/TeamAnalysisPanel";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function TeamSheet() {
  const {
    teamPokemon,
    activeSavedTeam,
    setActiveSavedTeamName,
    clearTeam,
    teamSheetOpen,
    setTeamSheetOpen,
  } = useAppContext();

  const count = teamPokemon.length;

  // Inline name editing
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync draft when the active team changes
  useEffect(() => {
    setEditingName(false);
    setDraftName(activeSavedTeam?.name ?? "");
  }, [activeSavedTeam?.id]);

  function startEditing() {
    setDraftName(activeSavedTeam?.name ?? "");
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  }

  function commitName() {
    const trimmed = draftName.trim();
    if (trimmed && activeSavedTeam) {
      setActiveSavedTeamName(trimmed);
    }
    setEditingName(false);
  }

  return (
    <>
      {/* Floating Action Button — mobile only */}
      <button
        onClick={() => setTeamSheetOpen(true)}
        className={cn(
          "lg:hidden fixed bottom-5 right-5 z-50 flex cursor-pointer items-center gap-2",
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
      <Sheet open={teamSheetOpen} onOpenChange={setTeamSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          style={{ height: "85dvh" }}
          className="rounded-t-2xl p-0 gap-0 flex flex-col"
        >
          {/* Sticky header */}
          <div className="flex-none flex items-center justify-between px-4 py-4">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold min-w-0 flex-1 mr-2">
              <Users className="h-4 w-4 shrink-0" />

              {activeSavedTeam ? (
                editingName ? (
                  <input
                    ref={nameInputRef}
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    maxLength={100}
                    className="w-full bg-transparent border-b border-primary outline-none text-base font-semibold leading-tight"
                  />
                ) : (
                  <button
                    onClick={startEditing}
                    title="Click to rename"
                    className="cursor-pointer hover:opacity-70 transition-opacity text-left leading-tight truncate"
                  >
                    {activeSavedTeam.name}
                  </button>
                )
              ) : (
                <>
                  Your Team
                </>
              )}

              {!editingName && (
                <span className="text-sm font-normal text-muted-foreground shrink-0">
                  ({count}/6)
                </span>
              )}
            </SheetTitle>

            {/* Clear team */}
            <button
              onClick={clearTeam}
              title={activeSavedTeam ? "Clear selected team" : "Clear team"}
              className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </button>

            {/* Close — down caret */}
            <SheetClose className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ml-0.5">
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </div>

          {/* Scrollable content */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-4 px-4 pb-6">
              <TeamBuilder hideHeader />
              <TeamAnalysisPanel />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
