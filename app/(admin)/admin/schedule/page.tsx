import Link from "next/link";
import { AdminTriggerRestaurantPurgeButton } from "@/components/admin/admin-trigger-restaurant-purge-button";
import { createClient } from "@/lib/supabase/server";
import { humanizeCronSchedule } from "@/lib/admin/cron-humanize";

export const dynamic = "force-dynamic";

type CronRow = {
  jobid: number;
  jobname: string;
  schedule: string;
  command: string;
  active: boolean;
};

export default async function AdminSchedulePage() {
  const supabase = await createClient();
  let jobs: CronRow[] = [];
  let loadError: string | null = null;

  if (supabase) {
    const { data, error } = await supabase.rpc("admin_list_pg_cron_jobs");
    if (error) {
      const msg = error.message ?? "";
      if (
        msg.includes("admin_list_pg_cron_jobs") &&
        (msg.includes("does not exist") || msg.includes("n'existe pas"))
      ) {
        loadError =
          "La base de données ne contient pas encore la fonction nécessaire. Appliquez la migration : supabase/migrations/20260416130000_admin_list_pg_cron_jobs.sql (puis rechargez cette page).";
      } else {
        loadError = msg;
      }
    } else {
      jobs = (data ?? []) as CronRow[];
    }
  } else {
    loadError = "Supabase n’est pas configuré : impossible de lire les tâches planifiées.";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Administration
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Tâches automatiques sur la base de données
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Cette page résume ce que votre projet fait <strong className="font-medium text-slate-800 dark:text-slate-200">automatiquement</strong> dans PostgreSQL (via l’extension{" "}
          <strong className="font-medium text-slate-800 dark:text-slate-200">pg_cron</strong> si elle est activée). La liste ci-dessous est en <strong className="font-medium text-slate-800 dark:text-slate-200">lecture seule</strong>. Vous pouvez en plus lancer la purge des plats restaurant à la demande avec le bouton ci-dessous (même logique qu’au passage à minuit).
        </p>
      </header>

      <section
        className="admin-panel rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#12161c]"
        aria-labelledby="purge-manuelle-titre"
      >
        <h2 id="purge-manuelle-titre" className="text-sm font-semibold text-slate-900 dark:text-white">
          Purge des plats restaurant (manuel)
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Utile pour tester ou corriger sans attendre le cron. Appliquez d’abord la migration{" "}
          <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
            20260416140000_admin_trigger_restaurant_purge.sql
          </code>{" "}
          sur votre base Supabase.
        </p>
        <div className="mt-4">
          <AdminTriggerRestaurantPurgeButton />
        </div>
      </section>

      <section
        className="rounded-2xl border border-sky-500/25 bg-sky-500/[0.06] p-5 dark:border-sky-400/20 dark:bg-sky-500/10"
        aria-labelledby="aide-sql-titre"
      >
        <h2 id="aide-sql-titre" className="text-sm font-semibold text-slate-900 dark:text-white">
          Si vous avez exécuté du SQL et vu un tableau avec une colonne « schedule » et le chiffre 3
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          La commande <code className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-black/30 dark:text-slate-100">cron.schedule(...)</code>{" "}
          <strong>renvoie un numéro interne</strong> (souvent 1, 2, 3…). Ce n’est pas l’heure d’exécution : c’est l’identifiant de la tâche créée. Pour voir l’horaire réel, il faut consulter la table des tâches (par exemple la colonne qui contient{" "}
          <code className="rounded-md bg-white/80 px-1 py-0.5 font-mono text-xs dark:bg-black/30">0 23 * * *</code>
          ), ou simplement utiliser la liste ci-dessous une fois la migration appliquée.
        </p>
      </section>

      {loadError ? (
        <div
          className="rounded-2xl border border-amber-500/35 bg-amber-500/[0.08] px-5 py-4 text-sm leading-relaxed text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-50"
          role="alert"
        >
          {loadError}
        </div>
      ) : null}

      {!loadError && jobs.length === 0 ? (
        <div className="admin-panel rounded-2xl border border-dashed border-slate-300/90 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#12161c]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
            <IconClock className="h-7 w-7" />
          </div>
          <p className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
            Aucune tâche automatique n’est enregistrée pour l’instant
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Pour que la purge des plats restaurant tourne <strong className="font-medium text-slate-800 dark:text-slate-200">directement dans Supabase</strong> à l’heure prévue : activez l’extension{" "}
            <strong className="font-medium text-slate-800 dark:text-slate-200">pg_cron</strong> (menu Supabase → Base de données → Extensions), puis appliquez le fichier de migration{" "}
            <code className="rounded bg-slate-200/90 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
              20260416120000_pg_cron_restaurant_midnight_purge.sql
            </code>
            . Sinon, la purge peut être déclenchée par votre hébergeur (cron Vercel) ou à la main en développement avec{" "}
            <code className="rounded bg-slate-200/90 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
              npm run purge:restaurant
            </code>
            .
          </p>
        </div>
      ) : null}

      {jobs.length > 0 ? (
        <div className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Tâches enregistrées ({jobs.length})
          </h2>
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.jobid}>
                <article className="admin-panel overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#12161c]">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-white/[0.06] sm:px-6">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                        Tâche n°{job.jobid}
                      </p>
                      <h3 className="mt-1 break-words text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                        {job.jobname}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Nom technique dans la base — ne pas modifier à la main sauf si vous savez ce que vous faites.
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        job.active
                          ? "bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                          : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                      }`}
                    >
                      {job.active ? "Activée" : "Désactivée"}
                    </span>
                  </div>
                  <div className="grid gap-6 px-5 py-5 sm:grid-cols-2 sm:px-6">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Quand ça s’exécute
                      </p>
                      <p className="mt-2 font-mono text-sm font-medium text-boma-blue dark:text-sky-400">
                        {job.schedule}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {humanizeCronSchedule(job.schedule)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Action exécutée par la base
                      </p>
                      <pre className="mt-2 max-h-32 overflow-auto rounded-xl border border-slate-200/80 bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100 dark:border-white/10 dark:bg-black/50">
                        {job.command.trim()}
                      </pre>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="admin-panel rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#12161c]">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Liens utiles</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <li>
            <Link
              href="/admin"
              className="font-medium text-boma-blue underline-offset-2 hover:underline dark:text-sky-400"
            >
              Retour au tableau de bord administrateur
            </Link>
          </li>
          <li>
            Purge par l’application (hébergement Vercel, avec mot de passe cron) : route{" "}
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
              /api/cron/restaurant-midnight-purge
            </code>
            . À configurer dans le tableau de bord Vercel si vous ne utilisez pas pg_cron sur Supabase.
          </li>
        </ul>
      </section>
    </div>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
