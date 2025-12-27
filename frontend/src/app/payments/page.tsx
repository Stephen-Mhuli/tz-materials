"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import {
  createPayment,
  fetchOrders,
  fetchPayments,
  triggerPaymentWebhook,
  type CreatePaymentPayload,
} from "@/lib/api";
import type { Order, Payment } from "@/lib/types";

type PaymentFormState = {
  order: string;
  amount: string;
  method: string;
  provider: string;
  tx_ref: string;
};

export default function PaymentsPage() {
  return (
    <AuthGuard>
      <PaymentsPanel />
    </AuthGuard>
  );
}

function PaymentsPanel() {
  const { tokens } = useAuthContext();
  const { t } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  const [busyPayment, setBusyPayment] = useState<string | null>(null);

  const [form, setForm] = useState<PaymentFormState>({
    order: "",
    amount: "",
    method: "mobile_money",
    provider: "mpesa",
    tx_ref: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tokens?.access) return;
    const load = async () => {
      try {
        setLoading(true);
        const [paymentsData, ordersData] = await Promise.all([
          fetchPayments(tokens.access),
          fetchOrders(tokens.access),
        ]);
        setPayments(paymentsData);
        setOrders(ordersData);
        if (!form.order && ordersData.length > 0) {
          setForm((prev) => ({ ...prev, order: ordersData[0].id }));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t("payments_fetch_failed"),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tokens?.access, t, form.order]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokens?.access) return;
    if (!form.order) {
      setError(t("payments_order_required"));
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload: CreatePaymentPayload = {
        order: form.order,
        amount: form.amount,
        method: form.method,
        provider: form.provider,
        tx_ref:
          form.tx_ref.trim() || `TX-${form.order.slice(0, 8)}-${Date.now()}`,
      };
      const created = await createPayment(tokens.access, payload);
      setPayments((prev) => [created, ...prev]);
      setMessage(t("payments_create_success"));
      setForm({
        order: "",
        amount: "",
        method: "mobile_money",
        provider: "mpesa",
        tx_ref: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("payments_create_failed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const orderOptions = useMemo(() => {
    return [...orders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [orders]);

  const formatOrderCode = (order: Order) => {
    const date = new Date(order.created_at);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const short = order.id.replace(/-/g, "").slice(0, 4).toUpperCase();
    return `ORD-${y}-${m}${d}-${short}`;
  };

  const summary = useMemo(() => {
    const totals = {
      total: payments.length,
      success: 0,
      pending: 0,
      failed: 0,
      value: 0,
    };
    for (const payment of payments) {
      const status = payment.status?.toLowerCase();
      if (status === "success") totals.success += 1;
      if (status === "pending") totals.pending += 1;
      if (status === "failed") totals.failed += 1;
      totals.value += Number(payment.amount ?? 0);
    }
    return totals;
  }, [payments]);

  const handleWebhook = async (payment: Payment) => {
    setBusyPayment(payment.id);
    setWebhookMessage(null);
    setError(null);
    try {
      const response = await triggerPaymentWebhook({
        tx_ref: payment.tx_ref ?? "",
        status: "success",
        amount: payment.amount,
        provider: payment.provider,
      });
      setWebhookMessage(
        response.ok
          ? t("payments_webhook_success", { id: payment.id })
          : t("payments_webhook_error", { error: response.error ?? "" }),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("payments_webhook_failed"),
      );
    } finally {
      setBusyPayment(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          {t("payments_badge")}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {t("payments_title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("payments_intro")}
        </p>
      </header>

      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-5 shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("payments_summary_title")}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-brand-soft px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("payments_summary_total")}
            </p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {summary.total}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("payments_summary_success")}
            </p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {summary.success}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("payments_summary_pending")}
            </p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {summary.pending}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("payments_summary_failed")}
            </p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {summary.failed}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("payments_summary_value")}
            </p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {summary.value.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            {t("payments_create_title")}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                {t("payments_order_uuid")}
              </label>
              <select
                value={form.order}
                onChange={(event) => {
                  const orderId = event.target.value;
                  const selected = orders.find((order) => order.id === orderId);
                  setForm((prev) => ({
                    ...prev,
                    order: orderId,
                    amount: selected?.total ? String(selected.total) : prev.amount,
                  }));
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">
                  {orderOptions.length === 0
                    ? t("payments_order_empty")
                    : t("payments_order_select")}
                </option>
                {orderOptions.map((order) => (
                  <option key={order.id} value={order.id}>
                    {formatOrderCode(order)} •{" "}
                    {t("payments_order_option", {
                      date: new Date(order.created_at).toLocaleDateString(),
                      total: order.total ?? "—",
                    })}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                {t("payments_amount_label")}
              </label>
              <input
                required
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="45000.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                {t("payments_method_label")}
              </label>
              <select
                value={form.method}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, method: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="mobile_money">
                  {t("payment_method_mobile_money")}
                </option>
                <option value="cash">{t("payment_method_cash")}</option>
                <option value="bank_transfer">{t("payment_method_bank")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                {t("payments_provider_label")}
              </label>
              <select
                value={form.provider}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, provider: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="mpesa">{t("payment_provider_mpesa")}</option>
                <option value="tigopesa">{t("payment_provider_tigopesa")}</option>
                <option value="airtelmoney">{t("payment_provider_airtel")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                {t("payments_tx_label")}
              </label>
              <input
                value={form.tx_ref}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tx_ref: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder={t("payments_tx_placeholder")}
              />
            </div>

            {message && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? t("payments_create_creating") : t("payments_create_button")}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            {t("payments_history_title")}
          </h2>
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
              {t("payments_loading")}
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              {t("payments_empty")}
            </div>
          ) : (
            payments.map((payment) => (
              <article
                key={payment.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {t("payments_record_title")}
                  </h3>
                  <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {t(`status_${payment.status}`) || payment.status}
                  </span>
                </div>
                <dl className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-3">
                  <div>
                    <dt className="font-medium text-slate-500">
                      {t("payments_amount_short")}
                    </dt>
                    <dd>{payment.amount}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">
                      {t("payments_provider_short")}
                    </dt>
                    <dd>{payment.provider ?? t("payments_na")}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">
                      {t("payments_created_label")}
                    </dt>
                    <dd>{new Date(payment.created_at).toLocaleString()}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled={busyPayment === payment.id || !payment.tx_ref}
                  onClick={() => handleWebhook(payment)}
                  className="mt-3 inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyPayment === payment.id
                    ? t("payments_webhook_triggering")
                    : t("payments_webhook_trigger")}
                </button>
              </article>
            ))
          )}
          {webhookMessage && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              {webhookMessage}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
