"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { locales, messages, type Locale } from "@/i18n/dictionary";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  availableLocales: Locale[];
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);
const STORAGE_KEY = "lmga-locale";
const DEFAULT_LOCALE: Locale = "en";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && locales.includes(stored)) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>) => {
      const dictionary = messages[locale] ?? messages[DEFAULT_LOCALE];
      let value = dictionary[key] ?? messages[DEFAULT_LOCALE][key] ?? key;
      if (replacements) {
        Object.entries(replacements).forEach(([token, val]) => {
          value = value.replace(`{${token}}`, String(val));
        });
      }
      return value;
    },
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      availableLocales: locales,
    }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
