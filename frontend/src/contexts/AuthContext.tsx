import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiFetch, setToken, removeToken, getToken } from "@/lib/apiClient";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing token on mount, or token from Google OAuth redirect (#token=...)
  useEffect(() => {
    const hash = window.location.hash;
    const tokenMatch = hash && hash.match(/token=([^&]+)/);
    if (tokenMatch) {
      try {
        const t = decodeURIComponent(tokenMatch[1]);
        setToken(t);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        // ignore bad token
      }
    }

    const token = getToken();
    if (token) {
      apiFetch<{ user: User }>("/api/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
