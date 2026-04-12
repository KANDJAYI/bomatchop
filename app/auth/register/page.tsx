import Link from "next/link";
import { Suspense } from "react";
import { RegisterWizard } from "@/app/auth/register/register-wizard";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function RegisterFallback() {
  return (
    <div className="animate-pulse space-y-4 py-4">
      <div className="h-4 w-2/3 rounded-full bg-foreground/10" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-3xl bg-foreground/10" />
        <div className="h-40 rounded-3xl bg-foreground/10" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16">
      <Link href="/" className="mb-8 text-sm text-muted hover:text-foreground">
        ← Accueil
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        Étape 1 : indiquez si vous êtes <strong className="text-foreground">utilisateur</strong>{" "}
        (acheteur) ou <strong className="text-foreground">vendeur</strong> (commerçant). Étape 2
        : un formulaire simple pour l’acheteur, ou un formulaire{" "}
        <strong className="text-foreground">commerçant dédié</strong> (activité, contact,
        identifiants) puis dépôt du dossier après connexion.
      </p>
      {!isSupabaseConfigured() && (
        <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Ajoutez les clés Supabase dans <code>.env.local</code> pour activer l’inscription.
        </p>
      )}
      <div className="boma-panel boma-panel--glow mt-8 rounded-3xl bg-card p-6 shadow-sm sm:p-8">
        <Suspense fallback={<RegisterFallback />}>
          <RegisterWizard />
        </Suspense>
      </div>
    </div>
  );
}
