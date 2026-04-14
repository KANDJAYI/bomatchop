-- Permet à un administrateur connecté de lancer la même purge que le cron (sans service_role).
create or replace function public.admin_trigger_restaurant_midnight_purge()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if not public.is_admin() then
    raise exception 'Accès réservé aux administrateurs';
  end if;

  select public.purge_restaurant_products_midnight() into n;
  return coalesce(n, 0);
end;
$$;

revoke all on function public.admin_trigger_restaurant_midnight_purge() from public;
grant execute on function public.admin_trigger_restaurant_midnight_purge() to authenticated;
