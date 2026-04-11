import { SellerOrdersClient } from "./seller-orders-client";
import { fetchOrdersForVendor } from "@/lib/seller/orders-for-vendor";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted">
        Configurez Supabase pour voir les commandes.
      </p>
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-sm text-muted">Connexion indisponible.</p>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor || vendor.status !== "approved") {
    return (
      <div className="boma-panel rounded-3xl bg-card/80 p-8 text-center text-sm text-muted">
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
      <div className="boma-panel rounded-3xl border border-red-500/25 bg-red-500/5 p-6 text-sm text-foreground">
        <p className="font-medium">Impossible de charger les commandes</p>
        <p className="mt-2 text-muted">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Commandes clients
        </h2>
        <p className="mt-1 text-sm text-muted">
          Traitez les commandes contenant vos offres : acceptation, préparation, prêt à
          retirer, clôture.
        </p>
      </div>
      <SellerOrdersClient orders={orders} />
    </div>
  );
}
