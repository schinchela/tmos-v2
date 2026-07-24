import {
  createContext,
  useContext,
} from "react";

import type {
  AuthenticatedUser,
  LoginRequest,
} from "./auth.types";

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  login: (
    credentials: LoginRequest,
  ) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}
