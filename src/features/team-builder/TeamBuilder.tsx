import { useState } from "react";
import { Users, Save, Loader2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamSlot } from "./TeamSlot";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { teamsService } from "@/lib/api";
import { getErrorMessage } from "@/lib/api";

interface TeamBuilderProps {
  hideHeader?: boolean;
}

function SaveTeamDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { team, selectedGame, setActiveSavedTeam } = useAppContext();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selectedGame) return;

    setSaving(true);
    setError("");
    try {
      const pokemonIds = team.map((p) => p?.id ?? null);
      const savedTeam = await teamsService.create({
        name: name.trim(),
        gameKey: selectedGame.key,
        pokemonIds,
      });
      // Transition into "editing saved team" mode so the sheet reflects the new state
      setActiveSavedTeam({
        id: savedTeam.id,
        name: savedTeam.name,
        originalName: savedTeam.name,
        originalPokemonIds: savedTeam.pokemonIds,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setName("");
        onClose();
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save team. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setName("");
      setError("");
      setSaved(false);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save Team</DialogTitle>
          <DialogDescription>
            Give your team a name to save it to your profile.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <div className="text-2xl">✓</div>
            <p className="text-sm font-medium">Team saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Fire Red Team"
                autoFocus
                disabled={saving}
                maxLength={100}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TeamBuilder({ hideHeader = false }: TeamBuilderProps) {
  const {
    team, teamPokemon, selectedGame,
    activeSavedTeam, setActiveSavedTeam, isTeamDirty,
  } = useAppContext();
  const { user, openAuthModal } = useAuth();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const hasTeam = teamPokemon.length > 0;

  function handleSaveClick() {
    if (!user) {
      openAuthModal("signin");
    } else {
      setSaveDialogOpen(true);
    }
  }

  async function handleUpdate() {
    if (!activeSavedTeam || !selectedGame) return;
    setUpdating(true);
    setUpdateError("");
    try {
      await teamsService.update(activeSavedTeam.id, {
        name: activeSavedTeam.name,
        gameKey: selectedGame.key,
        pokemonIds: team.map((p) => p?.id ?? null),
      });
      // Reset the dirty-check baseline
      setActiveSavedTeam({
        ...activeSavedTeam,
        originalName: activeSavedTeam.name,
        originalPokemonIds: team.map((p) => p?.id ?? null),
      });
    } catch (err) {
      setUpdateError(getErrorMessage(err, "Failed to update team."));
    } finally {
      setUpdating(false);
    }
  }

  // Determine which action button to show
  function renderActionButton() {
    if (!user) {
      return (
        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => openAuthModal("signin")}>
          <Save className="h-3.5 w-3.5" />
          Sign in to Save
        </Button>
      );
    }

    if (activeSavedTeam) {
      if (isTeamDirty) {
        return (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            disabled={updating || !hasTeam}
            onClick={handleUpdate}
          >
            {updating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Update
          </Button>
        );
      }
      return (
        <Button variant="outline" size="sm" className="w-full gap-1.5" disabled>
          <Check className="h-3.5 w-3.5 text-green-500" />
          Saved
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        disabled={!hasTeam}
        onClick={handleSaveClick}
      >
        <Save className="h-3.5 w-3.5" />
        Save Team
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {activeSavedTeam ? activeSavedTeam.name : "Your Team"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {teamPokemon.length} / 6
          </span>
        </div>
      )}

      {!selectedGame ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          Select a game to start building your team.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {team.map((pokemon, i) => (
              <TeamSlot key={i} index={i} pokemon={pokemon} />
            ))}
          </div>

          {renderActionButton()}

          {updateError && (
            <p className="text-xs text-destructive text-center">{updateError}</p>
          )}
        </>
      )}

      <SaveTeamDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      />
    </div>
  );
}
