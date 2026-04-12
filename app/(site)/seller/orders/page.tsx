import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SellerOrdersClient } from "./seller-orders-client";
import { fetchOrdersForVendor } from "@/lib/seller/orders-for-vendor";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commandes vendeur",
  description:
    "Suivez et traitez les commandes contenant vos offres : statuts, montant de votre part et actions.",
};

export default async function SellerOrdersPage() {
  if (!isSupabaseConfigured()) {
    redirect("/seller");
  }

  const supabase = await createClient();
  if (!supabase) redirect("/seller");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/seller/orders");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor || vendor.status !== "approved") {
    return (
      <div className="rounded-3xl border border-zinc-200/90 bg-white px-6 py-10 text-center text-sm text-muted shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        Les commandes sont visibles une fois votre compte commerçant approuvé.
      </div>
    );
  }

  const { orders, error: fetchError } = await fetchOrdersForVendor(
    supabase,
    vendor.id,
  );

  if (fetchError) {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/[0.06] p-6 text-sm text-foreground">
        <p className="font-semibold">Impossible de charger les commandes</p>
        <p className="mt-2 text-muted">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <p className="max-w-xl text-sm leading-relaxed text-muted">
        Liste des commandes qui incluent au moins un de vos produits. Filtrez par statut,
        ouvrez le détail pour les lignes et les actions (acceptation, préparation, retrait).
      </p>
      <SellerOrdersClient orders={orders} />
    </div>
  );
}
