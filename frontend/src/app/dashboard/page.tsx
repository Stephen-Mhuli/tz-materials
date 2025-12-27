"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { useLocale } from "@/context/LocaleContext";
import { fetchMyProducts, fetchSellerProfile } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function DashboardPage() {
  const { user, tokens } = useAuthContext();
  const { t } = useLocale();
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const showInventory = user?.role === "seller_admin" && Boolean(tokens?.access);

  useEffect(() => {
    if (!showInventory || !tokens?.access) return;
    const load = async () => {
      setInventoryLoading(true);
      setInventoryError(null);
      try {
        const sellerRecords = await fetchSellerProfile(tokens.access);
        if (sellerRecords.length === 0) {
          setSellerProducts([]);
          return;
        }
        const sellerRecord = sellerRecords[0];
        const products = await fetchMyProducts(tokens.access, sellerRecord.id);
        setSellerProducts(products);
      } catch (error) {
        setInventoryError(
          error instanceof Error
            ? error.message
            : t("dashboard_inventory_failed"),
        );
      } finally {
        setInventoryLoading(false);
      }
    };
    void load();
  }, [showInventory, tokens?.access]);

  const inventoryMetrics = useMemo(() => {
    if (!sellerProducts.length) {
      return { totalCount: 0, totalStock: 0, totalValue: 0, avgPrice: 0 };
    }
    const totalStock = sellerProducts.reduce(
      (sum, product) => sum + Number(product.stock ?? 0),
      0,
    );
    const totalValue = sellerProducts.reduce(
      (sum, product) => sum + Number(product.price ?? 0) * Number(product.stock ?? 0),
      0,
    );
    const avgPrice =
      sellerProducts.reduce((sum, product) => sum + Number(product.price ?? 0), 0) /
      sellerProducts.length;
    return {
      totalCount: sellerProducts.length,
      totalStock,
      totalValue,
      avgPrice,
    };
  }, [sellerProducts]);

  return (
    <AuthGuard>
      <div className="space-y-8">
        <header className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-8 shadow-soft sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("dashboard_badge")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-primary">
            {t("dashboard_welcome", {
              name: user?.full_name ?? t("dashboard_partner"),
            })}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary">
            {t("dashboard_intro")}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-6 py-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              {t("dashboard_profile_title")}
            </h2>
            <dl className="mt-4 space-y-3 text-sm text-secondary">
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">
                  {t("dashboard_label_full_name")}
                </dt>
                <dd className="mt-1 text-base font-semibold text-primary">
                  {user?.full_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">
                  {t("dashboard_label_phone")}
                </dt>
                <dd className="mt-1 text-base font-semibold text-primary">
                  {user?.phone}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">
                  {t("dashboard_label_role")}
                </dt>
                <dd className="mt-1 text-base font-semibold text-primary capitalize">
                  {user?.role.replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-muted">
                  {t("dashboard_label_kyc")}
                </dt>
                <dd className="mt-1 inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  {user?.kyc_status === "pending"
                    ? t("dashboard_kyc_pending")
                    : user?.kyc_status ?? t("dashboard_kyc_pending")}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-6 shadow-soft">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              {t("dashboard_next_title")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-secondary">
              <li className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <strong className="text-primary">
                  {t("dashboard_next_buyer_title")}
                </strong>{" "}
                {t("dashboard_next_buyer_prefix")}{" "}
                <Link className="font-semibold text-[color:var(--brand)]" href="/products">
                  {t("nav_products")}
                </Link>{" "}
                {t("dashboard_next_buyer_suffix")}
              </li>
              <li className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <strong className="text-primary">
                  {t("dashboard_next_seller_title")}
                </strong>{" "}
                {t("dashboard_next_seller_prefix")}{" "}
                <Link className="font-semibold text-[color:var(--brand)]" href="/seller">
                  {t("nav_seller_tools")}
                </Link>{" "}
                {t("dashboard_next_seller_mid")}{" "}
                <Link
                  className="font-semibold text-[color:var(--brand)]"
                  href="/products/new"
                >
                  {t("nav_add_product")}
                </Link>
                .
              </li>
              <li className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3">
                {t("dashboard_next_orders_prefix")}{" "}
                <Link className="font-semibold text-[color:var(--brand)]" href="/orders">
                  {t("nav_orders")}
                </Link>{" "}
                {t("dashboard_next_orders_mid")}{" "}
                <Link className="font-semibold text-[color:var(--brand)]" href="/payments">
                  {t("nav_payments")}
                </Link>{" "}
                {t("dashboard_next_orders_suffix")}
              </li>
            </ul>
          </div>
        </section>

        {showInventory && (
          <section className="space-y-4">
            <header className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {t("dashboard_inventory_badge")}
              </p>
              <h2 className="text-2xl font-semibold text-primary">
                {t("dashboard_inventory_heading")}
              </h2>
              <p className="text-sm text-secondary">
                {t("dashboard_inventory_copy")}
              </p>
            </header>

            {inventoryError && (
              <div className="rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {inventoryError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-[color:var(--border-muted)] bg-brand-soft px-5 py-6">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {t("catalogue_stats_catalogue")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-primary">
                  {inventoryLoading ? "—" : inventoryMetrics.totalCount}
                </p>
                <p className="text-xs text-muted">
                  {t("dashboard_inventory_products")}
                </p>
              </div>
              <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {t("catalogue_stats_inventory")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-primary">
                  {inventoryLoading ? "—" : inventoryMetrics.totalStock.toLocaleString()}
                </p>
                <p className="text-xs text-muted">{t("product_card_stock")}</p>
              </div>
              <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {t("catalogue_stats_value")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-primary">
                  {inventoryLoading
                    ? "—"
                    : inventoryMetrics.totalValue.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                  TZS
                </p>
                <p className="text-xs text-muted">
                  {t("dashboard_inventory_value")}
                </p>
              </div>
              <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {t("catalogue_stats_avg_price")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-primary">
                  {inventoryLoading
                    ? "—"
                    : Math.round(inventoryMetrics.avgPrice).toLocaleString()}{" "}
                  TZS
                </p>
                <p className="text-xs text-muted">
                  {t("dashboard_inventory_avg")}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </AuthGuard>
  );
}
