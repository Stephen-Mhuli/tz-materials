"use client";

import { useLocale } from "@/context/LocaleContext";

export function ProductsError({ message }: { message: string }) {
  const { t } = useLocale();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("products_page_badge")}
        </p>
        <h1 className="text-3xl font-semibold text-primary">
          {t("products_page_title")}
        </h1>
      </header>
      <div className="rounded-3xl border border-red-300 bg-red-500/10 p-10 text-center text-sm text-red-600">
        {message}
      </div>
    </section>
  );
}
