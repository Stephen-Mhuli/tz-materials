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

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolved: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "lmga-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [resolved, setResolved] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    const preferred = getPreferredTheme();
    setTheme(preferred);
    setResolved(true);
    initialised.current = true;
  }, []);

  useEffect(() => {
    if (!resolved) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [resolved, theme]);

  const handleSetTheme = useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
    setResolved(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    setResolved(true);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolved,
      setTheme: handleSetTheme,
      toggleTheme,
    }),
    [handleSetTheme, resolved, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
