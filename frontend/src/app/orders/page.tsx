"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthContext } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { addOrderItem, fetchOrders, type AddOrderItemPayload } from "@/lib/api";
import type { Order } from "@/lib/types";

type ItemFormState = {
  product_id: string;
  quantity: number;
};

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
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>({
    product_id: "",
    quantity: 1,
  });
  const [addingItem, setAddingItem] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrder(orderId);
    setItemForm({ product_id: "", quantity: 1 });
    setMessage(null);
    setError(null);
  };

  const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokens?.access || !selectedOrder) return;
    setAddingItem(true);
    setMessage(null);
    setError(null);
    try {
      const payload: AddOrderItemPayload = {
        product_id: itemForm.product_id,
        quantity: Number(itemForm.quantity),
      };
      const updated = await addOrderItem(tokens.access, selectedOrder, payload);
      setOrders((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order)),
      );
      setMessage(t("orders_add_success"));
      setItemForm({ product_id: "", quantity: 1 });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("orders_add_failed"),
      );
    } finally {
      setAddingItem(false);
    }
  };

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
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
          {t("orders_loading")}
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  {t("orders_empty")}
                </div>
              ) : (
                orders.map((order) => (
                  <article
                    key={order.id}
                    className={`rounded-lg border ${
                      order.id === selectedOrder
                        ? "border-slate-900"
                        : "border-slate-200"
                    } bg-white p-5 shadow-sm transition`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-base font-semibold text-slate-900">
                        {t("orders_order_label", {
                          id: order.id.slice(0, 8),
                        })}
                      </h2>
                      <button
                        type="button"
                        onClick={() => handleSelectOrder(order.id)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        {order.id === selectedOrder
                          ? t("orders_selected")
                          : t("orders_manage")}
                      </button>
                    </div>
                    <dl className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-4">
                      <div>
                        <dt className="font-medium text-slate-500">
                          {t("orders_status_label")}
                        </dt>
                        <dd className="capitalize">{order.status}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          {t("orders_total_label")}
                        </dt>
                        <dd>{order.total ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          {t("orders_seller_label")}
                        </dt>
                        <dd className="break-all">{order.seller}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          {t("orders_created_label")}
                        </dt>
                        <dd>{new Date(order.created_at).toLocaleString()}</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t("orders_items_label")}
                      </h3>
                      {order.items.length === 0 ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {t("orders_items_empty")}
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.quantity} ×{" "}
                              {item.product ?? t("orders_item_deleted")} —
                              {item.line_total} TZS
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                {t("orders_add_title")}
              </h2>
              <p className="mt-2 text-xs text-slate-600">
                {t("orders_add_intro")}
              </p>
              <form onSubmit={handleAddItem} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    {t("orders_add_order_id")}
                  </label>
                  <input
                    type="text"
                    value={selectedOrder ?? ""}
                    readOnly
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600"
                    placeholder={t("orders_add_select_order")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    {t("orders_add_product_id")}
                  </label>
                  <input
                    required
                    value={itemForm.product_id}
                    onChange={(event) =>
                      setItemForm((prev) => ({
                        ...prev,
                        product_id: event.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="49a1694b-775e-4155-9174-951d9a449780"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    {t("orders_add_quantity")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={itemForm.quantity}
                    onChange={(event) =>
                      setItemForm((prev) => ({
                        ...prev,
                        quantity: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                  disabled={!selectedOrder || addingItem}
                  className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {addingItem ? t("orders_add_adding") : t("orders_add_button")}
                </button>
              </form>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
