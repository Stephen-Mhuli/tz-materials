"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const params = useSearchParams();
  const nextRoute = useMemo(
    () => params?.get("next") ?? "/dashboard",
    [params],
  );

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(nextRoute);
    }
  }, [loading, isAuthenticated, router, nextRoute]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ phone, password });
      router.replace(nextRoute);
    } catch (err) {
      if (err instanceof Error) {
        const raw = err.message || "";
        if (raw.toLowerCase().includes("invalid credentials")) {
          setError("Incorrect phone number or password. Please try again.");
        } else {
          setError(raw);
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-8 shadow-soft">
      <h1 className="text-2xl font-semibold text-primary">Log in</h1>
      <p className="mt-2 text-sm text-secondary">
        Enter your phone number and password to access your account.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            placeholder="+255700000001"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-primary"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
            placeholder="••••••••"
          />
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
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Need an account?{" "}
        <Link className="font-semibold text-[color:var(--brand)]" href="/register">
          Register here
        </Link>
      </p>
    </div>
  );
}
