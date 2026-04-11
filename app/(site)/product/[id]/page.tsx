import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { fetchProductById } from "@/lib/data/products";
import { ProductDetail } from "./product-detail";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Produit introuvable</h1>
        <p className="text-muted">
          Cette offre n’existe plus ou a été retirée.
        </p>
        <ButtonLink href="/marketplace">Retour au marché</ButtonLink>
      </div>
    );
  }
  return <ProductDetail product={product} />;
}
