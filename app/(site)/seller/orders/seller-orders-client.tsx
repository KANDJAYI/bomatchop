"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  vendorUpdateOrderStatusAction,
  type VendorOrderActionStatus,
} from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import type { SellerOrderView } from "@/lib/seller/orders-for-vendor";
import { labelOrderStatus, labelPaymentMethod } from "@/lib/labels-fr";
import { formatXAF } from "@/lib/mock-products";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80";

type Props = { orders: SellerOrderView[] };

export function SellerOrdersClient({ orders }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, start] = useTransition();

  function run(orderId: string, status: VendorOrderActionStatus) {
    start(async () => {
      const r = await vendorUpdateOrderStatusAction(orderId, status);
      if (r.error) showToast(r.error, "error");
      else showToast("Commande mise à jour", "success");
      router.refresh();
    });
  }

  if (!orders.length) {
    return (
      <div className="boma-panel rounded-3xl bg-card/80 p-12 text-center">
        <p className="text-sm font-medium text-foreground">Aucune commande pour l’instant</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Lorsqu’un client commande vos produits, la commande apparaît ici. Vous pourrez
          l’accepter, la préparer et la marquer comme prête ou terminée.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Validez chaque commande qui ne concerne <strong>que votre commerce</strong>. Si une
        commande mélange plusieurs boutiques, seul le support BOMA peut faire avancer le
        statut.
      </p>
      <ul className="space-y-5">
        {orders.map((o) => (
          <li
            key={o.id}
            className="boma-panel overflow-hidden rounded-3xl bg-card shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200/80 p-5 dark:border-white/[0.08] sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs text-muted">
                  Réf. {String(o.id).slice(0, 8)}…
                </p>
                <p className="mt-1 text-sm text-muted">
                  {new Date(o.created_at).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight">
                  {o.customer.full_name ?? "Client"}
                </p>
                <p className="text-sm text-muted">{o.customer.phone ?? "—"}</p>
                {o.customer.email ? (
                  <p className="text-xs text-muted">{o.customer.email}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className="rounded-full bg-boma-blue/12 px-3 py-1 text-xs font-semibold text-boma-blue">
                  {labelOrderStatus(o.status)}
                </span>
                <span className="text-xs text-muted">
                  {labelPaymentMethod(o.payment_method)}
                </span>
                {!o.vendor_count_reliable ? (
                  <span className="max-w-xs rounded-xl bg-slate-500/15 px-3 py-2 text-xs font-medium text-foreground">
                    Impossible de vérifier le type de commande (migration Supabase ou réseau).
                    Appliquez les migrations BOMA puis rechargez — vos actions seront débloquées.
                    Part affichée <strong>{formatXAF(o.vendor_subtotal)}</strong>, total commande{" "}
                    <strong>{formatXAF(o.total_amount)}</strong>.
                  </span>
                ) : o.vendor_count > 1 ? (
                  <span className="max-w-xs rounded-xl bg-amber-500/15 px-3 py-2 text-xs font-medium text-amber-950 dark:text-amber-100">
                    Commande multi-commerces ({o.vendor_count} vendeurs). Votre part :{" "}
                    <strong>{formatXAF(o.vendor_subtotal)}</strong> — contactez BOMA pour le
                    suivi global.
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    Total {formatXAF(o.total_amount)}
                  </span>
                )}
              </div>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {o.lines.map((line) => (
                <li
                  key={`${o.id}-${line.product_id}`}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-foreground/5">
                    <Image
                      src={line.image_url?.trim() || PLACEHOLDER}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{line.name}</p>
                    <p className="text-xs text-muted">
                      × {line.quantity} · {formatXAF(line.unit_price)} l’unité
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-boma-blue">
                    {formatXAF(line.quantity * line.unit_price)}
                  </p>
                </li>
              ))}
            </ul>

            {o.vendor_count_reliable && o.vendor_count <= 1 && (
              <div className="flex flex-wrap gap-2 border-t border-slate-200/80 bg-foreground/[0.02] p-4 dark:border-white/[0.08]">
                {(o.status === "pending" || o.status === "paid") && (
                  <>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={pending}
                      className="text-xs sm:text-sm"
                      onClick={() => run(o.id, "preparing")}
                    >
                      Accepter · en préparation
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={pending}
                      className="text-xs sm:text-sm"
                      onClick={() => run(o.id, "cancelled")}
                    >
                      Refuser
                    </Button>
                  </>
                )}
                {o.status === "preparing" && (
                  <>
                    <Button
                      type="button"
                      variant="primary"
                      disabled={pending}
                      className="text-xs sm:text-sm"
                      onClick={() => run(o.id, "ready")}
                    >
                      Prêt à retirer
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={pending}
                      className="text-xs sm:text-sm"
                      onClick={() => run(o.id, "completed")}
                    >
                      Terminée (retrait effectué)
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={pending}
                      className="text-xs text-red-600 sm:text-sm dark:text-red-400"
                      onClick={() => run(o.id, "cancelled")}
                    >
                      Annuler
                    </Button>
                  </>
                )}
                {o.status === "ready" && (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={pending}
                    className="text-xs sm:text-sm"
                    onClick={() => run(o.id, "completed")}
                  >
                    Confirmer la remise au client
                  </Button>
                )}
                {(o.status === "completed" ||
                  o.status === "cancelled" ||
                  o.status === "abandoned") && (
                  <p className="w-full py-1 text-center text-xs text-muted">
                    Aucune action disponible sur ce statut.
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
