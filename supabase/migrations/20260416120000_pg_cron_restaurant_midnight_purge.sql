-- Exécute la purge des plats restaurant directement dans Postgres (sans attendre Vercel).
-- Minuit fuseau « UTC+1 » (ex. Libreville) = 23:00 UTC → cron '0 23 * * *'.
-- Si votre marché est sur un autre décalage, modifiez l’expression cron (voir table UTC).
--
-- Prérequis : Dashboard Supabase → Database → Extensions → activer « pg_cron ».
-- Si la migration échoue sur l’extension, activez-la puis relancez ce fichier dans l’éditeur SQL.

create extension if not exists pg_cron with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'boma_restaurant_midnight_purge';

select cron.schedule(
  'boma_restaurant_midnight_purge',
  '0 23 * * *',
  $$select public.purge_restaurant_products_midnight();$$
);
