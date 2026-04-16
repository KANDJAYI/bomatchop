import type { Metadata } from "next";
import { CreateAdminForm } from "@/app/createadmin/create-admin-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Créer un administrateur",
  description: "Outil ponctuel BOMA TCHOP — création de compte admin via service role.",
  robots: { index: false, follow: false },
};

export default function CreateAdminPage() {
  const supabaseOk = isSupabaseConfigured();
  const serviceRoleOk = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const secretConfigured = Boolean(process.env.CREATE_ADMIN_SECRET?.trim());

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Créer un administrateur</h1>
      <p className="mt-2 text-sm text-muted">
        Utilise la clé <strong className="text-foreground">service role</strong> uniquement côté
        serveur (jamais dans le navigateur). Renseigne d’abord les variables dans{" "}
        <code className="rounded bg-black/10 px-1">.env.local</code>.
      </p>
      <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-muted">
        <li>
          <code className="rounded bg-black/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code> — depuis le
          tableau de bord Supabase (Project Settings → API)
        </li>
        <li>
          <code className="rounded bg-black/10 px-1">CREATE_ADMIN_SECRET</code> — une phrase
          secrète <em>que tu inventes</em> (ex. long mot de passe), la même dans le formulaire
          ci-dessous
        </li>
      </ul>
      {!supabaseOk && (
        <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          Configure{" "}
          <code className="rounded bg-black/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
          <code className="rounded bg-black/10 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
      )}
      {supabaseOk && !serviceRoleOk && (
        <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          Ajoute{" "}
          <code className="rounded bg-black/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code> dans{" "}
          <code className="rounded bg-black/10 px-1">.env.local</code>, puis redémarre{" "}
          <code className="rounded bg-black/10 px-1">next dev</code>.
        </p>
      )}
      {supabaseOk && serviceRoleOk && !secretConfigured && (
        <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-100">
          Définis <code className="rounded bg-black/10 px-1">CREATE_ADMIN_SECRET</code> dans{" "}
          <code className="rounded bg-black/10 px-1">.env.local</code> pour débloquer le
          formulaire (sécurité contre l’abus de cette URL).
        </p>
      )}
      <div className="boma-panel boma-panel--glow mt-8 rounded-3xl bg-card p-6 shadow-sm">
        <CreateAdminForm secretConfigured={supabaseOk && serviceRoleOk && secretConfigured} />
      </div>
    </div>
  );
}
