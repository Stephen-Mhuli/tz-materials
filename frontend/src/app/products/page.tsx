import { ProductsCatalogue } from "@/components/ProductsCatalogue";
import { ProductsHero, ProductsOverviewHeader } from "@/components/ProductsHero";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function ProductsPage() {
  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    products = await fetchProducts();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Something went wrong while loading products.";
  }

  if (errorMessage) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Catalogue
          </p>
          <h1 className="text-3xl font-semibold text-primary">
            LMGa materials catalogue
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
        <ProductsCatalogue products={products} />
      </section>
    </div>
  );
}
