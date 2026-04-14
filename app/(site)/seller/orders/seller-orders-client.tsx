"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  vendorUpdateOrderStatusAction,
  type VendorOrderActionStatus,
} from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import type { SellerOrderView } from "@/lib/seller/orders-for-vendor";
import {
  labelOrderFulfillment,
  labelOrderStatus,
  labelPaymentMethod,
} from "@/lib/labels-fr";
import { formatXAF } from "@/lib/mock-products";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80";

type Props = { orders: SellerOrderView[] };

const ORDER_THUMB_MAX = 3;

function uniqueLinesForThumbs(lines: SellerOrderView["lines"]) {
  const seen = new Set<string>();
  const out: SellerOrderView["lines"] = [];
  for (const l of lines) {
    if (seen.has(l.product_id)) continue;
    seen.add(l.product_id);
    out.push(l);
  }
  return out;
}

type OrderFilter =
  | "all"
  | "needs_action"
  | "preparing"
  | "ready"
  | "closed";

function orderMatchesFilter(o: SellerOrderView, f: OrderFilter): boolean {
  const s = o.status;
  switch (f) {
    case "all":
      return true;
    case "needs_action":
      return s === "pending" || s === "paid";
    case "preparing":
      return s === "preparing";
    case "ready":
      return s === "ready";
    case "closed":
      return (
        s === "completed" || s === "cancelled" || s === "abandoned"
      );
    default:
      return true;
  }
}

function orderStats(orders: SellerOrderView[]) {
  let needsAction = 0;
  let preparing = 0;
  let ready = 0;
  let closed = 0;
  for (const o of orders) {
    if (o.status === "pending" || o.status === "paid") needsAction += 1;
    else if (o.status === "preparing") preparing += 1;
    else if (o.status === "ready") ready += 1;
    else if (
      o.status === "completed" ||
      o.status === "cancelled" ||
      o.status === "abandoned"
    ) {
      closed += 1;
    }
  }
  return { needsAction, preparing, ready, closed };
}

const FILTER_LABELS: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "needs_action", label: "À traiter" },
  { id: "preparing", label: "En préparation" },
  { id: "ready", label: "Prêtes" },
  { id: "closed", label: "Clôturées" },
];

