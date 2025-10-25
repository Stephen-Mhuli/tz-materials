"use client";

import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardPage() {
  const { user } = useAuthContext();

  return (
    <AuthGuard>
      <div className="space-y-8">
        <header className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-8 shadow-soft sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Account control centre
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-primary">
            Welcome back, {user?.full_name ?? "partner"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary">
            Manage sourcing, orders, and mobilisation in one place. Use the navigation to
            activate seller tooling, monitor fulfilment, and reconcile payments across the
            LMGa Construction Solutions network.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-6 py-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Profile snapshot
            </h2>
            <dl className="mt-4 space-y-3 text-sm text-secondary">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Full name</dt>
                <dd className="mt-1 text-base font-semibold text-primary">
                  {user?.full_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Phone</dt>
                <dd className="mt-1 text-base font-semibold text-primary">
                  {user?.phone}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">Role</dt>
                <dd className="mt-1 text-base font-semibold text-primary capitalize">
                  {user?.role.replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">
                  KYC status
                </dt>
                <dd className="mt-1 inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  {user?.kyc_status ?? "pending"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Next actions
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-secondary">
              <li className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <strong className="text-primary">Buyer?</strong> Explore the{" "}
                <Link className="font-semibold text-[color:var(--brand)]" href="/products">
                  product catalog
                </Link>{" "}
                and place an order from any product page.
              </li>
              <li className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <strong className="text-primary">Seller?</strong> Make sure your{" "}
                <Link className="font-semibold text-[color:var(--brand)]" href="/seller">
                  seller profile
                </Link>{" "}
                is created, then{" "}
                <Link
                  className="font-semibold text-[color:var(--brand)]"
                  href="/products/new"
                >
                  publish new products
                </Link>
                .
              </li>
              <li className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                Track your orders under{" "}
                <Link className="font-semibold text-[color:var(--brand)]" href="/orders">
                  Orders
                </Link>{" "}
                and generate payments from the{" "}
                <Link className="font-semibold text-[color:var(--brand)]" href="/payments">
                  Payments
                </Link>{" "}
                panel.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
