import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Trash2, Loader2, Check, Star, Pencil, X } from "lucide-react";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/context/AuthContext";
import { usersService, getErrorMessage } from "@/lib/api";
import { FULL_POKEDEX_KEY } from "@/context/AppContext";
import { getPokemonImageUrl } from "@/lib/pokemon";
import { getFavoriteTeam } from "@/lib/favoriteTeam";

function getInitials(username: string) {
  return username.replace(/^@/, "").slice(0, 2).toUpperCase();
}

function FavoriteTeamCard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const favoriteIds = getFavoriteTeam(userId);
  const hasFavorite = favoriteIds.some((id) => id !== null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base">Favorite Team</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              navigate("/", {
                state: {
                  editFavoriteTeam: {
                    pokemonIds: favoriteIds,
                    gameKey: FULL_POKEDEX_KEY,
                  },
                },
              })
            }
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasFavorite ? (
          <p className="text-sm text-muted-foreground">
            No favorite team set yet. Click Edit to build one from the full Pokédex.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {favoriteIds.map((pokemonId, i) =>
              pokemonId ? (
              <div key={i} className="flex flex-col items-center rounded-md border bg-card p-2">
                <img
                  src={getPokemonImageUrl(pokemonId)}
                  alt={`Favorite slot ${i + 1}`}
                  className="h-10 w-10 object-contain"
                />
                <span className="mt-1 w-full truncate text-center text-[11px]">
                  #{pokemonId}
                </span>
              </div>
            ) : (
              <div
                key={i}
                className="flex h-[76px] flex-col items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Empty
              </div>
            )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
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

        <FavoriteTeamCard userId={currentUser.id} />

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Profile Settings</h2>
          <EditProfileTab />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground">Security</h2>
          </div>
          <ChangePasswordTab />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Danger Zone</h2>
          <DangerZone />
        </section>

      </div>
    </div>
  );
}
