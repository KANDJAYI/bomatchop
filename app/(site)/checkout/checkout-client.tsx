"use client";

import {
  faCircleCheck,
  faClock,
  faLayerGroup,
  faMoneyBillWave,
  faStore,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  finalizeCheckoutAction,
  recordCheckoutAbandonAction,
  type CheckoutFulfillment,
} from "@/app/auth/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CartVendorGroup } from "@/lib/cart-vendor-groups";
import { groupCartLinesByVendor } from "@/lib/cart-vendor-groups";
import { SupermarketDlcBlock } from "@/components/supermarket-dlc-block";
import { formatXAF } from "@/lib/mock-products";
import { buildWhatsAppChatUrl } from "@/lib/whatsapp";

const CheckoutRouteMaps = dynamic(
  () =>
    import("@/components/checkout-route-maps").then((m) => m.CheckoutRouteMaps),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm text-muted">
        Chargement des cartes…
      </div>
    ),
  },
);

function CheckoutFinalizeHero({
  vendorCount,
  hasSupermarket,
}: {
  vendorCount: number;
  hasSupermarket: boolean;
}) {
  const multi = vendorCount > 1;

  return (
    <header className="relative overflow-hidden rounded-3xl border border-foreground/[0.07] bg-card shadow-[0_24px_48px_-28px_rgba(0,123,255,0.22),0_1px_0_0_rgba(255,255,255,0.06)_inset] ring-1 ring-boma-blue/[0.06] dark:border-white/[0.08] dark:bg-[#101418] dark:shadow-[0_28px_56px_-32px_rgba(56,189,248,0.18)] dark:ring-sky-400/10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_100%_-10%,rgba(0,123,255,0.14),transparent_55%),radial-gradient(ellipse_70%_50%_at_0%_100%,rgba(11,61,46,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_90%_60%_at_100%_-10%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(ellipse_70%_50%_at_0%_100%,rgba(16,185,129,0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-boma-blue/20 blur-[80px] dark:bg-sky-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-24 h-56 w-56 rounded-full bg-boma-forest/15 blur-[70px] dark:bg-emerald-500/12"
        aria-hidden
      />

      <div className="relative px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-boma-blue/25 bg-boma-blue/[0.1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-boma-blue dark:border-sky-400/35 dark:bg-sky-400/[0.12] dark:text-sky-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-boma-blue/50 opacity-60 dark:bg-sky-400/50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-boma-blue dark:bg-sky-400" />
            </span>
            Étape finale
          </span>
          <span className="hidden text-[11px] font-medium text-muted/90 sm:inline">
            Vérifiez vos infos — puis confirmez en un clic
          </span>
        </div>

        <h1 className="mt-5 text-[1.65rem] font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl sm:leading-[1.08] lg:text-[2.35rem]">
          Finaliser la{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-boma-blue via-sky-500 to-boma-forest bg-clip-text text-transparent dark:from-sky-400 dark:via-cyan-300 dark:to-emerald-400">
              commande
            </span>
            <span
              className="absolute -inset-x-1 -bottom-0.5 -z-0 h-3 rounded-md bg-gradient-to-r from-boma-blue/20 via-sky-400/15 to-boma-forest/20 opacity-90 dark:from-sky-400/25 dark:via-cyan-400/15 dark:to-emerald-500/20"
              aria-hidden
            />
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
          Règlement en{" "}
          <strong className="font-semibold text-foreground">espèces</strong>, au moment
          de la{" "}
          <strong className="font-semibold text-foreground">livraison</strong> ou du{" "}
          <strong className="font-semibold text-foreground">retrait</strong>. Choisissez
          votre mode un peu plus bas — la carte vous aide à visualiser le trajet.
        </p>

        <ul className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <li className="group relative overflow-hidden rounded-2xl border border-foreground/[0.07] bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-amber-400/35 hover:shadow-md dark:border-white/10 dark:bg-white/75 dark:hover:border-amber-400/35">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/25 to-orange-400/15 text-amber-800 shadow-inner dark:from-amber-400/20 dark:to-orange-500/10 dark:text-amber-200">
                <FontAwesomeIcon icon={faMoneyBillWave} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-foreground dark:text-slate-900">
                  Paiement simple
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted dark:text-slate-700">
                  Pas de carte bancaire sur BOMA : vous payez en liquide à la réception de
                  vos sacs.
                </p>
              </div>
            </div>
          </li>
          <li className="group relative overflow-hidden rounded-2xl border border-foreground/[0.07] bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-boma-blue/35 hover:shadow-md dark:border-white/10 dark:bg-white/75 dark:hover:border-sky-400/35">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-boma-blue/20 to-sky-400/10 text-boma-blue dark:from-sky-400/25 dark:to-cyan-500/10 dark:text-sky-300">
                <span className="flex gap-0.5" aria-hidden>
                  <FontAwesomeIcon icon={faTruck} className="h-4 w-4" />
                  <FontAwesomeIcon icon={faStore} className="h-4 w-4 opacity-80" />
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-foreground dark:text-slate-900">
                  Livraison ou retrait
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted dark:text-slate-700">
                  À domicile ou chez le commerce : sélectionnez l’option qui vous convient
                  dans le bloc suivant.
                </p>
              </div>
            </div>
          </li>
          <li
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-300 sm:min-h-[6.5rem] ${
              multi
                ? "border-boma-blue/30 bg-gradient-to-br from-boma-blue/[0.08] to-transparent hover:shadow-md hover:shadow-boma-blue/10 dark:border-sky-400/35 dark:bg-white/75 dark:from-sky-400/[0.12]"
                : "border-foreground/[0.07] bg-white/70 hover:border-boma-forest/25 hover:shadow-md dark:border-white/10 dark:bg-white/75"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-inner ${
                  multi
                    ? "bg-boma-blue text-white dark:bg-sky-500"
                    : "bg-gradient-to-br from-boma-forest/20 to-emerald-600/10 text-boma-forest dark:from-emerald-500/25 dark:to-emerald-600/10 dark:text-emerald-200"
                }`}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold tracking-tight text-foreground dark:text-slate-900">
                  {multi ? "Plusieurs commerces" : "Un seul commerce"}
                  {multi ? (
                    <span className="rounded-md bg-boma-blue/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-boma-blue dark:bg-sky-400/20 dark:text-sky-200">
                      {vendorCount} commandes
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted dark:text-slate-700">
                  {multi
                    ? "Une commande distincte par vendeur. Retrait : un passage par magasin. Livraison : une seule adresse pour toutes."
                    : "Une seule validation suffit — le vendeur prépare votre panier."}
                </p>
              </div>
            </div>
          </li>
        </ul>

        {hasSupermarket ? (
          <div className="mt-5 flex gap-3 rounded-2xl border border-teal-300/40 bg-gradient-to-r from-teal-50/90 via-white/80 to-cyan-50/60 px-4 py-3.5 dark:border-teal-500/25 dark:from-teal-950/40 dark:via-card dark:to-cyan-950/25">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-800 dark:bg-teal-400/20 dark:text-teal-100">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
            </span>
            <p className="min-w-0 text-xs leading-relaxed text-teal-950/95 dark:text-teal-50/95">
              <strong className="font-semibold text-teal-950 dark:text-teal-100">
                Produits supermarché
              </strong>{" "}
              : la date limite et la durée avant expiration sont rappelées sur chaque
              ligne du résumé. Les réductions (20 %, 30 % ou 50 %) suivent les règles BOMA
              selon l’écart avec la DLC.
            </p>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function CheckoutClient() {
  const router = useRouter();
  const { lines, total, clear, itemCount } = useCart();
  const vendorGroups = groupCartLinesByVendor(lines);
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] =
    useState<CheckoutFulfillment>("home_delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    deliveryAddress?: string;
  }>({});
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
    if (
      fulfillment === "home_delivery" &&
      deliveryAddress.trim().length < 12
    ) {
      next.deliveryAddress =
        "Indiquez une adresse de livraison complète (rue, quartier, repères, accès…).";
    }
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
      fulfillment,
      deliveryAddress: deliveryAddress.trim(),
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
        <CheckoutFinalizeHero
          vendorCount={vendorGroups.length}
          hasSupermarket={lines.some((l) => l.product.vendorType === "supermarche")}
        />
        <CheckoutRouteMaps vendorGroups={vendorGroups} />
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
        <fieldset className="rounded-2xl border border-foreground/[0.08] bg-gradient-to-b from-foreground/[0.03] to-transparent p-5 shadow-sm ring-1 ring-foreground/[0.04] sm:p-6">
          <legend className="sr-only">Mode de réception de la commande</legend>
          <div className="mb-4 sm:mb-5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Comment récupérer votre commande
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-muted sm:text-[13px]">
              Choisissez une option : nous l’indiquons au vendeur pour préparer votre
              commande correctement.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <label className="relative block cursor-pointer select-none">
              <input
                type="radio"
                name="fulfillment"
                value="home_delivery"
                checked={fulfillment === "home_delivery"}
                onChange={() => setFulfillment("home_delivery")}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-[8.5rem] flex-col gap-3 rounded-2xl border p-4 transition-[border-color,box-shadow,background-color,transform] duration-200 motion-reduce:transition-none sm:min-h-0 sm:p-5 ${
                  fulfillment === "home_delivery"
                    ? "border-boma-blue/45 bg-gradient-to-br from-boma-blue/[0.14] via-boma-blue/[0.06] to-transparent shadow-md shadow-boma-blue/10 ring-1 ring-boma-blue/20"
                    : "border-foreground/[0.1] bg-card/40 hover:border-foreground/[0.16] hover:bg-foreground/[0.02] active:scale-[0.99]"
                } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-boma-blue/60`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition-colors ${
                      fulfillment === "home_delivery"
                        ? "bg-boma-blue text-white shadow-inner shadow-black/10"
                        : "bg-foreground/[0.06] text-boma-blue dark:bg-white/[0.08]"
                    }`}
                    aria-hidden
                  >
                    <FontAwesomeIcon icon={faTruck} className="h-5 w-5" />
                  </span>
                  {fulfillment === "home_delivery" ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="h-5 w-5 shrink-0 text-boma-blue"
                      aria-hidden
                    />
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-foreground/20" aria-hidden />
                  )}
                </span>
                <span className="block text-left">
                  <span className="block text-sm font-semibold text-foreground">
                    Livraison à domicile
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-muted sm:text-xs">
                    Nous livrons à l’adresse que vous indiquez ci-dessous.
                  </span>
                </span>
              </span>
            </label>
            <label className="relative block cursor-pointer select-none">
              <input
                type="radio"
                name="fulfillment"
                value="pickup"
                checked={fulfillment === "pickup"}
                onChange={() => setFulfillment("pickup")}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-[8.5rem] flex-col gap-3 rounded-2xl border p-4 transition-[border-color,box-shadow,background-color,transform] duration-200 motion-reduce:transition-none sm:min-h-0 sm:p-5 ${
                  fulfillment === "pickup"
                    ? "border-boma-blue/45 bg-gradient-to-br from-boma-blue/[0.14] via-boma-blue/[0.06] to-transparent shadow-md shadow-boma-blue/10 ring-1 ring-boma-blue/20"
                    : "border-foreground/[0.1] bg-card/40 hover:border-foreground/[0.16] hover:bg-foreground/[0.02] active:scale-[0.99]"
                } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-boma-blue/60`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition-colors ${
                      fulfillment === "pickup"
                        ? "bg-boma-blue text-white shadow-inner shadow-black/10"
                        : "bg-foreground/[0.06] text-boma-forest dark:text-emerald-300"
                    }`}
                    aria-hidden
                  >
                    <FontAwesomeIcon icon={faStore} className="h-5 w-5" />
                  </span>
                  {fulfillment === "pickup" ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="h-5 w-5 shrink-0 text-boma-blue"
                      aria-hidden
                    />
                  ) : (
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-foreground/20" aria-hidden />
                  )}
                </span>
                <span className="block text-left">
                  <span className="block text-sm font-semibold text-foreground">
                    Retrait sur place
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-muted sm:text-xs">
                    Vous récupérez la commande au commerce — repères sur la carte
                    ci-dessus.
                  </span>
                </span>
              </span>
            </label>
          </div>
        </fieldset>
        {fulfillment === "home_delivery" ? (
          <label className="flex flex-col gap-2 text-sm font-medium">
            Adresse de livraison à domicile
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={4}
              placeholder="Ex. : Rue, numéro, quartier, point de repère, consignes d’accès…"
              className={`boma-field min-h-[6.5rem] resize-y rounded-2xl bg-background px-4 py-3 ${
                errors.deliveryAddress ? "boma-field-error" : ""
              }`}
              autoComplete="street-address"
            />
            {errors.deliveryAddress && (
              <span className="text-xs font-medium text-red-500">
                {errors.deliveryAddress}
              </span>
            )}
          </label>
        ) : null}
        {fulfillment === "pickup" ? (
          <PickupWhatsAppPanel vendorGroups={vendorGroups} />
        ) : null}
        <div className="space-y-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4">
          <p className="text-sm font-medium text-foreground">Paiement</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="relative block h-[52px] w-full max-w-[240px] overflow-hidden rounded-lg">
              <Image
                src="/payments/cash-delivery.webp"
                alt=""
                width={240}
                height={52}
                className="h-[52px] w-auto max-w-full object-contain object-left"
                unoptimized
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">À la livraison</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Vous payez en espèces au retrait de votre commande (pas de paiement en
                ligne sur BOMA pour l’instant).
              </p>
            </div>
          </div>
        </div>
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
              pour cette validation.
            </p>
          )}
          <div className="space-y-4 text-sm text-muted">
            {vendorGroups.map((g) => (
              <div key={g.vendorId}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-boma-forest dark:text-emerald-300">
                  {g.vendorName}
                </p>
                <ul className="space-y-2.5">
                  {g.lines.map((l) => (
                    <li
                      key={l.product.id}
                      className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-2.5">
                        <span className="relative mt-0.5 block h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                          <Image
                            src={l.product.image}
                            alt={l.product.name}
                            width={44}
                            height={44}
                            className="h-full w-full object-cover"
                            sizes="44px"
                            unoptimized
                          />
                        </span>
                        <span className="min-w-0 flex-1 space-y-2">
                          <span className="block truncate text-foreground">
                            {l.product.name}{" "}
                            <span className="text-muted">× {l.quantity}</span>
                          </span>
                          {l.product.vendorType === "supermarche" && l.product.expiresAt ? (
                            <SupermarketDlcBlock
                              expiresAtIso={l.product.expiresAt}
                              createdAtIso={l.product.createdAt}
                              size="sm"
                            />
                          ) : null}
                        </span>
                      </span>
                      <span className="shrink-0 self-start pt-0.5 font-medium text-foreground sm:pt-1">
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

function WhatsappGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M20.52 3.48A11.84 11.84 0 0 0 12.04 0C5.5 0 .16 5.33.15 11.89c0 2.1.55 4.14 1.6 5.94L0 24l6.33-1.66a11.9 11.9 0 0 0 5.7 1.45h.01c6.54 0 11.89-5.33 11.9-11.89a11.82 11.82 0 0 0-3.42-8.42ZM12.04 21.6h-.01a9.34 9.34 0 0 1-4.77-1.31l-.34-.2-3.67.96.98-3.58-.22-.35a9.32 9.32 0 0 1-1.44-4.99c0-5.14 4.2-9.33 9.35-9.33 2.5 0 4.84.97 6.6 2.74a9.26 9.26 0 0 0 2.73 6.59c1.76 1.76 2.73 4.1 2.73 6.59 0 5.15-4.2 9.34-9.34 9.34Zm5.43-7.22c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17 0-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41Z"
      />
    </svg>
  );
}

function pickupWhatsAppPrefill(group: CartVendorGroup): string {
  const bits = group.lines
    .slice(0, 4)
    .map((l) => `${l.product.name} ×${l.quantity}`);
  const tail = group.lines.length > 4 ? "\n…" : "";
  return (
    `Bonjour,\n\n` +
    `Je passe une commande BOMA en *retrait sur place* chez *${group.vendorName}*.\n` +
    `Pourriez-vous me confirmer les horaires et le lieu de retrait ?\n\n` +
    `Panier : ${bits.join(", ")}${tail}\n\n` +
    `Merci !`
  );
}

function PickupWhatsAppPanel({ vendorGroups }: { vendorGroups: CartVendorGroup[] }) {
  const rows = vendorGroups.map((g) => ({
    group: g,
    href: g.vendorPhone
      ? buildWhatsAppChatUrl(g.vendorPhone, pickupWhatsAppPrefill(g))
      : null,
  }));
  const anyHref = rows.some((r) => r.href);

  return (
    <div className="rounded-2xl border border-emerald-600/25 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-boma-blue/[0.04] p-4 shadow-sm ring-1 ring-emerald-600/10 dark:border-emerald-400/20 dark:from-emerald-400/[0.07] dark:ring-emerald-400/15 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-xl bg-[#25D366] text-white shadow-md shadow-emerald-900/20">
          <WhatsappGlyph className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Discuter sur WhatsApp avec le commerce
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Utile pour convenir du retrait sur place (horaires, accès). Les restaurants
              renseignent leur numéro dans Paramètres de la console vendeur ; sinon le
              téléphone du dossier est utilisé s’il est disponible.
            </p>
          </div>
          {anyHref ? (
            <ul className="flex flex-col gap-2">
              {rows.map(({ group, href }) =>
                href ? (
                  <li key={group.vendorId}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100"
                    >
                      <WhatsappGlyph className="h-5 w-5 shrink-0" />
                      WhatsApp — {group.vendorName}
                    </a>
                  </li>
                ) : (
                  <li
                    key={group.vendorId}
                    className="rounded-xl border border-foreground/10 bg-background/60 px-3 py-2 text-xs text-muted"
                  >
                    <span className="font-medium text-foreground">{group.vendorName}</span>{" "}
                    : numéro non renseigné pour le moment — finalisez quand même la
                    commande si vous le souhaitez.
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-3 py-2 text-xs leading-relaxed text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-50">
              Aucun numéro exploitable pour ouvrir WhatsApp (numéro dédié ou téléphone du
              commerce). Les restaurants peuvent l’ajouter dans Paramètres ; vous pouvez
              tout de même confirmer la commande.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
