import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

import { ApiClientError } from "../../lib/api/apiClient";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./authSession";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "./auth.service";
import { AuthContext } from "./authContextValue";
import type { AuthContextValue } from "./authContextValue";
import type {
  AuthenticatedUser,
  LoginRequest,
} from "./auth.types";

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] =
    useState<AuthenticatedUser | null>(null);

  const [
    isRestoringSession,
    setIsRestoringSession,
  ] = useState(true);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = getAccessToken();

      if (!token) {
        if (active) {
          setUser(null);
          setIsRestoringSession(false);
        }

        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        if (
          error instanceof ApiClientError &&
          error.status !== 401
        ) {
          console.error(
            "TMOS session restoration failed.",
            error,
          );
        }

        clearAccessToken();

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsRestoringSession(false);
        }
      }
    }

    const timer = window.setTimeout(() => {
      void restoreSession();
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };

    window.addEventListener(
      "tmos:unauthorized",
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        "tmos:unauthorized",
        handleUnauthorized,
      );
    };
  }, [clearSession]);

  const login = useCallback(
    async (
      credentials: LoginRequest,
    ): Promise<AuthenticatedUser> => {
      const response =
        await loginRequest(credentials);

      setAccessToken(response.token);
      setUser(response.user);

      return response.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      if (getAccessToken()) {
        await logoutRequest();
      }
    } catch (error) {
      console.error(
        "TMOS backend logout failed.",
        error,
      );
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isRestoringSession,
      login,
      logout,
    }),
    [
      user,
      isRestoringSession,
      login,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
