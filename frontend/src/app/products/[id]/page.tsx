import { notFound } from "next/navigation";
import { fetchProductById } from "@/lib/api";
import { ProductDetailContent } from "@/components/ProductDetailContent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const product = await fetchProductById(id);
    return <ProductDetailContent product={product} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}
