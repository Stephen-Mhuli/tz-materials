import { ProductsCatalogue } from "@/components/ProductsCatalogue";
import { ProductsError } from "@/components/ProductsError";
import { ProductsHero, ProductsOverviewHeader } from "@/components/ProductsHero";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export default async function ProductsPage() {
  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    products = await fetchProducts({ revalidate: 60 });
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Something went wrong while loading products.";
  }

  if (errorMessage) {
    return <ProductsError message={errorMessage} />;
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
