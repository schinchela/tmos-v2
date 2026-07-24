import { apiRequest } from "../../lib/api/apiClient";
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
} from "./auth.types";

export function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    "/api/auth/login",
    {
      method: "POST",
      authenticated: false,
      body: JSON.stringify(request),
    },
  );
}

export function getCurrentUser(): Promise<AuthenticatedUser> {
  return apiRequest<AuthenticatedUser>(
    "/api/auth/me",
  );
}

export function logout(): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>(
    "/api/auth/logout",
    {
      method: "POST",
    },
  );
}
