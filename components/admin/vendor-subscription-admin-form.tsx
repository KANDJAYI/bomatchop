"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  adminSetVendorSubscriptionAction,
  adminWipeVendorSubscriptionAction,
} from "@/app/auth/actions";

/** Champs minimum pour le formulaire d’abonnement (réutilisable hors tableau vendeurs). */
export type VendorSubscriptionTarget = {
  id: string;
  business_name: string;
  subscription_last_paid_at: string | null;
  subscription_next_due_at: string | null;
  subscription_note: string | null;
};

function isoToDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  vendor: VendorSubscriptionTarget;
  /** Texte du titre (ex. « Abonnement » ou nom du commerce seul en page dédiée). */
  heading?: string;
  compactDescription?: boolean;
};

export function VendorSubscriptionAdminForm({
  vendor,
  heading = "Abonnement",
  compactDescription = false,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [clear, setClear] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await adminSetVendorSubscriptionAction(fd);
      if (r.error) alert(r.error);
      else router.refresh();
    });
  }

  function wipeAll() {
    if (
      !confirm(
        "Supprimer toutes les données d’abonnement (dates et note) pour ce commerce ?",
      )
    ) {
      return;
    }
    start(async () => {
      const r = await adminWipeVendorSubscriptionAction(vendor.id);
      if (r.error) alert(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 dark:border-emerald-400/30 dark:bg-emerald-400/10">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{heading}</h4>
      {!compactDescription ? (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Indiquez la date de paiement et la prochaine échéance : un bandeau et un toast
          rappellent les commerces à renouveler dans les 14 jours (ou en retard).
        </p>
      ) : null}
      <form className={`space-y-3 ${compactDescription ? "mt-2" : "mt-3"}`} onSubmit={onSubmit}>
        <input type="hidden" name="vendor_id" value={vendor.id} />
        <label className="flex cursor-pointer items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            name="clear_schedule"
            value="1"
            checked={clear}
            onChange={(e) => setClear(e.target.checked)}
            className="mt-0.5 rounded border-slate-300"
          />
          <span>
            Effacer le calendrier d’abonnement (dates supprimées ; la note ci-dessous est
            conservée si renseignée).
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Date du paiement
            </label>
            <input
              type="date"
              name="paid_at"
              disabled={clear}
              defaultValue={
                isoToDateInputValue(vendor.subscription_last_paid_at) || todayInputValue()
              }
              required={!clear}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0e1218]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Prochaine échéance
            </label>
            <input
              type="date"
              name="next_due_at"
              disabled={clear}
              defaultValue={isoToDateInputValue(vendor.subscription_next_due_at)}
              required={!clear}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0e1218]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Note interne (facultatif)
          </label>
          <textarea
            name="subscription_note"
            rows={2}
            defaultValue={vendor.subscription_note ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0e1218]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Enregistrer l’abonnement"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={wipeAll}
            className="rounded-lg border border-red-300/80 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
          >
            Tout supprimer (abonnement)
          </button>
        </div>
      </form>
    </div>
  );
}
