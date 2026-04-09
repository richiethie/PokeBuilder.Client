import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Users, Shield, Trash2, Loader2, Check } from "lucide-react";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { usersService, teamsService, getErrorMessage } from "@/lib/api";
import type { SavedTeam } from "@/lib/api";
import { getPokemonImageUrl } from "@/lib/pokemon";

function getInitials(username: string) {
  return username.replace(/^@/, "").slice(0, 2).toUpperCase();
}

// ── Edit Profile Tab ──────────────────────────────────────────────────────────

function EditProfileTab() {
  const { user, applyAuthResponse } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const USERNAME_REGEX = /^[a-z0-9_.]{3,20}$/;

  function normalizeUsername(raw: string) {
    return raw.toLowerCase().replace(/[^a-z0-9_.]/g, "");
  }

  const hasChanges =
    username !== user?.username || email !== user?.email;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (username && !USERNAME_REGEX.test(username)) {
      setError("Username must be 3–20 characters: letters, numbers, underscores, and dots only.");
      return;
    }
    setSaving(true);
    try {
      const response = await usersService.updateProfile({
        username: username !== user?.username ? username : undefined,
        email: email !== user?.email ? email : undefined,
      });
      applyAuthResponse(response);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save changes."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile Information</CardTitle>
        <CardDescription>Update your username or email address.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-username">Username</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground select-none">
                @
              </span>
              <Input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                className="pl-7"
                maxLength={20}
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={saving || !hasChanges}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : success ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            {!hasChanges && (
              <span className="text-xs text-muted-foreground">No changes</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Change Password Tab ───────────────────────────────────────────────────────

function ChangePasswordTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!current || !next || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await usersService.changePassword({ currentPassword: current, newPassword: next });
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to change password."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Change Password</CardTitle>
        <CardDescription>
          You'll need to enter your current password to set a new one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              disabled={saving}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              disabled={saving}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={saving}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={saving} className="w-fit gap-1.5">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              <>
                <Check className="h-4 w-4" />
                Password Updated
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Saved Teams Tab ───────────────────────────────────────────────────────────

function SavedTeamsTab() {
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    teamsService
      .getAll()
      .then(setTeams)
      .catch((err) => setError(getErrorMessage(err, "Failed to load teams.")))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await teamsService.delete(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete team."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Saved Teams</CardTitle>
        <CardDescription>Teams you've saved across all games.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No saved teams yet</p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              Build a team on the main page and hit Save Team to store it here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {teams.map((team) => (
              <li key={team.id} className="py-3">
                <Link
                  to={`/profile/teams/${team.id}`}
                  className="flex flex-col gap-2 rounded-lg p-2 -mx-2 transition-colors hover:bg-accent/40 cursor-pointer"
                >
                  {/* Header row: name + delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm font-semibold truncate">{team.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {team.gameKey}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {team.pokemonIds.filter(Boolean).length} / 6
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={deletingId === team.id}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(team.id);
                      }}
                    >
                      {deletingId === team.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  {/* Sprite row: all 6 slots */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const id = team.pokemonIds[i];
                      return id ? (
                        <img
                          key={i}
                          src={getPokemonImageUrl(id)}
                          alt={`Slot ${i + 1}`}
                          className="h-11 w-11 object-contain drop-shadow-sm"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          key={i}
                          className="h-11 w-11 rounded-full border border-dashed border-border/40"
                        />
                      );
                    })}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ── Danger Zone ───────────────────────────────────────────────────────────────

function DangerZone() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await usersService.deleteAccount();
      signOut();
      navigate("/");
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all saved teams. This cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account and all saved teams.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Yes, delete my account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ProtectedRoute guarantees user is non-null by the time this renders.
  const currentUser = user as UserType;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 flex flex-col gap-6">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
              {getInitials(currentUser.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-bold">@{currentUser.username}</h1>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Security
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-1.5">
              Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="flex flex-col gap-4 mt-4">
            <EditProfileTab />
          </TabsContent>

          <TabsContent value="security" className="flex flex-col gap-4 mt-4">
            <ChangePasswordTab />
            <DangerZone />
          </TabsContent>

          <TabsContent value="teams" className="flex flex-col gap-4 mt-4">
            <SavedTeamsTab />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
