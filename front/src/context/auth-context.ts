import { createContext, type ReactNode } from 'react';
import type { AuthUser } from '@/types/auth';

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  mustChangePassword: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export type AuthProviderProps = {
  children: ReactNode;
};