export function SellerOrdersClient({ orders }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = useMemo(() => orderStats(orders), [orders]);
  const filtered = useMemo(
    () => orders.filter((o) => orderMatchesFilter(o, filter)),
    [orders, filter],
  );

  function run(orderId: string, status: VendorOrderActionStatus) {
    start(async () => {
      const r = await vendorUpdateOrderStatusAction(orderId, status);
      if (r.error) showToast(r.error, "error");
      else showToast("Commande mise à jour", "success");
      router.refresh();
    });
  }

  function toggleExpand(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  if (!orders.length) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/40 sm:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-400 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <IconInboxEmpty className="h-7 w-7" />
        </div>
        <p className="mt-5 text-base font-semibold text-foreground">Aucune commande</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Dès qu’un client commande vos offres, elles apparaissent ici : tableau,
          filtres et actions pour accepter, préparer et clôturer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="À traiter"
          value={stats.needsAction}
          hint="En attente / payée"
          accent="border-amber-500/25 bg-amber-500/[0.06] text-amber-950 dark:text-amber-100"
          active={filter === "needs_action"}
          onSelect={() => setFilter("needs_action")}
        />
        <StatCard
          label="En préparation"
          value={stats.preparing}
          hint="Après acceptation"
          accent="border-boma-blue/25 bg-boma-blue/[0.06] text-foreground"
          active={filter === "preparing"}
          onSelect={() => setFilter("preparing")}
        />
        <StatCard
          label="Prêtes"
          value={stats.ready}
          hint="Retrait possible"
          accent="border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-950 dark:text-emerald-100"
          active={filter === "ready"}
          onSelect={() => setFilter("ready")}
        />
        <StatCard
          label="Clôturées"
          value={stats.closed}
          hint="Terminées / annulées"
          accent="border-zinc-300 bg-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-800/50"
          active={filter === "closed"}
          onSelect={() => setFilter("closed")}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_LABELS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              filter === f.id
                ? "bg-boma-blue text-white shadow-sm shadow-boma-blue/25"
                : "border border-zinc-200 bg-white text-muted hover:border-zinc-300 hover:text-foreground dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <p className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-muted dark:border-zinc-800 dark:bg-zinc-900/40">
          Aucune commande dans ce filtre.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/95 text-xs font-semibold uppercase tracking-wide text-muted dark:border-zinc-800 dark:bg-zinc-900/90">
                  <th className="w-10 whitespace-nowrap px-3 py-3 pl-4" scope="col" aria-label="Détail" />
                  <th className="whitespace-nowrap px-3 py-3" scope="col">
                    Photos
                  </th>
                  <th className="whitespace-nowrap px-3 py-3" scope="col">
                    Référence
                  </th>
                  <th className="whitespace-nowrap px-3 py-3" scope="col">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-3 py-3" scope="col">
                    Client
                  </th>
                  <th className="whitespace-nowrap px-3 py-3" scope="col">
                    Contact
                  </th>
                  <th className="whitespace-nowrap px-3 py-3" scope="col">
                    Statut
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 tabular-nums" scope="col">
                    Votre part
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 pr-4 text-right tabular-nums" scope="col">
                    Articles
                  </th>
                </tr>
              </thead>
              {filtered.map((o) => {
                const expanded = expandedId === o.id;
                const lineCount = o.lines.reduce((n, l) => n + l.quantity, 0);
                const canAct = o.vendor_count_reliable && o.vendor_count <= 1;
                const thumbLines = uniqueLinesForThumbs(o.lines);
                const thumbExtra =
                  thumbLines.length > ORDER_THUMB_MAX
                    ? thumbLines.length - ORDER_THUMB_MAX
                    : 0;
                const thumbShow = thumbLines.slice(0, ORDER_THUMB_MAX);
                return (
                  <tbody
                    key={o.id}
                    className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800/80"
                  >
                    <tr className="bg-white transition-colors hover:bg-zinc-50/90 dark:bg-transparent dark:hover:bg-zinc-900/40">
                      <td className="whitespace-nowrap px-3 py-3 pl-4 align-middle">
                        <button
                          type="button"
                          onClick={() => toggleExpand(o.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-muted transition-colors hover:bg-white hover:text-foreground dark:border-zinc-700 dark:hover:bg-zinc-800"
                          aria-expanded={expanded}
                          aria-label={
                            expanded ? "Masquer le détail" : "Afficher le détail"
                          }
                        >
                          <IconChevron
                            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        {thumbShow.length ? (
                          <div
                            className="flex items-center pl-0.5"
                            title={thumbLines.map((l) => l.name).join(" · ")}
                          >
                            <div className="flex -space-x-2">
                              {thumbShow.map((line) => (
                                <div
                                  key={line.product_id}
                                  className="relative z-0 h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-white bg-zinc-100 shadow-sm dark:border-zinc-900 dark:bg-zinc-800"
                                >
                                  <Image
                                    src={line.image_url?.trim() || PLACEHOLDER}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                </div>
                              ))}
                              {thumbExtra > 0 ? (
                                <div
                                  className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-white bg-zinc-200 text-[11px] font-bold tabular-nums text-zinc-700 shadow-sm dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                                  aria-label={`${thumbExtra} autre${thumbExtra > 1 ? "s" : ""}`}
                                >
                                  +{thumbExtra}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td
                        className="max-w-[7rem] truncate px-3 py-3 align-middle font-mono text-xs text-muted"
                        title={o.id}
                      >
                        {String(o.id).slice(0, 8)}…
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle text-muted">
                        {new Date(o.created_at).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="max-w-[11rem] px-3 py-3 align-middle font-medium text-foreground">
                        <span
                          className="block truncate"
                          title={o.customer.full_name ?? "Client"}
                        >
                          {o.customer.full_name ?? "Client"}
                        </span>
                      </td>
                      <td className="max-w-[10rem] px-3 py-3 align-middle text-muted">
                        <span
                          className="block truncate text-xs"
                          title={o.customer.phone ?? undefined}
                        >
                          {o.customer.phone ?? "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle">
                        <span className="inline-flex shrink-0 rounded-full bg-boma-blue/12 px-2.5 py-0.5 text-[11px] font-semibold text-boma-blue">
                          {labelOrderStatus(o.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 align-middle font-semibold tabular-nums text-foreground">
                        {formatXAF(o.vendor_subtotal)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 pr-4 text-right align-middle tabular-nums text-muted">
                        {lineCount}
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="bg-zinc-50/90 dark:bg-zinc-950/50">
                        <td colSpan={9} className="px-4 pb-5 pt-2 sm:px-6">
                          <div className="flex flex-col gap-4 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
                            <div className="flex flex-wrap items-start justify-between gap-3 text-xs text-muted">
                              <div>
                                <p>
                                  <span className="font-medium text-foreground">
                                    Paiement :
                                  </span>{" "}
                                  {labelPaymentMethod(o.payment_method)}
                                </p>
                                {o.customer.email ? (
                                  <p className="mt-1">
                                    <span className="font-medium text-foreground">
                                      E-mail :
                                    </span>{" "}
                                    {o.customer.email}
                                  </p>
                                ) : null}
                                <p className="mt-2 text-left text-[11px] leading-relaxed text-foreground">
                                  <span className="font-medium text-foreground">
                                    Réception :
                                  </span>{" "}
                                  {labelOrderFulfillment(o.fulfillment)}
                                </p>
                                {o.delivery_address ? (
                                  <p className="mt-1 max-w-xl whitespace-pre-wrap text-left text-[11px] leading-relaxed text-muted">
                                    <span className="font-medium text-foreground">
                                      Adresse :
                                    </span>{" "}
                                    {o.delivery_address}
                                  </p>
                                ) : null}
                              </div>
                              <div className="text-right">
                                {!o.vendor_count_reliable ? (
                                  <p className="max-w-sm rounded-lg bg-amber-500/10 px-3 py-2 text-left text-[11px] font-medium text-amber-950 dark:text-amber-100">
                                    Vérification multi-commerces indisponible. Total commande{" "}
                                    <strong>{formatXAF(o.total_amount)}</strong>.
                                  </p>
                                ) : o.vendor_count > 1 ? (
                                  <p className="max-w-sm rounded-lg bg-amber-500/10 px-3 py-2 text-left text-[11px] font-medium text-amber-950 dark:text-amber-100">
                                    {o.vendor_count} commerces sur cette commande. Votre part :{" "}
                                    <strong>{formatXAF(o.vendor_subtotal)}</strong> — BOMA pour le
                                    reste.
                                  </p>
                                ) : (
                                  <p className="font-semibold tabular-nums text-foreground">
                                    Total commande {formatXAF(o.total_amount)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                              Lignes concernant vos offres
                            </p>
                            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
                              {o.lines.map((line) => (
                                <li
                                  key={`${o.id}-${line.product_id}`}
                                  className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4"
                                >
                                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
                                    <Image
                                      src={line.image_url?.trim() || PLACEHOLDER}
                                      alt={line.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-foreground">{line.name}</p>
                                    <p className="text-xs text-muted">
                                      × {line.quantity} · {formatXAF(line.unit_price)} l’unité
                                    </p>
                                  </div>
                                  <p className="shrink-0 text-sm font-semibold tabular-nums text-boma-blue">
                                    {formatXAF(line.quantity * line.unit_price)}
                                  </p>
                                </li>
                              ))}
                            </ul>

                            {canAct ? (
                              <OrderActionBar
                                status={o.status}
                                pending={pending}
                                onAction={(st) => run(o.id, st)}
                              />
                            ) : (
                              <p className="rounded-lg border border-zinc-200 bg-zinc-100/80 px-3 py-2 text-center text-xs text-muted dark:border-zinc-800 dark:bg-zinc-900/80">
                                Actions vendeur indisponibles sur ce type de commande.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                );
              })}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
  active,
  onSelect,
}: {
  label: string;
  value: number;
  hint: string;
  accent: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl border px-4 py-3 text-left shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-boma-blue ${accent} ${
        active ? "ring-2 ring-boma-blue/40 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-[#070a0d]" : ""
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] opacity-75">{hint}</p>
    </button>
  );
}

function OrderActionBar({
  status,
  pending,
  onAction,
}: {
  status: string;
  pending: boolean;
  onAction: (s: VendorOrderActionStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-zinc-200/80 pt-4 dark:border-zinc-800">
      {(status === "pending" || status === "paid") && (
        <>
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            className="text-xs sm:text-sm"
            onClick={() => onAction("preparing")}
          >
            Accepter · en préparation
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            className="text-xs sm:text-sm"
            onClick={() => onAction("cancelled")}
          >
            Refuser
          </Button>
        </>
      )}
      {status === "preparing" && (
        <>
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            className="text-xs sm:text-sm"
            onClick={() => onAction("ready")}
          >
            Prêt à retirer
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            className="text-xs sm:text-sm"
            onClick={() => onAction("completed")}
          >
            Terminée (retrait effectué)
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            className="text-xs text-red-600 sm:text-sm dark:text-red-400"
            onClick={() => onAction("cancelled")}
          >
            Annuler
          </Button>
        </>
      )}
      {status === "ready" && (
        <Button
          type="button"
          variant="primary"
          disabled={pending}
          className="text-xs sm:text-sm"
          onClick={() => onAction("completed")}
        >
          Confirmer la remise au client
        </Button>
      )}
      {(status === "completed" ||
        status === "cancelled" ||
        status === "abandoned") && (
        <p className="w-full py-1 text-center text-xs text-muted">
          Aucune action sur ce statut.
        </p>
      )}
      {![
        "pending",
        "paid",
        "preparing",
        "ready",
        "completed",
        "cancelled",
        "abandoned",
      ].includes(status) && (
        <p className="text-xs text-muted">Statut « {status} » — contactez BOMA si besoin.</p>
      )}
    </div>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconInboxEmpty({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}
