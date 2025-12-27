"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useCartContext } from "@/context/CartContext";
import type { Product } from "@/lib/types";
import { getProductFallbackImage, resolveProductImage } from "@/lib/images";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useLocale();
  const { addItem } = useCartContext();
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const primaryImage = resolveProductImage(product);
  const fallbackImage = getProductFallbackImage(product.category);
  const imageSrc = useFallbackImage ? fallbackImage : primaryImage;

  useEffect(() => {
    setUseFallbackImage(false);
  }, [product.id]);

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] shadow-soft transition hover:-translate-y-1 hover:shadow-strong">
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          onError={() => setUseFallbackImage(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/75">
              {product.category}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
            {Number(product.price).toLocaleString()} TZS
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        {product.description ? (
          <p className="text-sm leading-relaxed text-muted">
            {product.description}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted">
            {t("product_card_fallback_copy")}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-brand-soft px-3 py-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {t("product_card_unit_label")}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary capitalize">
              {product.unit}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {t("catalogue_stats_inventory")}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              {product.stock.toLocaleString()} units
            </p>
          </div>
          {product.brand && (
            <div className="col-span-2 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-3 py-3">
              <p className="text-[11px] uppercase tracking-wide text-muted">
                {t("product_card_brand")}
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {product.brand}
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto grid gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-primary transition hover:bg-brand-soft"
          >
            {t("product_card_add")}
          </button>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-strong dark:bg-[color:var(--brand-strong)]"
          >
            {t("product_card_cta")} →
          </Link>
        </div>
      </div>
    </article>
  );
}
