import type { Product } from "@/lib/types";

const FALLBACK_IMAGES: Record<string, string> = {
  cement: "/images/placeholders/cement.svg",
  steel: "/images/placeholders/steel.svg",
  rebar: "/images/placeholders/rebar.svg",
  aggregates: "/images/placeholders/aggregates.svg",
  tiles: "/images/placeholders/tiles.svg",
  lumber: "/images/placeholders/lumber.svg",
  roofing: "/images/placeholders/roofing.svg",
  equipment: "/images/placeholders/equipment.svg",
  finishes: "/images/placeholders/finishes.svg",
};

const ABSOLUTE_URL_PATTERN = /^([a-z]+:)?\/\//i;

const PUBLIC_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const INTERNAL_BASE =
  process.env.INTERNAL_API_BASE_URL ?? PUBLIC_BASE;

function getApiBaseUrl(): string {
  return typeof window === "undefined" ? INTERNAL_BASE : PUBLIC_BASE;
}

function normaliseToAbsoluteUrl(candidate: string): string | null {
  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed)) {
    if (trimmed.startsWith("//")) {
      return `https:${trimmed}`;
    }
    return trimmed;
  }

  try {
    // `new URL` gracefully handles relative paths when provided a base.
    return new URL(trimmed, getApiBaseUrl()).toString();
  } catch {
    const base = getApiBaseUrl().replace(/\/+$/, "");
    const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${base}${path}`;
  }
}

export function resolveProductImage(product: Product): string {
  const candidate = product.images?.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  if (candidate) {
    const absolute = normaliseToAbsoluteUrl(candidate);
    if (absolute) {
      return absolute;
    }
  }

  const key = product.category?.toLowerCase() ?? "";
  return FALLBACK_IMAGES[key] ?? FALLBACK_IMAGES.cement;
}

export function getProductFallbackImage(category?: string | null): string {
  const key = category?.toLowerCase() ?? "";
  return FALLBACK_IMAGES[key] ?? FALLBACK_IMAGES.cement;
}
