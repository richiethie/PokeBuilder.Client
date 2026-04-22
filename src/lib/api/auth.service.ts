import { apiClient } from "./client";
import type { User } from "@/types";

// ── Request / Response shapes ─────────────────────────────────────────────────
// These should mirror your C# API DTOs exactly.

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** Shape returned by /auth/login and /auth/register */
export interface AuthResponse {
  token: string;
  refreshToken?: string | null;
  user: User;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * POST /auth/login
   * Returns a JWT + user profile on success.
   */
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  /**
   * POST /auth/register
   * Creates a new account and returns the same JWT + user profile shape.
   */
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  /**
   * POST /auth/refresh
   * Exchanges a refresh token for a new access token + rotated refresh token.
   */
  refresh: (data: RefreshRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>("/auth/refresh", data).then((r) => r.data),

  /**
   * GET /auth/me
   * Validates the current token and returns the authenticated user.
   * Useful for re-hydrating the session on page load without storing
   * the user object in localStorage.
   */
  me: (): Promise<User> =>
    apiClient.get<User>("/auth/me").then((r) => r.data),

  /**
   * POST /auth/logout
   * Optional — call if the API invalidates tokens server-side.
   * If the API is stateless JWT-only, this endpoint may not exist.
   */
  logout: (data: LogoutRequest): Promise<void> =>
    apiClient.post("/auth/logout", data).then(() => undefined),
};
