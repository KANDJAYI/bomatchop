import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminDashboardStats } from "@/lib/admin/stats";
import { labelOrderStatus } from "@/lib/labels-fr";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const supabase = await createClient();

  let pendingSnippet: { id: string; business_name: string; created_at: string }[] =
    [];
  let recentOrders: {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
  }[] = [];

  if (supabase) {
    const [vRes, oRes] = await Promise.all([
      supabase
        .from("vendors")
        .select("id, business_name, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("orders")
        .select("id, created_at, total_amount, status")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    pendingSnippet = (vRes.data ?? []) as typeof pendingSnippet;
    recentOrders = (oRes.data ?? []) as typeof recentOrders;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <section>
        <h2 className="sr-only">Indicateurs</h2>
        {!stats ? (
          <p className="rounded-2xl border border-dashed border-slate-300/80 p-6 text-sm text-slate-600 dark:border-white/10 dark:text-slate-400">
            Supabase non configuré — impossible de charger les statistiques.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Vendeurs en attente"
              value={stats.pendingVendors}
              hint="Dossiers à traiter"
              accent="amber"
            />
            <StatCard
              label="Commerces actifs"
              value={stats.approvedVendors}
              hint="Comptes approuvés"
              accent="emerald"
            />
            <StatCard
              label="Produits actifs"
              value={stats.activeProducts}
              hint={`${stats.blockedProducts} bloqué(s)`}
              accent="blue"
            />
            <StatCard
              label="Commandes (7 j.)"
              value={stats.ordersLast7Days}
              hint={`${stats.totalOrders} au total · ${stats.clientProfiles} clients`}
              accent="violet"
            />
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="admin-panel rounded-2xl bg-white p-6 shadow-sm dark:bg-[#12161c]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Dossiers vendeurs en attente
            </h2>
            <Link
              href="/admin/vendors"
              className="text-xs font-semibold text-[#007bff] hover:underline"
            >
              Tout voir
            </Link>
          </div>
          {pendingSnippet.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucune demande en attente.
            </p>
          ) : (
            <ul className="space-y-3">
              {pendingSnippet.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {v.business_name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(v.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel rounded-2xl bg-white p-6 shadow-sm dark:bg-[#12161c]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Dernières commandes
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#007bff] hover:underline"
            >
              Tout voir
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucune commande pour l’instant.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-4 py-2.5 dark:border-white/[0.06]"
                >
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                    {String(o.id).slice(0, 8)}…
                  </span>
                  <span className="text-xs text-slate-500">
                    {labelOrderStatus(o.status)}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {Number(o.total_amount).toLocaleString("fr-FR")} FCFA
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-panel rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 dark:from-[#12161c] dark:to-[#0e1218]">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Raccourcis
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/vendors"
            className="rounded-xl bg-[#0b3d2e] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95"
          >
            Modérer les vendeurs
          </Link>
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-100 dark:hover:bg-white/5"
          >
            Modérer les produits
          </Link>
          <Link
            href="/admin/clients"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-100 dark:hover:bg-white/5"
          >
            Base clients
          </Link>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Astuce : promouvoir un admin via SQL —{" "}
          <code className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[11px] dark:bg-white/10">
            {`update public.profiles set role = 'admin' where email = 'vous@domaine.com';`}
          </code>
        </p>
      </section>
    </div>
  );
}
