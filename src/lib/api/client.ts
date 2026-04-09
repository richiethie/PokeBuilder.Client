import axios, { type AxiosError } from "axios";

// ── Base instance ────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Token management ─────────────────────────────────────────────────────────
//
// The JWT lives in module-level memory — not localStorage — to avoid XSS
// exposure. AuthContext calls setAuthToken() immediately after login and clears
// it on sign-out. All subsequent requests pick it up via the request interceptor.

const TOKEN_KEY = "pb_token";

let authToken: string | null = localStorage.getItem(TOKEN_KEY);

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// ── Optional 401 callback ────────────────────────────────────────────────────
//
// AuthContext registers this callback so the interceptor can open the login
// modal when the API returns 401 (e.g. expired token). Avoids a direct import
// dependency between the API layer and React context.

type UnauthorizedCallback = () => void;
let onUnauthorized: UnauthorizedCallback | null = null;

export function registerUnauthorizedHandler(cb: UnauthorizedCallback): void {
  onUnauthorized = cb;
}

// ── Request interceptor — attach Bearer token ────────────────────────────────

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// ── Response interceptor — global error handling ─────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear it and notify the app
      authToken = null;
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

// ── Helper: extract a readable message from an Axios error ───────────────────

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(error)) {
    // Try to read a `message` field from the API response body
    const data = error.response?.data as Record<string, unknown> | undefined;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
