"use client";

import { useEffect, useState } from "react";
import { ProductsCatalogue } from "@/components/ProductsCatalogue";
import { ProductsHero, ProductsOverviewHeader } from "@/components/ProductsHero";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useLocale } from "@/context/LocaleContext";

export default function ProductsPage() {
  const { t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : t("products_error_generic"),
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [t]);

  if (errorMessage) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("products_page_badge")}
          </p>
          <h1 className="text-3xl font-semibold text-primary">
            {t("products_page_title")}
          </h1>
        </header>
        <div className="rounded-3xl border border-red-300 bg-red-500/10 p-10 text-center text-sm text-red-600">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-12">
      <ProductsHero />
      <section id="catalogue" className="space-y-6">
        <ProductsOverviewHeader />
        {loading ? (
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] p-10 text-center text-sm text-muted shadow-soft">
            {t("catalogue_loading")}
          </div>
        ) : (
          <ProductsCatalogue products={products} />
        )}
      </section>
    </div>
  );
}
