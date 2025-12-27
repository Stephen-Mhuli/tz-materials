"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import type { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const { register } = useAuthContext();
  const router = useRouter();
  const { t } = useLocale();

  const roles: Array<{ value: UserRole; label: string }> = [
    { value: "buyer", label: t("register_role_buyer") },
    { value: "seller_admin", label: t("register_role_seller") },
  ];

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        full_name: fullName,
        phone,
        password,
        role,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-8 shadow-soft">
      <h1 className="text-2xl font-semibold text-primary">
        {t("register_title")}
      </h1>
      <p className="mt-2 text-sm text-secondary">
        {t("register_subtitle")}
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-primary"
            htmlFor="full_name"
          >
            {t("register_full_name_label")}
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            placeholder={t("register_full_name_placeholder")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary" htmlFor="phone">
            {t("register_phone_label")}
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            placeholder={t("register_phone_placeholder")}
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-primary"
            htmlFor="password"
          >
            {t("register_password_label")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            placeholder={t("register_password_placeholder")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary" htmlFor="role">
            {t("register_role_label")}
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
          >
            {roles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[color:var(--brand-strong)]"
        >
          {submitting ? t("register_submitting") : t("register_submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        {t("register_have_account")}{" "}
        <Link className="font-semibold text-[color:var(--brand)]" href="/login">
          {t("register_login_link")}
        </Link>
      </p>
    </div>
  );
}
