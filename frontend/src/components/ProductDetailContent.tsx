'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import type { Product } from "@/lib/types";
import { ProductOrderPanel } from "@/components/ProductOrderPanel";
import { resolveProductImages } from "@/lib/images";

type ProductDetailContentProps = {
  product: Product;
};

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const { t } = useLocale();
  const images = resolveProductImages(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const price = Number(product.price ?? 0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-8 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface)] shadow-soft">
        <div className="relative h-80 w-full overflow-hidden rounded-t-3xl">
          <Image
            src={images[activeIndex]}
            alt={product.name}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60"
                aria-label={t("product_gallery_prev")}
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/60"
                aria-label={t("product_gallery_next")}
              >
                →
              </button>
            </>
          )}
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
                  {t("per_unit_label", { unit: product.unit })}
                </span>
              </p>
            </div>
          </div>
        </div>
        {images.length > 1 && (
          <div className="-mt-4 flex flex-wrap gap-3 px-6 sm:px-10">
            {images.map((src, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-16 w-20 overflow-hidden rounded-2xl border transition ${
                    isActive
                      ? "border-[color:var(--brand-strong)] shadow-soft"
                      : "border-[color:var(--border-muted)]"
                  }`}
                  aria-label={t("product_gallery_thumb", { index: index + 1 })}
                >
                  <Image
                    src={src}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-6 px-6 pb-6 sm:px-10">
          <div className="grid gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--surface-elevated)] px-5 py-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {t("catalogue_stats_inventory")}
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {product.stock.toLocaleString()} {t("units_label")}
              </p>
              <p className="text-xs text-muted">
                {t("product_detail_inventory_note")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {t("product_detail_fulfilment_title")}
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {t("product_detail_fulfilment_value")}
              </p>
              <p className="text-xs text-muted">
                {t("product_detail_fulfilment_note")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {t("product_detail_compliance_title")}
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {t("product_detail_compliance_value")}
              </p>
              <p className="text-xs text-muted">
                {t("product_detail_compliance_note")}
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
                  {t("product_detail_choose_item1")}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-base text-[color:var(--brand)]">•</span>
                <span>
                  {t("product_detail_choose_item2")}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-base text-[color:var(--brand)]">•</span>
                <span>
                  {t("product_detail_choose_item3")}
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
