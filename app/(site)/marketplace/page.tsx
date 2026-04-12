import { fetchMarketplaceProducts } from "@/lib/data/products";
import type { VendorType } from "@/lib/types";
import { MarketplaceClient } from "./marketplace-client";

export const dynamic = "force-dynamic";

function parseMarketplaceType(
  raw: string | string[] | undefined,
): "all" | VendorType {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "restaurant" || v === "supermarche" || v === "boutique") {
    return v;
  }
  return "all";
}

function parseQuery(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return typeof v === "string" ? v.trim() : "";
}

type PageProps = {
  searchParams: Promise<{ type?: string | string[]; q?: string | string[] }>;
};

export default async function MarketplacePage({ searchParams }: PageProps) {
  const products = await fetchMarketplaceProducts();
  const sp = await searchParams;
  const initialType = parseMarketplaceType(sp.type);
  const initialQuery = parseQuery(sp.q);
  return (
    <MarketplaceClient
      products={products}
      initialType={initialType}
      initialQuery={initialQuery}
    />
  );
}
