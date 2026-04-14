-- Liste des jobs pg_cron pour la console admin (schéma cron optionnel).
create or replace function public.admin_list_pg_cron_jobs()
returns table (
  jobid bigint,
  jobname text,
  schedule text,
  command text,
  active boolean
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;

  if not exists (select 1 from pg_namespace where nspname = 'cron') then
    return;
  end if;

  return query execute
    $q$
    select
      j.jobid::bigint,
      j.jobname::text,
      j.schedule::text,
      j.command::text,
      j.active
    from cron.job j
    order by j.jobid
    $q$;
end;
$$;

revoke all on function public.admin_list_pg_cron_jobs() from public;
grant execute on function public.admin_list_pg_cron_jobs() to authenticated;
