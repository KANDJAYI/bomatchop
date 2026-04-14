"use client";

import Image from "next/image";
import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminVendorMessageForm } from "@/components/admin/admin-vendor-message-form";
import {
  adminApproveVendor,
  adminGetVendorDossierSignedUrls,
  adminRejectVendor,
  adminSuspendVendor,
} from "@/app/auth/actions";
import { labelBusinessType, labelVendorStatus } from "@/lib/labels-fr";

export type VendorRow = {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  id_document_url: string | null;
  storefront_photo_url: string | null;
  profile_photo_url: string | null;
  account_email: string | null;
};

type DocCache = {
  idDocumentUrl: string | null;
  storefrontUrl: string | null;
  loaded: boolean;
};

export function AdminVendorsTable({ vendors }: { vendors: VendorRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [docCache, setDocCache] = useState<Record<string, DocCache>>({});
  const [loadingDocsId, setLoadingDocsId] = useState<string | null>(null);

  function run(
    fn: (id: string) => Promise<{ error?: string; ok?: boolean }>,
    id: string,
  ) {
    start(async () => {
      const r = await fn(id);
      if (r.error) alert(r.error);
      router.refresh();
    });
  }

  async function loadDocs(vendorId: string, force: boolean) {
    if (!force && docCache[vendorId]?.loaded) return;
    setLoadingDocsId(vendorId);
    const r = await adminGetVendorDossierSignedUrls(vendorId);
    setLoadingDocsId(null);
    if ("error" in r) {
      alert(r.error);
      return;
    }
    setDocCache((prev) => ({
      ...prev,
      [vendorId]: {
        idDocumentUrl: r.idDocumentUrl,
        storefrontUrl: r.storefrontUrl,
        loaded: true,
      },
    }));
  }

  function toggleDossier(vendorId: string) {
    if (expandedId === vendorId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(vendorId);
    void loadDocs(vendorId, false);
  }

  if (!vendors.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300/80 py-12 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        Aucun vendeur dans cette liste.
      </p>
    );
  }

  return (
    <div className="admin-panel overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#12161c]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-slate-200/90 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Commerce</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Statut</th>
              <th className="px-5 py-3.5">Contact</th>
              <th className="px-5 py-3.5">Dossier</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {vendors.map((v) => {
              const open = expandedId === v.id;
              const cache = docCache[v.id];
              const docsLoading = loadingDocsId === v.id && !cache?.loaded;
              return (
                <Fragment key={v.id}>
                  <tr className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {v.business_name}
                    </td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                  {labelBusinessType(v.business_type)}
                </td>
                    <td className="px-5 py-4">
                      <StatusPill status={v.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {v.first_name} {v.last_name}
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {v.phone}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => toggleDossier(v.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#007bff] transition hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5"
                      >
                        {open ? "Masquer" : "Voir le dossier"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        {v.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => run(adminApproveVendor, v.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                              Approuver
                            </button>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => run(adminRejectVendor, v.id)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/5"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        {v.status === "approved" && (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => run(adminSuspendVendor, v.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                          >
                            Suspendre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {open ? (
                    <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                      <td colSpan={6} className="px-5 py-6">
                        <VendorDossierPanel
                          vendor={v}
                          docCache={cache}
                          docsLoading={docsLoading}
                          onRefreshUrls={() => loadDocs(v.id, true)}
                          pending={pending}
                          onApprove={() => run(adminApproveVendor, v.id)}
                          onReject={() => run(adminRejectVendor, v.id)}
                          onSuspend={() => run(adminSuspendVendor, v.id)}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VendorDossierPanel({
  vendor: v,
  docCache,
  docsLoading,
  onRefreshUrls,
  pending,
  onApprove,
  onReject,
  onSuspend,
}: {
  vendor: VendorRow;
  docCache: DocCache | undefined;
  docsLoading: boolean;
  onRefreshUrls: () => void;
  pending: boolean;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#0e1218]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Dossier vendeur — {v.business_name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Aperçu des fichiers via liens signés (environ 1 h). Actualisez si l’image ne
            charge plus.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefreshUrls}
          disabled={docsLoading}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          {docsLoading ? "Chargement…" : "Actualiser les liens"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <dl className="grid gap-3 text-sm">
          <DossierField label="Raison sociale" value={v.business_name} />
          <DossierField
            label="Type de commerce"
            value={labelBusinessType(v.business_type)}
          />
          <DossierField label="Statut" value={<StatusPill status={v.status} />} />
          <DossierField label="Prénom" value={v.first_name} />
          <DossierField label="Nom" value={v.last_name} />
          <DossierField label="Téléphone (dossier)" value={v.phone} />
          <DossierField label="Localisation" value={v.location} />
          <DossierField
            label="E-mail du compte"
            value={v.account_email ?? "—"}
          />
          <DossierField
            label="Identifiant utilisateur"
            value={
              <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                {v.user_id}
              </span>
            }
          />
          <DossierField
            label="Créé le"
            value={new Date(v.created_at).toLocaleString("fr-FR")}
          />
          <DossierField
            label="Mis à jour"
            value={new Date(v.updated_at).toLocaleString("fr-FR")}
          />
          <DossierField
            label="Référence fichier — pièce d’identité"
            value={
              <span className="break-all font-mono text-[11px] text-slate-600 dark:text-slate-400">
                {v.id_document_url ?? "—"}
              </span>
            }
          />
          <DossierField
            label="Référence fichier — photo devanture"
            value={
              <span className="break-all font-mono text-[11px] text-slate-600 dark:text-slate-400">
                {v.storefront_photo_url ?? "—"}
              </span>
            }
          />
        </dl>

        <div className="space-y-5">
          <DocumentPreview
            title="Pièce d’identité"
            storagePath={v.id_document_url}
            signedUrl={docCache?.idDocumentUrl ?? null}
            loading={docsLoading}
          />
          <DocumentPreview
            title="Photo de la devanture du commerce"
            storagePath={v.storefront_photo_url}
            signedUrl={docCache?.storefrontUrl ?? null}
            loading={docsLoading}
          />
          {v.profile_photo_url ? (
            <div className="rounded-xl border border-slate-200/90 p-4 dark:border-white/[0.08]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Portrait annonces (public)
              </p>
              <Image
                src={v.profile_photo_url}
                alt=""
                width={112}
                height={112}
                className="mt-3 rounded-full border border-slate-200 object-cover dark:border-white/10"
              />
            </div>
          ) : (
            <p className="text-xs text-amber-700 dark:text-amber-300/90">
              Aucune photo de profil — dossier incomplet selon les règles BOMA.
            </p>
          )}
          {(v.status === "approved" || v.status === "pending" || v.status === "suspended") && (
            <AdminVendorMessageForm vendorId={v.id} />
          )}
        </div>
      </div>

      {v.status === "pending" ? (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-white/[0.06]">
          <p className="w-full text-xs font-medium text-slate-500 dark:text-slate-400">
            Après vérification des documents :
          </p>
          <button
            type="button"
            disabled={pending || docsLoading}
            onClick={onApprove}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
          >
            Approuver le vendeur
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onReject}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-slate-100 dark:hover:bg-white/5"
          >
            Refuser la demande
          </button>
        </div>
      ) : null}

      {v.status === "approved" ? (
        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-white/[0.06]">
          <button
            type="button"
            disabled={pending}
            onClick={onSuspend}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          >
            Suspendre ce commerçant
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DossierField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(8rem,11rem)_1fr] gap-2 border-b border-slate-100 pb-3 last:border-0 dark:border-white/[0.06]">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function DocumentPreview({
  title,
  storagePath,
  signedUrl,
  loading,
}: {
  title: string;
  storagePath: string | null;
  signedUrl: string | null;
  loading: boolean;
}) {
  const hasPath = Boolean(storagePath?.trim());

  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      {!hasPath ? (
        <p className="mt-2 text-xs text-slate-500">Non fourni dans la demande.</p>
      ) : loading ? (
        <div className="mt-3 flex h-40 items-center justify-center rounded-lg bg-slate-200/40 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
          Génération du lien sécurisé…
        </div>
      ) : signedUrl ? (
        <div className="mt-3 space-y-2">
          <a
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-xs font-semibold text-[#007bff] hover:underline"
          >
            Ouvrir en plein écran
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element -- URL signée Supabase, pas d'optimisation Image */}
          <img
            src={signedUrl}
            alt=""
            className="mt-1 max-h-56 w-full rounded-lg border border-slate-200/80 object-contain dark:border-white/10"
          />
        </div>
      ) : (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-200/90">
          Impossible d’afficher l’aperçu. Vérifiez les droits d’accès aux fichiers ou
          cliquez sur « Actualiser les liens ».
        </p>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:
      "bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
    approved:
      "bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
    rejected: "bg-red-500/15 text-red-800 dark:bg-red-500/20 dark:text-red-200",
    suspended:
      "bg-slate-500/15 text-slate-700 dark:bg-slate-500/25 dark:text-slate-300",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-700 dark:bg-white/10"}`}
    >
      {labelVendorStatus(status)}
    </span>
  );
}
