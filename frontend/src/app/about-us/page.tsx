"use client";

import { useLocale } from "@/context/LocaleContext";

export default function AboutUsPage() {
  const { t } = useLocale();
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("about_badge")}
        </p>
        <h1 className="text-3xl font-semibold text-primary">
          {t("about_title")}
        </h1>
      </header>
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 text-sm text-secondary shadow-soft">
        {t("about_body")}
      </div>
    </section>
  );
}
