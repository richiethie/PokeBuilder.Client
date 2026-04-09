import { apiClient } from "./client";
import type { User } from "@/types";
import type { AuthResponse } from "./auth.service";

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const usersService = {
  /**
   * PUT /users/me
   * Updates username and/or email. Returns a fresh token + updated user.
   */
  updateProfile: (data: UpdateProfileRequest): Promise<AuthResponse> =>
    apiClient.put<AuthResponse>("/users/me", data).then((r) => r.data),

  /**
   * PUT /users/me/password
   * Changes the authenticated user's password.
   */
  changePassword: (data: ChangePasswordRequest): Promise<void> =>
    apiClient.put("/users/me/password", data).then(() => undefined),

  /**
   * DELETE /users/me
   * Permanently deletes the account and all associated data.
   */
  deleteAccount: (): Promise<void> =>
    apiClient.delete("/users/me").then(() => undefined),
};
