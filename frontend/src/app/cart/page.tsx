"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addOrderItem, createOrder } from "@/lib/api";
import { useAuthContext } from "@/context/AuthContext";
import { useCartContext } from "@/context/CartContext";
import { useLocale } from "@/context/LocaleContext";

export default function CartPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { tokens, isAuthenticated } = useAuthContext();
  const { items, totalAmount, updateItem, removeItem, clear } =
    useCartContext();
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isAuthenticated || !tokens?.access) {
      router.push("/login?next=/cart");
      return;
    }
    setSubmitting(true);
    setError(null);
    setStatus(null);
    try {
      const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
        const seller = item.product.seller;
        if (!acc[seller]) acc[seller] = [];
        acc[seller].push(item);
        return acc;
      }, {});

      const createdOrders: string[] = [];
      for (const [seller, sellerItems] of Object.entries(grouped)) {
        const order = await createOrder(tokens.access, {
          seller,
          delivery_method: deliveryMethod,
          delivery_address: {
            instructions: "Auto generated via cart checkout",
          },
        });
        for (const item of sellerItems) {
          await addOrderItem(tokens.access, order.id, {
            product_id: item.product.id,
            quantity: item.quantity,
          });
        }
        createdOrders.push(order.id);
      }
      clear();
      setStatus(
        createdOrders.length === 1
          ? t("cart_single_order")
          : t("cart_multi_order", { count: createdOrders.length }),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create the order from cart.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("nav_cart")}
          </p>
          <h1 className="text-3xl font-semibold text-primary">
            {t("cart_heading")}
          </h1>
        </header>
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-8 text-center text-sm text-muted shadow-soft">
          {t("cart_empty")}
        </div>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-strong dark:bg-[color:var(--brand-strong)]"
        >
          {t("cart_continue")}
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("nav_cart")}
        </p>
        <h1 className="text-3xl font-semibold text-primary">
          {t("cart_heading")}
        </h1>
        <p className="mt-2 text-sm text-secondary">{t("cart_notice")}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-5 shadow-soft"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {item.product.category}
                  </p>
                  <h2 className="text-lg font-semibold text-primary">
                    {item.product.name}
                  </h2>
                  <p className="text-sm text-secondary">
                    {Number(item.product.price).toLocaleString()} TZS /{" "}
                    {item.product.unit}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.product.id, Number(event.target.value))
                    }
                    className="w-24 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)]"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="rounded-full border border-red-300 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50/30 hover:text-red-600 dark:border-red-400/60 dark:hover:bg-red-500/10"
                  >
                    {t("cart_remove")}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm">
                <span className="text-muted">{t("cart_line_total")}</span>
                <span className="font-semibold text-primary">
                  {(Number(item.product.price) * item.quantity).toLocaleString()} TZS
                </span>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {t("cart_total")}
            </p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {totalAmount.toLocaleString()} TZS
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {t("cart_delivery")}
            </label>
            <select
              value={deliveryMethod}
              onChange={(event) => setDeliveryMethod(event.target.value)}
              className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm text-primary outline-none transition focus:border-[color:var(--brand-strong)]"
            >
              <option value="pickup">{t("cart_delivery_pickup")}</option>
              <option value="delivery">{t("cart_delivery_ship")}</option>
            </select>
          </div>

          {!isAuthenticated && (
            <div className="rounded-2xl border border-amber-300/60 bg-amber-200/20 px-4 py-3 text-sm text-amber-700">
              {t("cart_login_prompt")}
            </div>
          )}

          {status && (
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
              {status}
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={submitting || items.length === 0}
          className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.01] hover:shadow-strong disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[color:var(--brand-strong)]"
          >
            {submitting ? t("cart_submitting") : t("cart_checkout")}
          </button>
          <Link
            href="/orders"
            className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--border-muted)] px-5 py-3 text-sm font-semibold text-primary transition hover:bg-brand-soft"
          >
            {t("cart_view_orders")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
