import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserAccount } from '../types';
import { authService } from '../services';

interface AuthContextType {
  user: UserAccount | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<UserAccount>) => void;
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
    setUser(null);
  };

  const updateUser = (updates: Partial<UserAccount>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    sessionStorage.setItem('likas_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
