import { createClient } from "@/lib/supabase/server";
import {
  AdminOrdersTable,
  type OrderAdminRow,
} from "@/components/admin/tables/orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-muted">Supabase non configuré.</p>;
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      status,
      payment_method,
      total_amount,
      fulfillment,
      delivery_address,
      profiles!orders_customer_id_fkey ( full_name, email, phone )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Erreur chargement commandes : {error.message}
      </p>
    );
  }

  const rows = (data ?? []) as unknown as OrderAdminRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Commandes
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Suivi des commandes — modifiez le statut pour refléter la préparation et la
          livraison.
        </p>
      </div>
      <AdminOrdersTable orders={rows} />
    </div>
  );
}
