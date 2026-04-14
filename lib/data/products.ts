import { MOCK_PRODUCTS } from "@/lib/mock-products";
import type { Product } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isUndefinedColumnError } from "@/lib/supabase/pg-errors";
import { createClient } from "@/lib/supabase/server";

const PRODUCT_SELECT_VENDORS_WITH_AVATAR = `
      id,
      vendor_id,
      name,
      description,
      image_url,
      price_original,
      price_promo,
      created_at,
      expires_at,
      vendors (
        business_name,
        business_type,
        status,
        profile_photo_url,
        location,
        latitude,
        longitude,
        phone,
        whatsapp_phone
      )
    `;

/** Même sélection sans latitude/longitude (migration coordonnées non appliquée). */
const PRODUCT_SELECT_VENDORS_NO_COORDS = `
      id,
      vendor_id,
      name,
      description,
      image_url,
      price_original,
      price_promo,
      created_at,
      expires_at,
      vendors (
        business_name,
        business_type,
        status,
        profile_photo_url,
        location,
        phone,
        whatsapp_phone
      )
    `;

const PRODUCT_SELECT_VENDORS_LEGACY = `
      id,
      vendor_id,
      name,
      description,
      image_url,
      price_original,
      price_promo,
      created_at,
      expires_at,
      vendors (
        business_name,
        business_type,
        status,
        phone,
        whatsapp_phone
      )
    `;

type VendorJoin = {
  business_name: string;
  business_type: string;
  status: string;
  profile_photo_url?: string | null;
  location?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  phone?: string | null;
  whatsapp_phone?: string | null;
};

type ProductRow = {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_original: string | number;
  price_promo: string | number;
  created_at?: string | null;
  expires_at?: string | null;
  vendors: VendorJoin | VendorJoin[] | null;
};

function mapVendorType(t: string): Product["vendorType"] {
  if (t === "restaurant") return "restaurant";
  /* Ancien type « boutique » en base : traité comme supermarché côté catalogue. */
  return "supermarche";
}

function parseCoord(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapProductRow(row: ProductRow): Product {
  const v = Array.isArray(row.vendors) ? row.vendors[0] : row.vendors;
  const vendorName = v?.business_name ?? "Commerce";
  const avatar = v?.profile_photo_url?.trim();
  const loc = v?.location?.trim();
  const vLat = parseCoord(v?.latitude);
  const vLng = parseCoord(v?.longitude);
  const hasShopPoint =
    vLat !== null &&
    vLng !== null &&
    vLat >= -90 &&
    vLat <= 90 &&
    vLng >= -180 &&
    vLng <= 180;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    image:
      row.image_url ??
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    pricePromo: Number(row.price_promo),
    priceOriginal: Number(row.price_original),
    createdAt: row.created_at?.trim() || new Date().toISOString(),
    vendorType: mapVendorType(v?.business_type ?? "supermarket"),
    vendorName,
    vendorId: row.vendor_id,
    vendorAvatarUrl: avatar && avatar.length > 0 ? avatar : null,
    vendorLocation: loc && loc.length > 0 ? loc : null,
    vendorLatitude: hasShopPoint ? vLat : null,
    vendorLongitude: hasShopPoint ? vLng : null,
    vendorPhone: (() => {
      const wa = v?.whatsapp_phone?.trim();
      const tel = v?.phone?.trim();
      if (wa && wa.length > 0) return wa;
      if (tel && tel.length > 0) return tel;
      return null;
    })(),
    expiresAt: row.expires_at?.trim() || null,
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

  if (
    error &&
    (isUndefinedColumnError(error.message, "latitude") ||
      isUndefinedColumnError(error.message, "longitude"))
  ) {
    const listNoCoords = await supabase
      .from("products")
      .select(PRODUCT_SELECT_VENDORS_NO_COORDS)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    data = listNoCoords.data as ProductRow[] | null;
    error = listNoCoords.error;
  }

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

  if (
    error &&
    (isUndefinedColumnError(error.message, "latitude") ||
      isUndefinedColumnError(error.message, "longitude"))
  ) {
    const oneNoCoords = await supabase
      .from("products")
      .select(PRODUCT_SELECT_VENDORS_NO_COORDS)
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();
    data = oneNoCoords.data as ProductRow | null;
    error = oneNoCoords.error;
  }

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
