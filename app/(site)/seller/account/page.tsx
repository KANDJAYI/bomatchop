import { redirect } from "next/navigation";
import { SellerAccountPanel } from "@/components/seller/seller-account-panel";
import { fetchSellerVendorForLayout } from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { BusinessType } from "@/lib/types";
import { isUndefinedColumnError } from "@/lib/supabase/pg-errors";

const VENDOR_ACCOUNT_FULL =
  "business_name, business_type, status, first_name, last_name, location, phone, latitude, longitude";
const VENDOR_ACCOUNT_BASE =
  "business_name, business_type, status, first_name, last_name, location, phone";

function numOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export const dynamic = "force-dynamic";

export default async function SellerAccountPage() {
  if (!isSupabaseConfigured()) redirect("/seller");

  const supabase = await createClient();
  if (!supabase) redirect("/seller");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/auth/login?next=/seller/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  const { vendor, profilePhotoColumnMissing } = await fetchSellerVendorForLayout(
    supabase,
    user.id,
  );

  if (!vendor) {
    redirect("/seller");
  }

  let vendorFullRes = await supabase
    .from("vendors")
    .select(VENDOR_ACCOUNT_FULL)
    .eq("id", vendor.id)
    .maybeSingle();

  if (
    vendorFullRes.error &&
    (isUndefinedColumnError(vendorFullRes.error.message, "latitude") ||
      isUndefinedColumnError(vendorFullRes.error.message, "longitude"))
  ) {
    vendorFullRes = await supabase
      .from("vendors")
      .select(VENDOR_ACCOUNT_BASE)
      .eq("id", vendor.id)
      .maybeSingle();
  }

  const vendorFull = vendorFullRes.data as Record<string, unknown>;
  if (!vendorFull.business_name) redirect("/seller");

  const hasProfilePhoto =
    profilePhotoColumnMissing || Boolean(vendor.profile_photo_url?.trim());

  return (
    <SellerAccountPanel
      email={user.email}
      fullName={profile?.full_name ?? ""}
      phone={profile?.phone ?? ""}
      vendor={{
        business_name: String(vendorFull.business_name),
        business_type: vendorFull.business_type as BusinessType,
        status: String(vendorFull.status),
        first_name: String(vendorFull.first_name),
        last_name: String(vendorFull.last_name),
        location: String(vendorFull.location),
        phone: String(vendorFull.phone),
        profile_photo_url: vendor.profile_photo_url,
        latitude: numOrNull(vendorFull.latitude),
        longitude: numOrNull(vendorFull.longitude),
      }}
      hasProfilePhoto={hasProfilePhoto}
      profilePhotoColumnMissing={profilePhotoColumnMissing}
    />
  );
}
