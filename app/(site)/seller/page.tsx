import {
  SellerDashboardClient,
  type SellerProductRow,
  type VendorRow,
} from "./seller-dashboard-client";
import { fetchSellerVendorForLayout } from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function SellerPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-16 text-center text-muted">
        Configurez Supabase dans <code>.env.local</code> pour activer l’espace vendeur.
      </div>
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-16 text-center text-muted">
        Impossible d’initialiser Supabase.
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { vendor, profilePhotoColumnMissing } = await fetchSellerVendorForLayout(
    supabase,
    user.id,
  );

  let products: SellerProductRow[] = [];
  if (vendor?.status === "approved") {
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, price_original, price_promo, stock, status, image_url, created_at, expires_at",
      )
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });
    products = (data ?? []) as SellerProductRow[];
  }

  return (
    <SellerDashboardClient
      vendor={vendor as VendorRow | null}
      products={products}
      hasProfilePhoto={
        profilePhotoColumnMissing ||
        Boolean(vendor?.profile_photo_url?.trim())
      }
      profilePhotoColumnMissing={profilePhotoColumnMissing}
    />
  );
}
