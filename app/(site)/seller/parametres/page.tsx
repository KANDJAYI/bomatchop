import { redirect } from "next/navigation";
import { SellerProfilePhotoForm } from "@/components/seller/seller-profile-photo-form";
import { SellerVendorWhatsAppForm } from "@/components/seller/seller-vendor-whatsapp-form";
import { ButtonLink } from "@/components/ui/button";
import { fetchSellerVendorForLayout } from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function SellerParametresPage() {
  if (!isSupabaseConfigured()) redirect("/seller");

  const supabase = await createClient();
  if (!supabase) redirect("/seller");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/seller/parametres");

  const { vendor, profilePhotoColumnMissing, whatsappColumnMissing } =
    await fetchSellerVendorForLayout(supabase, user.id);
  if (!vendor || vendor.status !== "approved") {
    redirect("/seller");
  }

  const hasProfilePhoto =
    profilePhotoColumnMissing || Boolean(vendor.profile_photo_url?.trim());

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <ButtonLink href="/seller" variant="ghost" className="text-sm">
        ← Retour au tableau de bord
      </ButtonLink>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Paramètres</h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Photo utilisée sur vos annonces, numéro WhatsApp pour le retrait (restaurants), et
          autres réglages du commerce.
        </p>
      </div>

      {profilePhotoColumnMissing ? (
        <p className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Votre base Supabase n’a pas encore la colonne{" "}
          <code className="rounded bg-black/10 px-1">profile_photo_url</code>. Exécutez la
          migration{" "}
          <code className="rounded bg-black/10 px-1">
            supabase/migrations/20260410120000_vendor_profile_photo.sql
          </code>{" "}
          dans l’éditeur SQL Supabase pour activer la photo de profil.
        </p>
      ) : !hasProfilePhoto ? (
        <SellerProfilePhotoForm mode="required" />
      ) : (
        <SellerProfilePhotoForm
          mode="update"
          currentPhotoUrl={vendor.profile_photo_url}
        />
      )}

      {vendor.business_type === "restaurant" ? (
        <SellerVendorWhatsAppForm
          key={vendor.whatsapp_phone ?? "wa-empty"}
          initialValue={vendor.whatsapp_phone?.trim() ?? null}
          columnMissing={whatsappColumnMissing}
        />
      ) : null}
    </div>
  );
}
