import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminUserDeleteButton } from "@/components/admin/admin-user-delete-button";
import { AdminUserEditForm } from "@/components/admin/admin-user-edit-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "client" | "vendor" | "admin";
  created_at: string;
  updated_at: string;
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return notFound();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) return notFound();

  const p = profile as Profile;

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name, status")
    .eq("user_id", id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Utilisateur
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {p.full_name ?? p.email ?? p.id}
          </h1>
        </div>
        <Link
          href="/admin/users"
          className="rounded-xl bg-black/5 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-black/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
        >
          ← Liste
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-card dark:ring-white/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Profil
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  E-mail (connexion)
                </dt>
                <dd className="mt-1 text-slate-800 dark:text-slate-100">
                  {p.email ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  ID
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-600 dark:text-slate-400">
                  {p.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Créé le
                </dt>
                <dd className="mt-1 text-slate-800 dark:text-slate-100">
                  {new Date(p.created_at).toLocaleString("fr-FR")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Mis à jour
                </dt>
                <dd className="mt-1 text-slate-800 dark:text-slate-100">
                  {new Date(p.updated_at).toLocaleString("fr-FR")}
                </dd>
              </div>
            </dl>
          </div>

          {vendor ? (
            <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 dark:bg-card dark:ring-white/10">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Commerce lié
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {vendor.business_name} — statut :{" "}
                <span className="font-medium">{vendor.status}</span>
              </p>
              <Link
                href="/admin/vendors"
                className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Ouvrir la liste vendeurs →
              </Link>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <AdminUserEditForm
            profile={{
              id: p.id,
              full_name: p.full_name,
              phone: p.phone,
              role: p.role,
            }}
          />

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 dark:bg-red-500/10">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100">
              Zone sensible
            </p>
            <p className="mt-2 text-xs text-red-800/90 dark:text-red-200/90">
              Suppression possible uniquement si aucune commande client et aucun produit vendeur. Nécessite{" "}
              <code className="rounded bg-black/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code> sur le serveur.
            </p>
            <div className="mt-4">
              <AdminUserDeleteButton userId={p.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
