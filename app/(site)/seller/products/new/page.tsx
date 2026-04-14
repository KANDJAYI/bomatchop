import { redirect } from "next/navigation";
import { SellerProductCreateForm } from "@/components/seller/seller-product-create-form";
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
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-50">
          <p className="font-medium text-foreground dark:text-amber-50">
            Photo de profil commerçant requise
          </p>
          <p className="mt-2 leading-relaxed text-muted dark:text-amber-100/90">
            Pour publier une offre, ajoutez d’abord un portrait clair (visage visible) dans
            vos paramètres.
          </p>
          <ButtonLink href="/seller/parametres" variant="primary" className="mt-4">
            Ouvrir Paramètres
          </ButtonLink>
        </div>
      ) : null}

      <SellerProductCreateForm
        businessType={vendor.business_type}
        disabled={!hasProfilePhoto}
      />
    </div>
  );
}
