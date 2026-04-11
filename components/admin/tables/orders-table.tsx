"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  adminUpdateOrderStatus,
  type AdminOrderStatus,
} from "@/app/auth/actions";
import { labelOrderStatus, labelPaymentMethod } from "@/lib/labels-fr";

export type OrderAdminRow = {
  id: string;
  created_at: string;
  status: string;
  payment_method: string;
  total_amount: number;
  profiles: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

const STATUSES: AdminOrderStatus[] = [
  "pending",
  "paid",
  "preparing",
  "ready",
  "completed",
  "cancelled",
  "abandoned",
];

export function AdminOrdersTable({ orders }: { orders: OrderAdminRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onStatusChange(orderId: string, value: string) {
    const status = value as AdminOrderStatus;
    if (!STATUSES.includes(status)) return;
    start(async () => {
      const r = await adminUpdateOrderStatus(orderId, status);
      if (r.error) alert(r.error);
      router.refresh();
    });
  }

  if (!orders.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300/80 py-12 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        Aucune commande.
      </p>
    );
  }

  return (
    <div className="admin-panel overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-[#12161c]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-slate-200/90 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Réf.</th>
              <th className="px-5 py-3.5">Client</th>
              <th className="px-5 py-3.5">Paiement</th>
              <th className="px-5 py-3.5">Montant</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {orders.map((o) => {
              const c = o.profiles;
              return (
                <tr
                  key={o.id}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {String(o.id).slice(0, 8)}…
                  </td>
                  <td className="px-5 py-4 text-slate-800 dark:text-slate-200">
                    <span className="font-medium">{c?.full_name ?? "—"}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {c?.email ?? ""}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                    {labelPaymentMethod(o.payment_method)}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {Number(o.total_amount).toLocaleString("fr-FR")} FCFA
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(o.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={o.status}
                      disabled={pending}
                      onChange={(e) => onStatusChange(o.id, e.target.value)}
                      className="w-full max-w-[13rem] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm focus:border-[#007bff] focus:outline-none focus:ring-1 focus:ring-[#007bff] dark:border-white/10 dark:bg-[#0e1218] dark:text-slate-200"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {labelOrderStatus(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
