"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getToken, clearToken } from "./api";

interface AuthContextValue { isAuthenticated: boolean; loading: boolean; logout: () => void; refresh: () => void; }
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const check = () => { setIsAuthenticated(!!getToken()); setLoading(false); };
  useEffect(check, []);
  const logout = () => { clearToken(); setIsAuthenticated(false); };
  return <AuthContext.Provider value={{ isAuthenticated, loading, logout, refresh: check }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}