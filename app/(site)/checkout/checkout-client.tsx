"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  finalizeCheckoutAction,
  recordCheckoutAbandonAction,
} from "@/app/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { groupCartLinesByVendor } from "@/lib/cart-vendor-groups";
import { formatXAF } from "@/lib/mock-products";
import type { PaymentMethod } from "@/lib/types";

const PAYMENT_CHOICES: {
  value: PaymentMethod;
  label: string;
  description: string;
  logoSrc: string;
}[] = [
  {
    value: "cash_on_delivery",
    label: "À la livraison",
    description: "Réglez en espèces ou par mobile money au retrait.",
    logoSrc: "/payments/cash-delivery.webp",
  },
  {
    value: "airtel_money",
    label: "Airtel Money",
    description: "Paiement via le compte Airtel Money du numéro indiqué.",
    logoSrc: "/payments/airtel-money.webp",
  },
  {
    value: "moov_money",
    label: "Moov Money",
    description: "Paiement via le compte Moov Money du numéro indiqué.",
    logoSrc: "/payments/moov-money.webp",
  },
];

export function CheckoutClient() {
  const router = useRouter();
  const { lines, total, clear, itemCount } = useCart();
  const vendorGroups = groupCartLinesByVendor(lines);
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cash_on_delivery");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Panier vide</h1>
        <p className="text-muted">
          Ajoutez des produits avant de finaliser votre commande.
        </p>
        <ButtonLink href="/marketplace">Voir les offres</ButtonLink>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Indiquez votre nom complet.";
    if (phone.trim().length < 8) next.phone = "Numéro de téléphone invalide.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      showToast("Vérifiez le formulaire", "error");
      return;
    }

    if (!isSupabaseConfigured()) {
      clear();
      showToast("Commande enregistrée (mode démo sans Supabase)", "success");
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    const r = await finalizeCheckoutAction({
      fullName: name.trim(),
      phone: phone.trim(),
      paymentMethod: payment,
      items: lines.map((l) => ({
        product_id: l.product.id,
        quantity: l.quantity,
      })),
    });
    setLoading(false);

    if (r.error) {
      showToast(r.error, "error");
      return;
    }

    clear();
    const nOrders =
      "orderIds" in r && Array.isArray(r.orderIds) ? r.orderIds.length : 1;
    showToast(
      nOrders > 1
        ? `${nOrders} commandes confirmées — une par commerce`
        : "Commande confirmée",
      "success",
    );
    router.push("/dashboard");
  }

  async function abandon() {
    if (!isSupabaseConfigured()) {
      showToast("Panier laissé (démo)", "info");
      router.push("/marketplace");
      return;
    }
    const r = await recordCheckoutAbandonAction();
    if ("error" in r && r.error) {
      showToast(r.error, "error");
      return;
    }
    const data = "data" in r ? r.data : null;
    if (data && typeof data === "object" && "level" in data) {
      const level = (data as { level?: string }).level;
      if (level === "warning") {
        showToast("Abandon enregistré — évitez de répéter trop souvent.", "info");
      }
    } else {
      showToast("Abandon enregistré", "info");
    }
    router.push("/marketplace");
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-5">
      <form
        onSubmit={submit}
        className="boma-panel boma-panel--glow lg:col-span-3 space-y-6 rounded-3xl bg-card p-6 shadow-sm"
      >
        <h1 className="text-2xl font-semibold tracking-tight">
          Finaliser la commande
        </h1>
        <p className="text-sm text-muted">
          Paiement à la livraison ou mobile money (Airtel / Moov). Les montants sont
          recalculés côté serveur. Si votre panier contient des offres de{" "}
          <strong className="text-foreground">plusieurs commerces</strong>, une commande
          distincte sera créée pour chaque vendeur (même paiement et coordonnées).
        </p>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Nom complet
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`boma-field rounded-2xl bg-background px-4 py-3 ${
              errors.name ? "boma-field-error" : ""
            }`}
            autoComplete="name"
          />
          {errors.name && (
            <span className="text-xs font-medium text-red-500">{errors.name}</span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Téléphone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`boma-field rounded-2xl bg-background px-4 py-3 ${
              errors.phone ? "boma-field-error" : ""
            }`}
            inputMode="tel"
            autoComplete="tel"
          />
          {errors.phone && (
            <span className="text-xs font-medium text-red-500">{errors.phone}</span>
          )}
        </label>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            Mode de paiement
          </legend>
          <p className="text-xs text-muted">
            Choisissez comment vous souhaitez régler — logos Airtel Money et Moov
            Money pour repérer vite les options mobile money.
          </p>
          <div className="grid gap-3">
            {PAYMENT_CHOICES.map((opt) => {
              const selected = payment === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col gap-2 rounded-2xl p-3 transition-all ${
                    selected
                      ? "bg-boma-blue/[0.08] ring-2 ring-boma-blue ring-offset-2 ring-offset-card dark:ring-offset-card"
                      : "bg-foreground/[0.03] ring-2 ring-transparent hover:bg-foreground/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setPayment(opt.value)}
                      className="sr-only"
                      aria-label={opt.label}
                    />
                    <span className="relative block h-[52px] w-full max-w-[240px] overflow-hidden rounded-lg">
                      <Image
                        src={opt.logoSrc}
                        alt=""
                        width={240}
                        height={52}
                        className="h-[52px] w-auto max-w-full object-contain object-left"
                        unoptimized
                      />
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    {opt.label}
                  </span>
                  <span className="text-xs text-muted">{opt.description}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Validation…" : "Confirmer la commande"}
          </Button>
          <Button type="button" variant="secondary" disabled={loading} onClick={abandon}>
            Abandonner (anti-fraude)
          </Button>
        </div>
      </form>
      <aside className="lg:col-span-2">
        <div className="boma-panel boma-panel--glow sticky top-24 space-y-4 rounded-3xl bg-boma-forest/5 p-6 dark:bg-boma-forest/15">
          <h2 className="text-lg font-semibold">Résumé</h2>
          {vendorGroups.length > 1 && (
            <p className="rounded-xl bg-boma-blue/[0.08] px-3 py-2 text-xs leading-relaxed text-muted">
              {vendorGroups.length} commerces — vous recevrez{" "}
              <strong className="text-foreground">{vendorGroups.length} commandes</strong>{" "}
              liées à ce paiement.
            </p>
          )}
          <div className="space-y-4 text-sm text-muted">
            {vendorGroups.map((g) => (
              <div key={g.vendorId}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-boma-forest dark:text-emerald-300">
                  {g.vendorName}
                </p>
                <ul className="space-y-2">
                  {g.lines.map((l) => (
                    <li key={l.product.id} className="flex justify-between gap-2">
                      <span className="truncate">
                        {l.product.name} × {l.quantity}
                      </span>
                      <span className="shrink-0 font-medium text-foreground">
                        {formatXAF(l.product.pricePromo * l.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-right text-xs text-muted">
                  Sous-total {formatXAF(g.subtotal)}
                </p>
              </div>
            ))}
          </div>
          <div className="pt-4 text-base font-semibold">
            <div className="flex justify-between">
              <span>{itemCount} articles</span>
              <span className="text-boma-blue">{formatXAF(total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
