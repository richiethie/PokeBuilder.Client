import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••"}
        className="pr-10"
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SignInForm() {
  const { signIn, isAuthLoading } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!emailOrUsername || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await signIn(emailOrUsername, password);
    } catch (err) {
      setError(getErrorMessage(err, "Invalid credentials."));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-identifier">Email or Username</Label>
        <Input
          id="signin-identifier"
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          placeholder="you@example.com or @ash.ketchum"
          autoComplete="username"
          disabled={isAuthLoading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <button
            type="button"
          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          >
            Forgot password?
          </button>
        </div>
        <PasswordInput
          id="signin-password"
          value={password}
          onChange={setPassword}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isAuthLoading}>
        {isAuthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Sign In"
        )}
      </Button>

      {/* -- Google OAuth (not yet configured) --
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" disabled={isAuthLoading}>
        Continue with Google
      </Button>
      -- */}
    </form>
  );
}

const USERNAME_REGEX = /^[a-z0-9_.]{3,20}$/;

function normalizeUsername(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9_.]/g, "");
}

function SignUpForm() {
  const { signUp, isAuthLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(normalizeUsername(e.target.value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setError("Username must be 3–20 characters: letters, numbers, underscores, and dots only.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await signUp(username, email, password);
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong. Please try again."));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-username">Username</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground select-none">
            @
          </span>
          <Input
            id="signup-username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="ash_ketchum"
            autoComplete="username"
            disabled={isAuthLoading}
            className="pl-7"
            maxLength={20}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          3–20 characters · letters, numbers, underscores, dots
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isAuthLoading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <PasswordInput
          id="signup-confirm"
          value={confirm}
          onChange={setConfirm}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isAuthLoading}>
        {isAuthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Create Account"
        )}
      </Button>

      {/* -- Google OAuth (not yet configured) --
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" disabled={isAuthLoading}>
        Continue with Google
      </Button>
      -- */}
    </form>
  );
}

export function AuthModal() {
  const { authModalOpen, closeAuthModal, authModalTab } = useAuth();

  return (
    <Dialog open={authModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to PokéBuilder</DialogTitle>
          <DialogDescription>
            Sign in or create an account to save your teams across devices.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={authModalTab} key={authModalTab} className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
