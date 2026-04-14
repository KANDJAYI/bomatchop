-- Purge automatique des publications supermarché dont la durée est écoulée.
-- Prérequis : activer l’extension « pg_cron » dans Supabase (Database → Extensions).
create extension if not exists pg_cron with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'boma_supermarket_publication_purge';

-- Tous les jours à 00:15 UTC (modifiable) — la fonction elle-même décide quoi purger.
select cron.schedule(
  'boma_supermarket_publication_purge',
  '15 0 * * *',
  $$select public.purge_supermarket_publications_expired();$$
);

