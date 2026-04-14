import { fetchMarketplaceProducts } from "@/lib/data/products";
import type { VendorType } from "@/lib/types";

function parseType(v: string | null): "all" | VendorType {
  if (v === "restaurant" || v === "supermarche") return v;
  return "all";
}

function parseQuery(v: string | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function parseMaxPrice(v: string | null): number {
  const n = v ? Number(v) : NaN;
  if (!Number.isFinite(n)) return 50_000;
  return Math.max(0, Math.min(1_000_000, n));
}

function parseLimit(v: string | null): number | null {
  const n = v ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(30, Math.floor(n)));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = parseQuery(searchParams.get("q"));
  const type = parseType(searchParams.get("type"));
  const maxPrice = parseMaxPrice(searchParams.get("maxPrice"));
  const limit = parseLimit(searchParams.get("limit"));

  const products = await fetchMarketplaceProducts();
  const ql = q.toLowerCase();

  let results = products.filter((p) => {
    if (type !== "all" && p.vendorType !== type) return false;
    if (p.pricePromo > maxPrice) return false;
    if (!ql) return true;
    return (
      p.name.toLowerCase().includes(ql) || p.vendorName.toLowerCase().includes(ql)
    );
  });

  if (limit !== null) {
    results = results.slice(0, limit);
  }

  return Response.json({ results });
}

