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
      <div className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <div className="boma-panel rounded-3xl bg-card p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Espace vendeur</h1>
          <p className="mt-3 text-muted">
            Aucun dossier commerçant. Déposez une demande pour être validé par l’équipe
            BOMA.
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
      <div className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <div className="boma-panel boma-panel--glow rounded-3xl bg-card p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-boma-blue">
            Dossier reçu
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Validation en cours</h1>
          <p className="mt-3 text-muted">
            Le commerce <strong>{vendor.business_name}</strong> est en attente de
            vérification. Vous recevrez l’accès complet dès approbation.
          </p>
        </div>
      </div>
    );
  }

  if (vendor.status !== "approved") {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <div className="boma-panel rounded-3xl bg-card p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Compte indisponible</h1>
          <p className="mt-3 text-muted">
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
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-sm text-muted">
        Vue d’ensemble de votre activité — gérez le détail dans{" "}
        <Link href="/seller/products" className="font-medium text-boma-blue hover:underline">
          Mes produits
        </Link>{" "}
        et traitez les{" "}
        <Link href="/seller/orders" className="font-medium text-boma-blue hover:underline">
          commandes clients
        </Link>
        .
      </p>

      <div className="mt-6">
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <QuickCard
          href="/seller/products/new"
          title="Nouvelle offre"
          desc="Publier avec photo et prix catalogue"
          accent="from-boma-blue/20 to-boma-forest/10"
        />
        <QuickCard
          href="/seller/orders"
          title="Commandes"
          desc="Accepter, préparer, prêt à retirer"
          accent="from-boma-spectrum-green/18 to-boma-blue/12"
        />
        <QuickCard
          href="/seller/products"
          title="Mes produits"
          desc="Catalogue, édition, statuts"
          accent="from-boma-forest/15 to-boma-blue/10"
        />
        <QuickCard
          href="/seller/messages"
          title="Messages BOMA"
          desc="Communications de l’administration"
          accent="from-boma-spectrum-yellow/15 to-boma-blue/10"
        />
        <QuickCard
          href="/seller/account"
          title="Mon compte"
          desc="Profil, commerce, portrait"
          accent="from-boma-blue/10 to-boma-spectrum-red/10"
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-8 lg:col-span-5">
          {!profilePhotoColumnMissing && !hasProfilePhoto ? (
            <SellerProfilePhotoForm mode="required" />
          ) : !profilePhotoColumnMissing && hasProfilePhoto ? (
            <SellerProfilePhotoForm
              mode="update"
              currentPhotoUrl={vendor.profile_photo_url}
            />
          ) : null}
          <div className="boma-panel rounded-3xl bg-card/50 p-6 text-center">
            <p className="text-sm font-medium text-foreground">Publication d’offres</p>
            <p className="mt-2 text-sm text-muted">
              La création et la modification se font depuis des écrans dédiés pour plus de
              clarté.
            </p>
            <ButtonLink href="/seller/products/new" variant="primary" className="mt-5">
              Créer une offre
            </ButtonLink>
          </div>
        </div>
        <div className="lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Dernières offres</h2>
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
}: {
  href: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`boma-panel group relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent} p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-boma-blue">
        {title}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">{desc}</p>
      <span className="mt-4 inline-flex text-xs font-semibold text-boma-blue">
        Ouvrir →
      </span>
    </Link>
  );
}
