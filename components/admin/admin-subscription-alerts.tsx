"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useToast } from "@/context/toast-context";

export type AdminSubscriptionAlert = {
  id: string;
  business_name: string;
  subscription_next_due_at: string;
};

type Props = {
  alerts: AdminSubscriptionAlert[];
};

function startOfTodayUtc(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function utcDateOnly(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NaN;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function AdminSubscriptionAlerts({ alerts }: Props) {
  const { showToast } = useToast();
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (alerts.length === 0 || toastShownRef.current) return;
    const day = new Date().toISOString().slice(0, 10);
    const key = `boma_admin_sub_reminder_${day}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    toastShownRef.current = true;
    const n = alerts.length;
    showToast(
      n === 1
        ? "Rappel abonnement : 1 commerce a une échéance dans les 14 jours ou est en retard."
        : `Rappel abonnements : ${n} commerces ont une échéance dans les 14 jours ou sont en retard.`,
      "info",
      { durationMs: 8000 },
    );
  }, [alerts.length, showToast]);

  if (alerts.length === 0) return null;

  const today = startOfTodayUtc();

  return (
    <div className="shrink-0 border-b border-amber-500/25 bg-amber-500/[0.12] px-4 py-3 dark:border-amber-400/20 dark:bg-amber-400/10 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-950 dark:text-amber-50">
            Abonnements — échéances à venir (14 j.) ou en retard
          </p>
          <p className="mt-0.5 text-xs text-amber-900/90 dark:text-amber-100/85">
            Enregistrez les paiements dans{" "}
            <Link href="/admin/vendors" className="font-semibold underline">
              Vendeurs
            </Link>{" "}
            (dossier du commerce).
          </p>
        </div>
        <Link
          href="/admin/vendors"
          className="shrink-0 rounded-lg bg-amber-950/90 px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100"
        >
          Ouvrir la liste
        </Link>
      </div>
      <ul className="mt-3 max-h-32 space-y-1.5 overflow-y-auto text-xs">
        {alerts.map((a) => {
          const dueDay = utcDateOnly(a.subscription_next_due_at);
          const overdue = !Number.isNaN(dueDay) && dueDay < today;
          return (
            <li key={a.id}>
              <Link
                href="/admin/vendors"
                className={`font-medium underline-offset-2 hover:underline ${
                  overdue
                    ? "text-red-800 dark:text-red-200"
                    : "text-amber-950 dark:text-amber-50"
                }`}
              >
                {a.business_name}
              </Link>
              <span className="text-amber-900/80 dark:text-amber-100/75">
                {" "}
                —{" "}
                {overdue ? "en retard · " : null}
                échéance{" "}
                {new Date(a.subscription_next_due_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
