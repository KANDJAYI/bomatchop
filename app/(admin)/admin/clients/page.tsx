import { createClient } from "@/lib/supabase/server";
import {
  AdminClientsTable,
  type ClientProfileRow,
} from "@/components/admin/tables/clients-table";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-muted">Supabase non configuré.</p>;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Erreur chargement clients : {error.message}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Clients
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Comptes acheteurs enregistrés sur la plateforme (profil « client »).
        </p>
      </div>
      <AdminClientsTable clients={(data ?? []) as ClientProfileRow[]} />
    </div>
  );
}
