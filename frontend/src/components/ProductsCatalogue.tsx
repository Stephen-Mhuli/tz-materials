"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import { useLocale } from "@/context/LocaleContext";

type ProductsCatalogueProps = {
  products: Product[];
};

function normalisePrice(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function ProductsCatalogue({ products }: ProductsCatalogueProps) {
  const { t } = useLocale();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("any");

  const priceFilters = useMemo(
    () => [
      { label: t("catalogue_price_any"), value: "any" },
      { label: t("catalogue_price_under15"), value: "under15" },
      { label: t("catalogue_price_mid"), value: "mid" },
      { label: t("catalogue_price_premium"), value: "premium" },
    ],
    [t],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        set.add(product.category);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const aggregatedStats = useMemo(() => {
    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.stock ?? 0),
      0,
    );
    const totalValue = products.reduce(
      (sum, product) => sum + normalisePrice(product.price) * Number(product.stock ?? 0),
      0,
    );
    const avgPrice =
      products.length > 0
        ? products.reduce((sum, product) => sum + normalisePrice(product.price), 0) /
          products.length
        : 0;
    return {
      totalCount: products.length,
      totalStock,
      totalValue,
      avgPrice,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const matchesSearch =
        searchTerm.trim().length === 0 ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const price = normalisePrice(product.price);

      let matchesPrice = true;
      if (priceFilter === "under15") {
        matchesPrice = price <= 15000;
      } else if (priceFilter === "mid") {
        matchesPrice = price > 15000 && price < 50000;
      } else if (priceFilter === "premium") {
        matchesPrice = price >= 50000;
      }

      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [categoryFilter, priceFilter, products, searchTerm]);

  return (
    <section className="mt-10 space-y-10">
      <div className="grid gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-6 shadow-soft md:grid-cols-[2fr_1fr] md:items-center">
        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t("catalogue_search_label")}
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-4 text-lg text-muted">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t("catalogue_search_placeholder")}
              className="w-full rounded-full border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-12 py-3 text-sm text-primary shadow-inner outline-none transition focus:border-[color:var(--brand-strong)]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t("catalogue_budget_label")}
          </label>
          <select
            value={priceFilter}
            onChange={(event) => setPriceFilter(event.target.value)}
            className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-primary outline-none transition focus:border-[color:var(--brand-strong)] sm:max-w-xs"
          >
            {priceFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            categoryFilter === "all"
              ? "bg-[color:var(--brand)] text-white shadow-soft"
              : "border border-[color:var(--border-muted)] text-muted hover:bg-brand-soft"
          }`}
        >
          {t("catalogue_filters_all")}
        </button>
        {categories.map((category) => {
          const isActive = categoryFilter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() =>
                setCategoryFilter((prev) => (prev === category ? "all" : category))
              }
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                isActive
                  ? "bg-[color:var(--brand)] text-white shadow-soft"
                  : "border border-[color:var(--border-muted)] text-muted hover:bg-brand-soft"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-brand-soft px-5 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("catalogue_stats_catalogue")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {aggregatedStats.totalCount} items
          </p>
          <p className="text-xs text-muted">Active across LMGa supply</p>
        </div>
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("catalogue_stats_inventory")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {aggregatedStats.totalStock.toLocaleString()}
          </p>
          <p className="text-xs text-muted">{t("product_card_stock")}</p>
        </div>
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("catalogue_stats_value")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {aggregatedStats.totalValue.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}{" "}
            TZS
          </p>
          <p className="text-xs text-muted">Based on listed stock</p>
        </div>
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-5 py-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("catalogue_stats_avg_price")}
          </p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {Math.round(aggregatedStats.avgPrice).toLocaleString()} TZS
          </p>
          <p className="text-xs text-muted">Across current materials</p>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--border-muted)] bg-[color:var(--surface)] p-10 text-center text-sm text-muted">
          {t("catalogue_empty")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
