import { redirect } from "next/navigation";
import { SellerProductCreateForm } from "@/components/seller/seller-product-create-form";
import { SellerProfilePhotoForm } from "@/components/seller/seller-profile-photo-form";
import { ButtonLink } from "@/components/ui/button";
import { fetchSellerVendorForLayout } from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function SellerNewProductPage() {
  if (!isSupabaseConfigured()) redirect("/seller");

  const supabase = await createClient();
  if (!supabase) redirect("/seller");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/seller/products/new");

  const { vendor, profilePhotoColumnMissing } = await fetchSellerVendorForLayout(
    supabase,
    user.id,
  );
  if (!vendor || vendor.status !== "approved") {
    redirect("/seller");
  }

  const hasProfilePhoto =
    profilePhotoColumnMissing || Boolean(vendor.profile_photo_url?.trim());

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <ButtonLink href="/seller/products" variant="ghost" className="text-sm">
        ← Retour au catalogue
      </ButtonLink>

      {!profilePhotoColumnMissing && !hasProfilePhoto ? (
        <SellerProfilePhotoForm mode="required" />
      ) : !profilePhotoColumnMissing && hasProfilePhoto ? (
        <SellerProfilePhotoForm
          mode="update"
          currentPhotoUrl={vendor.profile_photo_url}
        />
      ) : null}

      <SellerProductCreateForm
        businessType={vendor.business_type}
        disabled={!hasProfilePhoto}
      />
    </div>
  );
}
