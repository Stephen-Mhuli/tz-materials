'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import type { Product } from "@/lib/types";
import { ProductOrderPanel } from "@/components/ProductOrderPanel";
import { getProductFallbackImage, resolveProductImage } from "@/lib/images";

type ProductDetailContentProps = {
  product: Product;
};

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const { t } = useLocale();
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const primaryImage = resolveProductImage(product);
  const fallbackImage = getProductFallbackImage(product.category);
  const imageSrc = useFallbackImage ? fallbackImage : primaryImage;
  const price = Number(product.price ?? 0);

  useEffect(() => {
    setUseFallbackImage(false);
  }, [product.id]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-8 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] shadow-soft">
        <div className="relative h-80 w-full overflow-hidden rounded-t-3xl">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
            priority
            onError={() => setUseFallbackImage(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute left-8 right-8 bottom-8 flex flex-col gap-4 text-white sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                {product.category}
              </p>
              <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
              {product.brand && (
                <p className="text-sm text-white/80">
                  {t("product_card_brand")} • {product.brand}
                </p>
              )}
            </div>
            <div className="rounded-3xl bg-white/20 px-5 py-3 text-right backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-white/80">
                {t("product_detail_overview_badge")}
              </p>
              <p className="text-2xl font-semibold">
                {price.toLocaleString()} TZS
                <span className="ml-1 text-sm font-normal text-white/80">
                  per {product.unit}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 pb-6 sm:px-10">
          <div className="grid gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-5 py-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {t("catalogue_stats_inventory")}
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {product.stock.toLocaleString()} units
              </p>
              <p className="text-xs text-muted">
                Same-day dispatch in Dar &amp; Coastal zones
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Fulfilment coverage</p>
              <p className="mt-2 text-lg font-semibold text-primary">Nationwide</p>
              <p className="text-xs text-muted">
                Coordinated cross-dock to Arusha, Dodoma &amp; Mwanza
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Compliance</p>
              <p className="mt-2 text-lg font-semibold text-primary">ASTM &amp; TBS certified</p>
              <p className="text-xs text-muted">
                Batch test certificates appended to every dispatch note
              </p>
            </div>
          </div>

          {product.description && (
            <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                {t("product_detail_overview_badge")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{product.description}</p>
            </div>
          )}

          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] px-6 py-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              {t("product_detail_choose_title")}
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-secondary">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-base text-[color:var(--brand)]">•</span>
                <span>
                  Guaranteed availability with buffer stock held across LMGa depots for phased deliveries.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-base text-[color:var(--brand)]">•</span>
                <span>
                  Technical support for substitution requests, mix design adjustments, and coordinated testing.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-base text-[color:var(--brand)]">•</span>
                <span>
                  Optional labour pairing to mobilise certified crews familiar with the material handling requirements.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <ProductOrderPanel product={product} />
    </div>
  );
}
