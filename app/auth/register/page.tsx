import Link from "next/link";
import { RegisterForm } from "@/app/auth/register/register-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Link href="/" className="mb-8 text-sm text-muted hover:text-foreground">
        ← Accueil
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
      <p className="mt-2 text-sm text-muted">
        Compte acheteur — accès au marché et au paiement.
      </p>
      {!isSupabaseConfigured() && (
        <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          Ajoutez les clés Supabase dans <code>.env.local</code> pour activer l’inscription.
        </p>
      )}
      <div className="boma-panel boma-panel--glow mt-8 rounded-3xl bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
