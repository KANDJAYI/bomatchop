import { redirect } from "next/navigation";
import {
  SellerProductGrid,
  type SellerCatalogProduct,
} from "@/components/seller/seller-product-grid";
import { ButtonLink } from "@/components/ui/button";
import { fetchSellerVendorForLayout } from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  if (!isSupabaseConfigured()) {
    redirect("/seller");
  }

  const supabase = await createClient();
  if (!supabase) redirect("/seller");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/seller/products");

  const { vendor } = await fetchSellerVendorForLayout(supabase, user.id);
  if (!vendor || vendor.status !== "approved") {
    redirect("/seller");
  }

  const { data } = await supabase
    .from("products")
    .select(
      "id, name, price_original, price_promo, stock, status, image_url, created_at",
    )
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const products = (data ?? []) as SellerCatalogProduct[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-muted">
          Gérez vos références, prix et stocks. Chaque modification est reflétée sur le
          marché public après enregistrement.
        </p>
        <ButtonLink href="/seller/products/new" variant="primary" className="w-full shrink-0 sm:w-auto">
          + Nouvelle offre
        </ButtonLink>
      </div>
      <SellerProductGrid products={products} />
    </div>
  );
}
