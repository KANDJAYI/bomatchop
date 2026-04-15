import { redirect } from "next/navigation";
import {
  AdminUsersTable,
  type AdminUserRow,
} from "@/components/admin/tables/users-table";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ROLES = ["client", "vendor", "admin"] as const;

function parseRole(raw: string | string[] | undefined): "all" | AdminUserRow["role"] {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "client" || v === "vendor" || v === "admin") return v;
  return "all";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-muted">Supabase non configuré.</p>;
  }

  const sp = await searchParams;
  const roleFilter = parseRole(sp.role);

  let q = supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (roleFilter !== "all") {
    q = q.eq("role", roleFilter);
  }

  const { data, error } = await q;

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Erreur chargement utilisateurs : {error.message}
      </p>
    );
  }

  const users = (data ?? []) as AdminUserRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Utilisateurs
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gérez les comptes (clients, vendeurs, administrateurs) : rôles et          coordonnées.
        </p>
      </div>
      <AdminUsersTable users={users} roleFilter={roleFilter} />
    </div>
  );
}
