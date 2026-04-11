import { redirect } from "next/navigation";
import { SellerAccountPanel } from "@/components/seller/seller-account-panel";
import { fetchSellerVendorForLayout } from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

  const { data: vendorFull } = await supabase
    .from("vendors")
    .select("business_name, business_type, status, first_name, last_name, location, phone")
    .eq("id", vendor.id)
    .maybeSingle();

  if (!vendorFull) redirect("/seller");

  const hasProfilePhoto =
    profilePhotoColumnMissing || Boolean(vendor.profile_photo_url?.trim());

  return (
    <SellerAccountPanel
      email={user.email}
      fullName={profile?.full_name ?? ""}
      phone={profile?.phone ?? ""}
      vendor={{
        business_name: vendorFull.business_name,
        business_type: vendorFull.business_type,
        status: vendorFull.status,
        first_name: vendorFull.first_name,
        last_name: vendorFull.last_name,
        location: vendorFull.location,
        phone: vendorFull.phone,
        profile_photo_url: vendor.profile_photo_url,
      }}
      hasProfilePhoto={hasProfilePhoto}
      profilePhotoColumnMissing={profilePhotoColumnMissing}
    />
  );
}
