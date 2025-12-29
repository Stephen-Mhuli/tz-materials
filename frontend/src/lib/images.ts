import type { Product } from "@/lib/types";

const FALLBACK_IMAGES: Record<string, string> = {
  cement: "/images/placeholders/cement.svg",
  steel: "/images/placeholders/steel.svg",
  rebar: "/images/placeholders/rebar.svg",
  "structural-steel": "/images/placeholders/structural-steel.svg",
  aggregates: "/images/placeholders/aggregates.svg",
  sand: "/images/placeholders/sand.svg",
  gravel: "/images/placeholders/gravel.svg",
  "crushed-stone": "/images/placeholders/crushed-stone.svg",
  blocks: "/images/placeholders/blocks.svg",
  bricks: "/images/placeholders/bricks.svg",
  equipment: "/images/placeholders/equipment.svg",
  scaffolding: "/images/placeholders/scaffolding.svg",
  finishes: "/images/placeholders/finishes.svg",
  lumber: "/images/placeholders/lumber.svg",
  tiles: "/images/placeholders/tiles.svg",
  roofing: "/images/placeholders/roofing.svg",
  flooring: "/images/placeholders/flooring.svg",
  paint: "/images/placeholders/paint.svg",
  doors: "/images/placeholders/doors.svg",
  windows: "/images/placeholders/windows.svg",
  glass: "/images/placeholders/glass.svg",
  plumbing: "/images/placeholders/plumbing.svg",
  electrical: "/images/placeholders/electrical.svg",
  lighting: "/images/placeholders/lighting.svg",
  sanitary: "/images/placeholders/sanitary.svg",
  pipes: "/images/placeholders/pipes.svg",
  insulation: "/images/placeholders/insulation.svg",
  waterproofing: "/images/placeholders/waterproofing.svg",
  adhesives: "/images/placeholders/adhesives.svg",
  sealants: "/images/placeholders/sealants.svg",
  hardware: "/images/placeholders/hardware.svg",
  fasteners: "/images/placeholders/fasteners.svg",
  tools: "/images/placeholders/tools.svg",
  landscaping: "/images/placeholders/landscaping.svg",
  "road-works": "/images/placeholders/road-works.svg",
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

export function resolveImageUrls(images?: string[] | null): string[] {
  if (!images?.length) return [];
  const normalized = images
    .map((value) =>
      typeof value === "string" ? normaliseToAbsoluteUrl(value) : null,
    )
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(normalized));
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

export function resolveProductImages(product: Product): string[] {
  const images = resolveImageUrls(product.images);
  if (images.length > 0) return images;
  return [getProductFallbackImage(product.category)];
}

export function getProductFallbackImage(category?: string | null): string {
  const key = category?.toLowerCase() ?? "";
  return FALLBACK_IMAGES[key] ?? FALLBACK_IMAGES.cement;
}
