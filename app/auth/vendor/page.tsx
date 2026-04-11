import Link from "next/link";
import { redirect } from "next/navigation";
import { VendorApplicationForm } from "@/app/auth/vendor/vendor-application-form";
import { createClient } from "@/lib/supabase/server";

export default async function VendorApplicationPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-16">
        <p className="text-muted">Configurez Supabase dans .env.local.</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/auth/vendor");
  }

  const { data: existing } = await supabase
    .from("vendors")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-16">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Accueil
      </Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Devenir vendeur
      </h1>
      <p className="mt-2 text-sm text-muted">
        Après envoi, votre dossier est <strong>en attente</strong> jusqu’à validation par
        l’équipe BOMA.
      </p>
      {existing?.status === "pending" && (
        <p className="mt-6 rounded-2xl border border-boma-blue/30 bg-boma-blue/10 p-4 text-sm">
          Votre dossier est en cours d’examen.
        </p>
      )}
      {existing?.status === "approved" && (
        <p className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          Compte vendeur approuvé.{" "}
          <Link href="/seller" className="font-semibold text-boma-blue underline">
            Espace vendeur
          </Link>
        </p>
      )}
      {existing?.status === "rejected" && (
        <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
          Dossier refusé. Contactez le support pour plus d’informations.
        </p>
      )}
      {!existing && (
        <div className="boma-panel boma-panel--glow mt-8 rounded-3xl bg-card p-6 shadow-sm">
          <VendorApplicationForm />
        </div>
      )}
    </div>
  );
}
