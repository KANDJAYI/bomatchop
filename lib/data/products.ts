import { MOCK_PRODUCTS } from "@/lib/mock-products";
import type { Product } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isUndefinedColumnError } from "@/lib/supabase/pg-errors";
import { createClient } from "@/lib/supabase/server";

const PRODUCT_SELECT_VENDORS_WITH_AVATAR = `
      id,
      name,
      description,
      image_url,
      price_original,
      price_promo,
      vendors (
        business_name,
        business_type,
        status,
        profile_photo_url
      )
    `;

const PRODUCT_SELECT_VENDORS_LEGACY = `
      id,
      name,
      description,
      image_url,
      price_original,
      price_promo,
      vendors (
        business_name,
        business_type,
        status
      )
    `;

type VendorJoin = {
  business_name: string;
  business_type: string;
  status: string;
  profile_photo_url?: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_original: string | number;
  price_promo: string | number;
  vendors: VendorJoin | VendorJoin[] | null;
};

function mapVendorType(t: string): Product["vendorType"] {
  if (t === "restaurant") return "restaurant";
  if (t === "boutique") return "boutique";
  return "supermarche";
}

export function mapProductRow(row: ProductRow): Product {
  const v = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors;
  const vendorName = v?.business_name ?? "Commerce";
  const avatar = v?.profile_photo_url?.trim();
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    image:
      row.image_url ??
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    pricePromo: Number(row.price_promo),
    priceOriginal: Number(row.price_original),
    vendorType: mapVendorType(v?.business_type ?? "supermarket"),
    vendorName,
    vendorAvatarUrl: avatar && avatar.length > 0 ? avatar : null,
  };
}

export async function fetchMarketplaceProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_PRODUCTS;
  }

  const supabase = await createClient();
  if (!supabase) {
    return [];
  }

  const listFirst = await supabase
    .from("products")
    .select(PRODUCT_SELECT_VENDORS_WITH_AVATAR)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  let data = listFirst.data as ProductRow[] | null;
  let error = listFirst.error;

  if (error && isUndefinedColumnError(error.message, "profile_photo_url")) {
    const listLegacy = await supabase
      .from("products")
      .select(PRODUCT_SELECT_VENDORS_LEGACY)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    data = listLegacy.data as ProductRow[] | null;
    error = listLegacy.error;
  }

  if (error || !data?.length) {
    return [];
  }

  return data.map(mapProductRow);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const { getProductById } = await import("@/lib/mock-products");
    return getProductById(id) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const oneFirst = await supabase
    .from("products")
    .select(PRODUCT_SELECT_VENDORS_WITH_AVATAR)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  let data = oneFirst.data as ProductRow | null;
  let error = oneFirst.error;

  if (error && isUndefinedColumnError(error.message, "profile_photo_url")) {
    const oneLegacy = await supabase
      .from("products")
      .select(PRODUCT_SELECT_VENDORS_LEGACY)
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();
    data = oneLegacy.data as ProductRow | null;
    error = oneLegacy.error;
  }

  if (error || !data) {
    return null;
  }

  const row = data;
  const v = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors;
  if (v?.status !== "approved") {
    return null;
  }

  return mapProductRow(row);
}
