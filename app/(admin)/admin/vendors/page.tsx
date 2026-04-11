import { createClient } from "@/lib/supabase/server";
import { isUndefinedColumnError } from "@/lib/supabase/pg-errors";
import {
  AdminVendorsTable,
  type VendorRow,
} from "@/components/admin/tables/vendors-table";

export const dynamic = "force-dynamic";

type VendorQueryRow = Omit<VendorRow, "account_email"> & {
  profiles: { email: string | null } | { email: string | null }[] | null;
  /** Absent si la migration `profile_photo_url` n’a pas été appliquée. */
  profile_photo_url?: string | null;
};

function profileEmail(
  profiles: VendorQueryRow["profiles"],
): string | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0]?.email ?? null;
  return profiles.email ?? null;
}

export default async function AdminVendorsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <p className="text-muted">Supabase non configuré.</p>;
  }

  const selectWithPhoto = `
      id,
      user_id,
      business_name,
      business_type,
      status,
      created_at,
      updated_at,
      first_name,
      last_name,
      phone,
      location,
      id_document_url,
      storefront_photo_url,
      profile_photo_url,
      profiles ( email )
    `;

  const selectLegacy = `
      id,
      user_id,
      business_name,
      business_type,
      status,
      created_at,
      updated_at,
      first_name,
      last_name,
      phone,
      location,
      id_document_url,
      storefront_photo_url,
      profiles ( email )
    `;

  const first = await supabase
    .from("vendors")
    .select(selectWithPhoto)
    .in("status", ["pending", "approved", "suspended", "rejected"])
    .order("created_at", { ascending: false });

  let data = first.data as VendorQueryRow[] | null;
  let error = first.error;
  let migrationHint = false;
  if (error && isUndefinedColumnError(error.message, "profile_photo_url")) {
    migrationHint = true;
    const second = await supabase
      .from("vendors")
      .select(selectLegacy)
      .in("status", ["pending", "approved", "suspended", "rejected"])
      .order("created_at", { ascending: false });
    data = second.data as VendorQueryRow[] | null;
    error = second.error;
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Erreur chargement vendeurs : {error.message}
      </p>
    );
  }

  const vendors: VendorRow[] = (data ?? []).map((row) => {
    const r = row;
    const { profiles, ...rest } = r;
    return {
      ...rest,
      profile_photo_url: r.profile_photo_url ?? null,
      account_email: profileEmail(profiles),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Vendeurs
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ouvrez chaque dossier pour consulter les informations et les pièces jointes
          avant d’approuver ou de refuser une demande.
        </p>
        {migrationHint ? (
          <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
            La colonne <code className="rounded bg-black/10 px-1">profile_photo_url</code>{" "}
            manque sur Supabase. Exécutez le script{" "}
            <code className="rounded bg-black/10 px-1">
              supabase/migrations/20260410120000_vendor_profile_photo.sql
            </code>{" "}
            dans l’éditeur SQL du tableau de bord pour activer les portraits vendeurs.
          </p>
        ) : null}
      </div>
      <AdminVendorsTable vendors={vendors} />
    </div>
  );
}
