"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, resolved } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !resolved) {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] text-[color:var(--text-muted)] opacity-60">
        —
      </span>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] text-sm font-semibold text-[color:var(--text-primary)] shadow-sm transition hover:scale-105 hover:border-[color:var(--brand-strong)] hover:text-[color:var(--brand-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-strong)]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
