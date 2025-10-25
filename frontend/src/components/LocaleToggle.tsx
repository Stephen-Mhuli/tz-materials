"use client";

import { useLocale } from "@/context/LocaleContext";

const localeLabels: Record<string, string> = {
  en: "EN",
  sw: "SW",
};

export function LocaleToggle({ condensed = false }: { condensed?: boolean }) {
  const { locale, setLocale, availableLocales, t } = useLocale();

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-2 py-1 ${condensed ? "w-full justify-between" : ""}`}
    >
      <span className="sr-only">{t("locale_toggle_label")}</span>
      {availableLocales.map((item) => {
        const active = locale === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              active
                ? "bg-[color:var(--brand)] text-white shadow-soft"
                : "text-muted hover:bg-brand-soft hover:text-primary"
            } ${condensed ? "flex-1 text-center" : ""}`}
          >
            {localeLabels[item] ?? item.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
