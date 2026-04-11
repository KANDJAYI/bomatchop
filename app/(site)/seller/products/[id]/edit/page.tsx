import { notFound, redirect } from "next/navigation";
import { SellerProductEditForm } from "@/components/seller/seller-product-edit-form";
import { ButtonLink } from "@/components/ui/button";
import { fetchSellerVendorForLayout } from "@/lib/seller/layout-context";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function SellerEditProductPage({ params }: Props) {
  const { id } = await params;

  if (!isSupabaseConfigured()) redirect("/seller");

  const supabase = await createClient();
  if (!supabase) redirect("/seller");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?next=/seller/products/${id}/edit`);

  const { vendor } = await fetchSellerVendorForLayout(supabase, user.id);
  if (!vendor || vendor.status !== "approved") {
    redirect("/seller");
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, vendor_id, name, description, image_url, price_original, price_promo, stock, status, expires_at, prepared_at, consume_by",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !product || product.vendor_id !== vendor.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ButtonLink href="/seller/products" variant="ghost" className="text-sm">
        ← Retour au catalogue
      </ButtonLink>
      <SellerProductEditForm
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          image_url: product.image_url,
          price_original: Number(product.price_original),
          price_promo: Number(product.price_promo),
          stock: Number(product.stock),
          status: product.status,
          expires_at: product.expires_at,
          prepared_at: product.prepared_at,
          consume_by: product.consume_by,
        }}
        businessType={vendor.business_type}
      />
    </div>
  );
}
