'use client';

import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ProductsHero() {
  const { t } = useLocale();

  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-12 shadow-soft sm:px-8 lg:px-14"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
    >
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(39,79,156,0.16),_transparent_65%)] dark:bg-[radial-gradient(circle_at_center,_rgba(140,181,255,0.18),_transparent_60%)] lg:block" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {t("catalogue_badge")}
          </span>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">
            {t("catalogue_title")}
          </h1>
          <p className="text-sm leading-relaxed text-muted sm:text-base">
            {t("catalogue_copy")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#catalogue"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-strong dark:bg-[color:var(--brand-strong)]"
            >
              {`${t("catalogue_primary_cta")} →`}
            </a>
            <a
              href="/payments"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-muted)] px-5 py-3 text-sm font-semibold text-primary transition hover:bg-brand-soft"
            >
              {t("catalogue_secondary_cta")}
            </a>
          </div>
        </div>
        <div className="grid w-full max-w-md gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] p-6 shadow-inner">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("products_quality_title")}
            </p>
            <p className="mt-1 text-sm text-secondary">
              {t("products_quality_copy")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("products_logistics_title")}
            </p>
            <p className="mt-1 text-sm text-secondary">
              {t("products_logistics_copy")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("products_coordinators_title")}
            </p>
            <p className="mt-1 text-sm text-secondary">
              {t("products_coordinators_copy")}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export function ProductsOverviewHeader() {
  const { t } = useLocale();

  return (
    <motion.header
      className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("catalogue_overview_badge")}</p>
        <h2 className="mt-2 text-2xl font-semibold text-primary">{t("catalogue_overview_heading")}</h2>
      </div>
      <p className="max-w-xl text-sm text-muted">{t("catalogue_overview_copy")}</p>
    </motion.header>
  );
}
