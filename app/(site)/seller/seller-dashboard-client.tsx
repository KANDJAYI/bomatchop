"use client";

import Link from "next/link";
import { SellerProfilePhotoForm } from "@/components/seller/seller-profile-photo-form";
import {
  SellerProductGrid,
  type SellerCatalogProduct,
} from "@/components/seller/seller-product-grid";
import { SellerStatsStrip } from "@/components/seller/seller-stats-strip";
import { ButtonLink } from "@/components/ui/button";
import { labelBusinessType, labelVendorStatus } from "@/lib/labels-fr";
import type { BusinessType } from "@/lib/types";

export type VendorRow = {
  id: string;
  business_name: string;
  business_type: BusinessType;
  status: string;
  profile_photo_url?: string | null;
};

export type SellerProductRow = SellerCatalogProduct;

export function SellerDashboardClient({
  vendor,
  products,
  hasProfilePhoto,
  profilePhotoColumnMissing = false,
}: {
  vendor: VendorRow | null;
  products: SellerProductRow[];
  hasProfilePhoto: boolean;
  profilePhotoColumnMissing?: boolean;
}) {
  if (!vendor) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center py-12 sm:py-20">
        <div className="w-full overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-8 shadow-xl shadow-zinc-900/[0.04] dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-boma-blue/15 to-boma-forest/20 text-boma-blue">
            <IconBriefcase className="h-7 w-7 shrink-0" />
          </div>
          <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-foreground">
            Bienvenue dans la console vendeur
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-muted">
            Aucun dossier commerçant n’est encore associé à votre compte. Déposez une
            demande : notre équipe valide votre activité avant ouverture du catalogue.
          </p>
          <ButtonLink href="/auth/vendor" variant="primary" className="mt-8 w-full sm:w-auto">
            Créer mon dossier vendeur
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (vendor.status === "pending") {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center py-12 sm:py-20">
        <div className="w-full overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-amber-500/[0.07] to-white p-8 shadow-lg dark:from-amber-500/10 dark:to-zinc-900/80 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <IconClock className="h-7 w-7" />
          </div>
          <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
            Dossier reçu
          </p>
          <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight">
            Validation en cours
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-muted">
            Le commerce <strong className="text-foreground">{vendor.business_name}</strong>{" "}
            est en attente de vérification. Vous recevrez l’accès complet dès approbation.
          </p>
        </div>
      </div>
    );
  }

  if (vendor.status !== "approved") {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center py-12 sm:py-20">
        <div className="w-full rounded-3xl border border-zinc-200/90 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <IconShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight">
            Compte indisponible
          </h1>
          <p className="mt-3 text-center text-sm text-muted">
            Statut : {labelVendorStatus(vendor.status)}. Contactez le support pour plus
            d’informations.
          </p>
        </div>
      </div>
    );
  }

  const totalStock = products.reduce((s, p) => s + Number(p.stock), 0);
  const revenuePotential = products.reduce(
    (s, p) => s + Number(p.price_promo) * Number(p.stock),
    0,
  );
  const recent = products.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white px-6 py-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-boma-blue/[0.07] blur-2xl dark:bg-boma-blue/15" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-boma-forest/[0.06] blur-2xl dark:bg-boma-forest/20" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Bonjour — pilotage quotidien
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Vue d’ensemble de votre activité sur BOMA. Détail du catalogue dans{" "}
            <Link href="/seller/products" className="font-medium text-boma-blue hover:underline">
              Mes produits
            </Link>
            , traitement des ventes dans{" "}
            <Link href="/seller/orders" className="font-medium text-boma-blue hover:underline">
              Commandes
            </Link>
            .
          </p>
        </div>
      </div>

      <div>
        <SellerStatsStrip
          businessName={vendor.business_name}
          businessTypeLabel={labelBusinessType(vendor.business_type)}
          productCount={products.length}
          totalStock={totalStock}
          revenuePotential={revenuePotential}
        />
      </div>

      {profilePhotoColumnMissing ? (
        <p className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          Votre base Supabase n’a pas encore la colonne{" "}
          <code className="rounded bg-black/10 px-1">profile_photo_url</code>. Lancez le
          script{" "}
          <code className="rounded bg-black/10 px-1">
            supabase/migrations/20260410120000_vendor_profile_photo.sql
          </code>{" "}
          dans l’éditeur SQL Supabase pour activer la photo de profil obligatoire sur les
          annonces.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <QuickCard
          href="/seller/products/new"
          title="Nouvelle offre"
          desc="Photo, prix et mise en ligne"
          accent="from-boma-blue/15 to-boma-forest/10"
          icon={<IconPlusSoft className="h-5 w-5" />}
        />
        <QuickCard
          href="/seller/orders"
          title="Commandes"
          desc="Accepter, préparer, clôturer"
          accent="from-emerald-500/12 to-boma-blue/10"
          icon={<IconOrders className="h-5 w-5" />}
        />
        <QuickCard
          href="/seller/products"
          title="Mes produits"
          desc="Catalogue et statuts"
          accent="from-boma-forest/12 to-boma-blue/8"
          icon={<IconGrid className="h-5 w-5" />}
        />
        <QuickCard
          href="/seller/messages"
          title="Messages BOMA"
          desc="Équipe plateforme"
          accent="from-amber-500/12 to-boma-blue/8"
          icon={<IconInbox className="h-5 w-5" />}
        />
        <QuickCard
          href="/seller/account"
          title="Mon compte"
          desc="Profil et commerce"
          accent="from-boma-blue/10 to-violet-500/10"
          icon={<IconUserCircle className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-8 lg:col-span-5">
          {!profilePhotoColumnMissing && !hasProfilePhoto ? (
            <SellerProfilePhotoForm mode="required" />
          ) : !profilePhotoColumnMissing && hasProfilePhoto ? (
            <SellerProfilePhotoForm
              mode="update"
              currentPhotoUrl={vendor.profile_photo_url}
            />
          ) : null}
          <div className="rounded-3xl border border-zinc-200/90 bg-white/90 p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm font-semibold text-foreground">Publication d’offres</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Création et modification sur des écrans dédiés, pour un parcours clair et
              reproductible.
            </p>
            <ButtonLink href="/seller/products/new" variant="primary" className="mt-5">
              Créer une offre
            </ButtonLink>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Dernières offres</h2>
              <p className="mt-0.5 text-xs text-muted">Aperçu rapide du catalogue publié</p>
            </div>
            <ButtonLink href="/seller/products" variant="secondary" className="text-sm">
              Tout le catalogue
            </ButtonLink>
          </div>
          <SellerProductGrid products={recent} variant="compact" />
        </div>
      </div>
    </div>
  );
}

function QuickCard({
  href,
  title,
  desc,
  accent,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br ${accent} p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-boma-blue/25 hover:shadow-md dark:border-zinc-800/90 dark:hover:border-boma-blue/30`}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/60 text-boma-blue shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-boma-blue">
        {icon}
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-boma-blue">
        {title}
      </h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-boma-blue">
        Ouvrir
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
      />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconShieldAlert({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function IconPlusSoft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconOrders({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconInbox({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

function IconUserCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
