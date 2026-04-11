import { fetchMarketplaceProducts } from "@/lib/data/products";
import { MarketplaceClient } from "./marketplace-client";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const products = await fetchMarketplaceProducts();
  return <MarketplaceClient products={products} />;
}
