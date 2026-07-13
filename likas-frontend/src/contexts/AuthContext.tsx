import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserAccount } from '../types';
import { authService } from '../services';

interface AuthContextType {
  user: UserAccount | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserAccount>) => void;
  /** Re-fetches the current user from GET /me and syncs sessionStorage. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('likas_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem('likas_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const account = await authService.login(email, password);
    sessionStorage.setItem('likas_user', JSON.stringify(account));
    setUser(account);
  };

  const logout = () => {
    sessionStorage.removeItem('likas_user');
    sessionStorage.removeItem('likas_token');
    setUser(null);
  };

  const updateUser = (updates: Partial<UserAccount>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    sessionStorage.setItem('likas_user', JSON.stringify(updated));
    setUser(updated);
  };

  const refreshUser = async () => {
    try {
      const fresh = await authService.getCurrentUserFromServer();
      if (fresh) {
        sessionStorage.setItem('likas_user', JSON.stringify(fresh));
        setUser(fresh);
      }
    } catch {
      // If the re-fetch fails, leave the existing user in place
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
