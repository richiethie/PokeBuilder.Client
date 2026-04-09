export { apiClient, setAuthToken, getAuthToken, registerUnauthorizedHandler, getErrorMessage } from "./client";
export { authService } from "./auth.service";
export { teamsService } from "./teams.service";
export { usersService } from "./users.service";
export { gamesService } from "./games.service";
export type { LoginRequest, RegisterRequest, AuthResponse } from "./auth.service";
export type { SavedTeam, SaveTeamRequest } from "./teams.service";
export type { UpdateProfileRequest, ChangePasswordRequest } from "./users.service";
export type { PokemonDetailResponse, PokemonDetailGameInfo } from "./games.service";
