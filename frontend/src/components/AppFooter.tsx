'use client';

import { useLocale } from "@/context/LocaleContext";

export function AppFooter() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-[color:var(--border-muted)] bg-[color:var(--surface)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 text-xs text-muted sm:px-6 lg:max-w-7xl">
        © {new Date().getFullYear()} LMGa Construction Solutions. All rights reserved.
        <span className="hidden sm:inline text-muted">{t("footer_tagline")}</span>
      </div>
    </footer>
  );
}
