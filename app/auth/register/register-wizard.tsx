"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RegisterForm } from "@/app/auth/register/register-form";
import { VendorRegisterForm } from "@/app/auth/register/vendor-register-form";
import { Button } from "@/components/ui/button";

type RegisterKind = "client" | "vendor";

export function RegisterWizard() {
  const searchParams = useSearchParams();
  const [kind, setKind] = useState<RegisterKind | null>(null);
  const initializedFromUrl = useRef(false);

  useEffect(() => {
    if (initializedFromUrl.current) return;
    initializedFromUrl.current = true;
    const profil = searchParams.get("profil");
    if (profil === "vendeur") setKind("vendor");
    else if (profil === "acheteur") setKind("client");
  }, [searchParams]);

  if (kind === null) {
    return (
      <div className="space-y-6">
        <p className="text-center text-sm text-muted leading-relaxed">
          Choisissez le type de compte pour afficher le formulaire adapté.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setKind("client")}
            className="boma-panel boma-panel--glow group rounded-3xl bg-card p-6 text-left shadow-sm ring-1 ring-foreground/[0.06] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:ring-white/[0.07]"
          >
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Utilisateur
            </span>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Acheter des offres anti-gaspillage, gérer votre panier et vos commandes.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-boma-blue transition-colors group-hover:text-boma-blue/90">
              Continuer →
            </span>
          </button>
          <button
            type="button"
            onClick={() => setKind("vendor")}
            className="boma-panel boma-panel--glow group rounded-3xl bg-card p-6 text-left shadow-sm ring-1 ring-foreground/[0.06] transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-forest/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:ring-white/[0.07]"
          >
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Vendeur
            </span>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Commerçant ou restaurateur : créez votre accès puis déposez votre dossier
              pour validation.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-boma-forest dark:text-emerald-300">
              Continuer →
            </span>
          </button>
        </div>
        <p className="text-center text-sm text-muted">
          Déjà inscrit ?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-boma-blue hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          className="px-0 text-sm text-muted hover:text-foreground"
          onClick={() => setKind(null)}
        >
          ← Changer le type de compte
        </Button>
      </div>
      {kind === "vendor" ? <VendorRegisterForm /> : <RegisterForm />}
    </div>
  );
}
