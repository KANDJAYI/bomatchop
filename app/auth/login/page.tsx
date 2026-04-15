import Link from "next/link";
import { LoginForm } from "@/app/auth/login/login-form";
import { ButtonLink } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const nextPath = sp.next?.startsWith("/") ? sp.next : "/marketplace";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Link
        href="/"
        className="mb-8 text-sm text-muted hover:text-foreground"
      >
        ← Accueil
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
      <p className="mt-2 text-sm text-muted">
        Espace client BOMA TCHOP — e-mail et mot de passe.
      </p>
      {!isSupabaseConfigured() && (
        <p className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          Configurez <code className="rounded bg-black/10 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          et <code className="rounded bg-black/10 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          dans <code className="rounded bg-black/10 px-1">.env.local</code>.
        </p>
      )}
      {sp.error === "auth" && (
        <p className="mt-4 text-sm font-medium text-red-500" role="alert">
          Lien de confirmation invalide ou expiré.
        </p>
      )}
      <div className="boma-panel boma-panel--glow mt-8 rounded-3xl bg-card p-6 shadow-sm">
        <LoginForm nextPath={nextPath} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Vendeur ?{" "}
        <ButtonLink href="/auth/vendor" variant="ghost" className="inline px-2 py-1">
          Créer une demande commerçant
        </ButtonLink>
      </p>
    </div>
  );
}
