'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";

const serviceIcons = ["🛠️", "🚚", "👷"];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HomePage() {
  const { t } = useLocale();

  const servicePillars = [
    {
      title: t("services_design_title"),
      description: t("services_design_desc"),
      icon: serviceIcons[0],
    },
    {
      title: t("services_procurement_title"),
      description: t("services_procurement_desc"),
      icon: serviceIcons[1],
    },
    {
      title: t("services_workforce_title"),
      description: t("services_workforce_desc"),
      icon: serviceIcons[2],
    },
  ];

  const capabilityHighlights = [
    {
      title: t("capability_supply_title"),
      description: t("capability_supply_desc"),
      ctaLabel: t("capability_supply_cta"),
      ctaHref: "/products",
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-20">
      <motion.section
        className="relative overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-16 shadow-soft sm:px-10 lg:px-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(39,79,156,0.18),_transparent_70%)] dark:bg-[radial-gradient(circle_at_top,_rgba(140,181,255,0.22),_transparent_65%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {t("hero_badge")}
            </span>
            <h1 className="text-4xl font-bold text-primary sm:text-5xl">
              {t("hero_title")}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-secondary sm:text-lg">
              {t("hero_copy")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-strong dark:bg-[color:var(--brand-strong)]"
              >
                {`${t("hero_primary_cta")} →`}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-muted)] px-6 py-3 text-sm font-semibold text-primary transition hover:bg-brand-soft"
              >
                {t("hero_secondary_cta")}
              </Link>
            </div>
          </div>
          <div className="grid gap-5 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] p-6 shadow-inner sm:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("hero_metrics_projects")}</p>
              <p className="mt-2 text-3xl font-semibold text-primary">120+</p>
              <p className="text-xs text-muted">{t("hero_metrics_projects_note")}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("hero_metrics_delivery")}</p>
              <p className="mt-2 text-3xl font-semibold text-primary">98%</p>
              <p className="text-xs text-muted">{t("hero_metrics_delivery_note")}</p>
            </div>
            <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("hero_metrics_support")}</p>
              <p className="mt-2 text-sm text-secondary">
                {t("hero_metrics_support_note", { phone: "+255 700 000 001" })}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="space-y-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("services_badge")}</p>
          <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
            {t("services_heading")}
          </h2>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {servicePillars.map((pillar) => (
            <motion.article
              key={pillar.title}
              className="space-y-3 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-7 shadow-soft"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-3xl">{pillar.icon}</span>
              <h3 className="text-lg font-semibold text-primary">{pillar.title}</h3>
              <p className="text-sm text-secondary">{pillar.description}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="space-y-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("capability_section_badge")}
          </p>
          <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
            {t("capability_supply_title")}
          </h2>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {capabilityHighlights.map((highlight) => (
            <motion.article
              key={highlight.title}
              className="flex h-full flex-col gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-6 shadow-soft"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
            >
              <h3 className="text-lg font-semibold text-primary">{highlight.title}</h3>
              <p className="text-sm text-secondary">{highlight.description}</p>
              <Link
                href={highlight.ctaHref}
                className="mt-auto inline-flex w-fit items-center rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-primary transition hover:bg-[color:var(--brand)] hover:text-white"
              >
                {highlight.ctaLabel} →
              </Link>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-10 text-center shadow-soft sm:px-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
          {t("landing_call_heading")}
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-secondary sm:text-base">
          {t("landing_call_copy")}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/about-us"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-muted)] px-6 py-3 text-sm font-semibold text-primary transition hover:bg-brand-soft"
          >
            {t("landing_call_secondary")}
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
