import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isUndefinedColumnError } from "@/lib/supabase/pg-errors";
import {
  VendorSubscriptionAdminForm,
  type VendorSubscriptionTarget,
} from "@/components/admin/vendor-subscription-admin-form";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  business_name: string;
  phone: string;
  subscription_last_paid_at?: string | null;
  subscription_next_due_at?: string | null;
  subscription_note?: string | null;
};

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Supabase non configuré.</p>;
  }

  const selectFull = `
    id,
    business_name,
    phone,
    subscription_last_paid_at,
    subscription_next_due_at,
    subscription_note
  `;

  const selectNoSub = `
    id,
    business_name,
    phone
  `;

  const first = await supabase
    .from("vendors")
    .select(selectFull)
    .eq("status", "approved")
    .order("business_name", { ascending: true });

  let migrationHint = false;
  let rows: Row[] = [];

  if (first.error && isUndefinedColumnError(first.error.message, "subscription_next_due_at")) {
    migrationHint = true;
    const second = await supabase
      .from("vendors")
      .select(selectNoSub)
      .eq("status", "approved")
      .order("business_name", { ascending: true });
    if (second.error) {
      return (
        <p className="text-sm text-red-500">
          Erreur chargement abonnements : {second.error.message}
        </p>
      );
    }
    rows = (second.data ?? []) as Row[];
  } else if (first.error) {
    return (
      <p className="text-sm text-red-500">
        Erreur chargement abonnements : {first.error.message}
      </p>
    );
  } else {
    rows = (first.data ?? []) as Row[];
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Abonnements vendeurs
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enregistrez les paiements et les prochaines échéances pour chaque commerce approuvé.
          Les rappels (bandeau et toast) s’appuient sur la date d’échéance. Le{" "}
          <Link href="/admin/vendors" className="font-semibold text-[#007bff] hover:underline">
            dossier vendeur
          </Link>{" "}
          reste disponible pour la modération complète.
        </p>
        {migrationHint ? (
          <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            Colonnes d’abonnement absentes : exécutez la migration{" "}
            <code className="rounded bg-black/10 px-1">
              supabase/migrations/20260419180000_vendor_subscription_billing.sql
            </code>{" "}
            sur Supabase pour activer cette page.
          </p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300/80 py-12 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          Aucun commerce approuvé pour l’instant.
        </p>
      ) : (
        <ul className="space-y-6">
          {rows.map((row) => {
            const target: VendorSubscriptionTarget = {
              id: row.id,
              business_name: row.business_name,
              subscription_last_paid_at: row.subscription_last_paid_at ?? null,
              subscription_next_due_at: row.subscription_next_due_at ?? null,
              subscription_note: row.subscription_note ?? null,
            };
            return (
              <li
                key={row.id}
                className="admin-panel rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#12161c]"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      {row.business_name}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {row.phone}
                    </p>
                  </div>
                  <Link
                    href="/admin/vendors"
                    className="shrink-0 text-xs font-semibold text-[#007bff] hover:underline"
                  >
                    Voir le dossier (liste vendeurs)
                  </Link>
                </div>
                <VendorSubscriptionAdminForm
                  key={`${row.id}-${target.subscription_last_paid_at ?? ""}-${target.subscription_next_due_at ?? ""}`}
                  vendor={target}
                  heading={`Paiement — ${row.business_name}`}
                  compactDescription
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
