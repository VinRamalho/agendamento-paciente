import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  changePasswordRequest,
  getMeRequest,
  loginRequest,
} from '@/services/auth';
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '@/services/auth/token-storage';
import type { AuthUser } from '@/types/auth';
import {
  AuthContext,
  type AuthContextValue,
  type AuthProviderProps,
} from './auth-context';

function normalizeUser(user: AuthUser): AuthUser {
  return {
    ...user,
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = getStoredUser();
    return stored ? normalizeUser(stored) : null;
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    void getMeRequest()
      .then((profile) => {
        const normalized = normalizeUser(profile);
        setUser(normalized);
        setStoredUser(normalized);
      })
      .catch(() => {
        clearAuthStorage();
        setUser(null);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    const normalized = normalizeUser(response.user);
    setStoredToken(response.accessToken);
    setStoredUser(normalized);
    setUser(normalized);
    return normalized;
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const response = await changePasswordRequest(
        currentPassword,
        newPassword,
      );
      const normalized = normalizeUser(response.user);
      setStoredToken(response.accessToken);
      setStoredUser(normalized);
      setUser(normalized);
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      mustChangePassword: Boolean(user?.mustChangePassword),
      isAdmin: user?.role === 'ADMIN',
      login,
      changePassword,
      logout,
    }),
    [user, isBootstrapping, login, changePassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
