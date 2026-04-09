import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User, AuthTab } from "@/types";
import {
  setAuthToken,
  getAuthToken,
  registerUnauthorizedHandler,
  authService,
} from "@/lib/api";
import type { AuthResponse } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  isAuthLoading: boolean;
  isAuthHydrating: boolean;
  openAuthModal: (tab?: AuthTab) => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalTab: AuthTab;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  /** Call after a successful profile update to refresh the in-memory user + token. */
  applyAuthResponse: (response: AuthResponse) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthHydrating, setIsAuthHydrating] = useState(() => !!getAuthToken());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthTab>("signin");

  const openAuthModal = useCallback((tab: AuthTab = "signin") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  // On mount, if a token exists in localStorage, validate it and restore the user.
  useEffect(() => {
    if (!getAuthToken()) {
      setIsAuthHydrating(false);
      return;
    }
    authService.me()
      .then((apiUser) => setUser(apiUser))
      .catch(() => setAuthToken(null))
      .finally(() => setIsAuthHydrating(false));
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setAuthToken(null);
      setUser(null);
      openAuthModal("signin");
    });
  }, [openAuthModal]);

  const signIn = useCallback(async (emailOrUsername: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { token, user: apiUser } = await authService.login({ emailOrUsername, password });
      setAuthToken(token);
      setUser(apiUser);
      setAuthModalOpen(false);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const signUp = useCallback(async (username: string, email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const { token, user: apiUser } = await authService.register({ username, email, password });
      setAuthToken(token);
      setUser(apiUser);
      setAuthModalOpen(false);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    setAuthToken(response.token);
    setUser(response.user);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthLoading,
    isAuthHydrating,
    openAuthModal,
    closeAuthModal,
    authModalOpen,
    authModalTab,
    signIn,
    signUp,
    signOut,
    applyAuthResponse,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
