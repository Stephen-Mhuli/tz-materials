"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addOrderItem,
  createOrder,
  createPayment,
  triggerPaymentWebhook,
  type AddOrderItemPayload,
  type CreateOrderPayload,
  type CreatePaymentPayload,
} from "@/lib/api";
import type { Order, Payment, Product } from "@/lib/types";
import { useAuthContext } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

type ProductOrderPanelProps = {
  product: Product;
};

export function ProductOrderPanel({ product }: ProductOrderPanelProps) {
  const router = useRouter();
  const { tokens, user, isAuthenticated } = useAuthContext();
  const { t } = useLocale();

  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [webhookResponse, setWebhookResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const ensureAuth = () => {
    if (!isAuthenticated || !tokens?.access) {
      router.push("/login?next=/products/" + product.id);
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ensureAuth() || !tokens?.access) return;

    setSubmitting(true);
    setError(null);
    setStatus(null);
    setPayment(null);
    setWebhookResponse(null);
    try {
      const orderPayload: CreateOrderPayload = {
        seller: product.seller,
        delivery_method: deliveryMethod,
        delivery_address: {
          instructions: "Auto generated via product page",
        },
      };
      const createdOrder = await createOrder(tokens.access, orderPayload);
      const itemPayload: AddOrderItemPayload = {
        product_id: product.id,
        quantity,
      };
      const updatedOrder = await addOrderItem(
        tokens.access,
        createdOrder.id,
        itemPayload,
      );
      setOrder(updatedOrder);
      setStatus("Order created and item added.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!ensureAuth() || !tokens?.access || !order) return;
    if (!order.total) {
      setError(
        "Order total is missing. Ensure the order has at least one item to determine the payable amount.",
      );
      return;
    }
    setProcessingPayment(true);
    setError(null);
    setStatus(null);
    try {
      const payload: CreatePaymentPayload = {
        order: order.id,
        method: "mobile_money",
        provider: "mpesa",
        tx_ref: `TX-${order.id.slice(0, 8)}-${Date.now()}`,
        amount: order.total,
      };
      const created = await createPayment(tokens.access, payload);
      setPayment(created);
      setStatus("Payment record created. Trigger webhook to confirm.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create payment record.",
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleWebhook = async () => {
    if (!payment?.tx_ref) {
      setError("No payment transaction reference available.");
      return;
    }
    try {
      const response = await triggerPaymentWebhook({
        tx_ref: payment.tx_ref,
        status: "success",
        amount: payment.amount,
        provider: payment.provider,
      });
      setWebhookResponse(
        response.ok
          ? "Webhook accepted. Order will reflect confirmed status."
          : `Webhook responded with error: ${response.error}`,
      );
      if (response.ok) {
        setOrder((prev) =>
          prev ? { ...prev, status: "confirmed" } : prev,
        );
        setPayment((prev) =>
          prev ? { ...prev, status: "success" } : prev,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to call payment webhook endpoint.",
      );
    }
  };

  return (
    <section className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-primary">
          {t("order_panel_heading")}
        </h2>
        <p className="text-sm text-muted">
          {isAuthenticated
            ? t("order_panel_logged_in_prompt", { phone: user?.phone ?? "" })
            : t("order_panel_login_prompt")}
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t("order_panel_quantity")}
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t("order_panel_delivery")}
          </label>
          <select
            value={deliveryMethod}
            onChange={(event) => setDeliveryMethod(event.target.value)}
            className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm text-primary outline-none transition focus:border-[color:var(--brand-strong)]"
          >
            <option value="pickup">{t("order_panel_delivery_pickup")}</option>
            <option value="delivery">{t("order_panel_delivery_ship")}</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={!isAuthenticated || submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[color:var(--brand-strong)]"
          >
            {submitting ? "Placing order..." : t("order_panel_submit")}
          </button>
        </div>
      </form>

      {status && (
        <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
          {status}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {order && (
        <div className="mt-6 space-y-5 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-5 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Order summary
              </h3>
              <p className="mt-1 text-lg font-semibold text-primary">
                {order.total ?? "Pending"} TZS
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {order.status}
            </span>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-4 py-4 text-xs text-secondary shadow-inner">
            <p className="font-semibold text-primary">Delivery instructions</p>
            <p className="mt-1">
              Our logistics desk will contact you within 30 minutes to finalise staging windows
              and gate passes.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Items confirmed
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-4 py-3"
                >
                  <span>
                    {item.quantity} × {product.name}
                  </span>
                  <span className="font-semibold text-primary">
                    {item.line_total} TZS
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
          <button
            type="button"
            disabled={processingPayment}
            onClick={handleCreatePayment}
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {processingPayment ? "Preparing payment..." : t("order_panel_payment")}
          </button>
            {payment && (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-4 text-xs text-emerald-500">
                <p className="font-semibold text-emerald-600">
                  Payment ready for reconciliation
                </p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <span className="font-semibold">Status:</span> {payment.status}
                  </li>
                  <li>
                    <span className="font-semibold">Tx Ref:</span> {payment.tx_ref ?? "Pending"}
                  </li>
                </ul>
                <button
                  type="button"
                onClick={handleWebhook}
                className="mt-3 inline-flex items-center rounded-full border border-emerald-400 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/10"
              >
                {t("order_panel_payment_webhook")}
              </button>
              </div>
            )}
          </div>
          {webhookResponse && (
            <div className="rounded-2xl border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-xs text-blue-500">
              {webhookResponse}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
