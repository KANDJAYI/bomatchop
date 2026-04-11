import { createClient } from "@/lib/supabase/server";
import {
  AdminProductsTable,
  type ProductAdminRow,
} from "@/components/admin/tables/products-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-muted">Supabase non configuré.</p>;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, status, price_promo, image_url, vendors ( business_name )",
    )
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Erreur chargement produits : {error.message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Produits
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bloquer une offre (statut « bloqué ») — elle disparaît du marché public.
        </p>
      </div>
      <AdminProductsTable products={(data ?? []) as ProductAdminRow[]} />
    </div>
  );
}
