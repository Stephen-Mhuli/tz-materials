"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import {
  createPayment,
  fetchPayments,
  triggerPaymentWebhook,
  type CreatePaymentPayload,
} from "@/lib/api";
import type { Payment } from "@/lib/types";

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
        const data = await fetchPayments(tokens.access);
        setPayments(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch payments from the API.",
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tokens?.access]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokens?.access) return;
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
      setMessage("Payment request created.");
      setForm({
        order: "",
        amount: "",
        method: "mobile_money",
        provider: "mpesa",
        tx_ref: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create payment.",
      );
    } finally {
      setSaving(false);
    }
  };

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
          ? `Webhook accepted for payment ${payment.id}.`
          : `Webhook returned error: ${response.error}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to trigger the payment webhook.",
      );
    } finally {
      setBusyPayment(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Payments
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Payment requests & reconciliation
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Create payment intents against an order, then simulate PSP callbacks
          using the webhook helper below.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Create payment request
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                Order UUID
              </label>
              <input
                required
                value={form.order}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, order: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="cc4a7778-a48b-4e0a-a7ba-33e398ad6bb9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                Amount (TZS)
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
                Payment method
              </label>
              <select
                value={form.method}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, method: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="mobile_money">Mobile money</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank transfer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                Provider
              </label>
              <select
                value={form.provider}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, provider: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="tigopesa">Tigo Pesa</option>
                <option value="airtelmoney">Airtel Money</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-600">
                Transaction reference (optional)
              </label>
              <input
                value={form.tx_ref}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, tx_ref: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Optional custom reference"
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
              {saving ? "Creating..." : "Create payment"}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Payment history
          </h2>
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              No payment records yet. Generate one using the form on the left.
            </div>
          ) : (
            payments.map((payment) => (
              <article
                key={payment.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Payment {payment.id.slice(0, 8)}...
                  </h3>
                  <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {payment.status}
                  </span>
                </div>
                <dl className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-4">
                  <div>
                    <dt className="font-medium text-slate-500">Order ID</dt>
                    <dd className="break-all">{payment.order}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">
                      Amount (TZS)
                    </dt>
                    <dd>{payment.amount}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Provider</dt>
                    <dd>{payment.provider ?? "n/a"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Tx Ref</dt>
                    <dd>{payment.tx_ref ?? "n/a"}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled={busyPayment === payment.id || !payment.tx_ref}
                  onClick={() => handleWebhook(payment)}
                  className="mt-3 inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyPayment === payment.id
                    ? "Triggering webhook..."
                    : "Trigger success webhook"}
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
