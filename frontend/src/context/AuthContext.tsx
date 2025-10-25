"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import {
  loginUser,
  refreshAccessToken,
  registerUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api";
import type { User } from "@/lib/types";

type Tokens = {
  access: string;
  refresh: string;
};

type AuthState = {
  user: User | null;
  tokens: Tokens | null;
  loading: boolean;
};

type AuthContextValue = {
  user: User | null;
  tokens: Tokens | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const storageKey = "tz-materials-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type DecodedToken = {
  exp?: number;
};

function readStoredAuth(): AuthState {
  if (typeof window === "undefined") {
    return { user: null, tokens: null, loading: true };
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return { user: null, tokens: null, loading: false };
    }
    const parsed = JSON.parse(raw) as { user?: User | null; tokens?: Tokens | null };
    return {
      user: parsed.user ?? null,
      tokens: parsed.tokens ?? null,
      loading: false,
    };
  } catch {
    return { user: null, tokens: null, loading: false };
  }
}

function getTokenExpiryMs(token: string | undefined): number | null {
  if (!token) return null;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return null;
    return decoded.exp * 1000;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    tokens: null,
    loading: true,
  }));
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    setState((prev) => ({ ...prev, ...readStoredAuth(), loading: false }));
  }, []);

  const persist = useCallback((user: User | null, tokens: Tokens | null) => {
    if (typeof window !== "undefined") {
      if (tokens) {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ user, tokens }),
        );
      } else {
        window.localStorage.removeItem(storageKey);
      }
    }
    setState({ user, tokens, loading: false });
  }, []);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await loginUser(payload);
    persist(data.user, data.tokens);
  }, [persist]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await registerUser(payload);
    persist(data.user, data.tokens);
  }, [persist]);

  const logout = useCallback(() => {
    clearRefreshTimer();
    persist(null, null);
  }, [clearRefreshTimer, persist]);

  const refreshAccess = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const refreshToken = state.tokens?.refresh;
      if (!refreshToken) {
        logout();
        return;
      }
      const data = await refreshAccessToken(refreshToken);
      persist(state.user, { access: data.access, refresh: refreshToken });
    } catch (error) {
      console.error("Failed to refresh access token", error);
      logout();
    } finally {
      refreshingRef.current = false;
    }
  }, [state.tokens?.refresh, state.user, persist, logout]);

  useEffect(() => {
    clearRefreshTimer();
    const accessToken = state.tokens?.access;
    if (!accessToken) {
      return;
    }
    const expiryMs = getTokenExpiryMs(accessToken);
    if (!expiryMs) {
      // If exp missing we cannot refresh reliably; logout for safety.
      logout();
      return;
    }
    const now = Date.now();
    const refreshLeadMs = 30_000;
    const timeoutMs = expiryMs - now - refreshLeadMs;
    if (timeoutMs <= 0) {
      void refreshAccess();
      return;
    }
    refreshTimerRef.current = setTimeout(() => {
      void refreshAccess();
    }, timeoutMs);

    return () => {
      clearRefreshTimer();
    };
  }, [state.tokens?.access, clearRefreshTimer, refreshAccess, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      tokens: state.tokens,
      loading: state.loading,
      isAuthenticated: Boolean(state.tokens?.access),
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
