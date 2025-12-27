"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { fetchOrders } from "@/lib/api";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersPanel />
    </AuthGuard>
  );
}

function OrdersPanel() {
  const { tokens } = useAuthContext();
  const { t } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens?.access) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders(tokens.access);
        setOrders(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t("orders_fetch_failed"),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tokens?.access]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders]);

  const summary = useMemo(() => {
    const totals = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      value: 0,
    };
    for (const order of orders) {
      const status = order.status?.toLowerCase();
      if (status === "pending") totals.pending += 1;
      if (status === "confirmed") totals.confirmed += 1;
      totals.value += Number(order.total ?? 0);
    }
    return totals;
  }, [orders]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          {t("orders_badge")}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {t("orders_title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{t("orders_intro")}</p>
      </header>

      {loading ? (
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 text-sm text-muted shadow-soft">
          {t("orders_loading")}
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}
          <section className="space-y-4">
            <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-5 shadow-soft">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {t("orders_summary_title")}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[color:var(--border-muted)] bg-brand-soft px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {t("orders_summary_total")}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {summary.total}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {t("orders_summary_pending")}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {summary.pending}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {t("orders_summary_confirmed")}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {summary.confirmed}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {t("orders_summary_value")}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {summary.value.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
            {sortedOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[color:var(--border-muted)] bg-[color:var(--surface)] p-8 text-sm text-muted shadow-soft">
                {t("orders_empty")}
              </div>
            ) : (
              sortedOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-primary">
                        {t("orders_card_title")}
                      </h2>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      {t(`status_${order.status}`) || order.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {t("orders_total_label")}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-primary">
                        {order.total ?? "—"} TZS
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {t("orders_items_label")}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-primary">
                        {order.items.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {t("orders_status_label")}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-primary capitalize">
                        {t(`status_${order.status}`) || order.status}
                      </p>
                    </div>
                  </div>

                  {order.items.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-4 text-sm text-secondary">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {t("orders_items_summary")}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {order.items.map((item, index) => (
                          <li key={item.id}>
                            {t("orders_item_line", {
                              index: index + 1,
                              quantity: item.quantity,
                              total: item.line_total,
                            })}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
