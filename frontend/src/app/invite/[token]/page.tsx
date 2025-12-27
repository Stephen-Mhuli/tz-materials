"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  acceptSellerInvitation,
  lookupSellerInvitation,
} from "@/lib/api";
import type { SellerInvitation } from "@/lib/types";
import { useLocale } from "@/context/LocaleContext";

export default function InvitationPage({
  params,
}: {
  params: { token: string };
}) {
  const { t } = useLocale();
  const [invitation, setInvitation] = useState<SellerInvitation | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await lookupSellerInvitation(params.token);
        setInvitation(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : t("invite_not_found"),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.token]);

  const handleAccept = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await acceptSellerInvitation({
        token: params.token,
        full_name: fullName,
        password,
      });
      setMessage(t("invite_success"));
      localStorage.setItem(
        "tz-materials-auth",
        JSON.stringify({ user: response.user, tokens: response.tokens }),
      );
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("invite_failed"),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-8 text-sm text-muted shadow-soft">
        {t("invite_loading")}
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-8 text-sm text-muted shadow-soft">
        {error ?? t("invite_unavailable")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-8 shadow-soft">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("invite_badge")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-primary">
          {t("invite_title", { seller: invitation.seller_name })}
        </h1>
        <p className="mt-2 text-sm text-secondary">
          {t("invite_intro")}
        </p>
      </div>

      <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-4 text-sm text-secondary">
        <p className="font-semibold text-primary">{t("invite_details_title")}</p>
        <p>
          {t("invite_details_email")}: {invitation.email}
        </p>
        <p>
          {t("invite_details_phone")}: {invitation.phone}
        </p>
      </div>

      <form onSubmit={handleAccept} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary" htmlFor="full_name">
            {t("invite_full_name_label")}
          </label>
          <input
            id="full_name"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder={t("invite_full_name_placeholder")}
            className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary" htmlFor="password">
            {t("invite_password_label")}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("invite_password_placeholder")}
            className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-500">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[color:var(--brand-strong)]"
        >
          {saving ? t("invite_accepting") : t("invite_accept")}
        </button>
      </form>

      <p className="text-center text-sm text-secondary">
        {t("invite_wrong_contact")}{" "}
        <Link href="/login" className="font-semibold text-[color:var(--brand)]">
          {t("invite_contact_support")}
        </Link>
      </p>
    </div>
  );
}
