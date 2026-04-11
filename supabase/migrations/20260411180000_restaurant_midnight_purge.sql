-- Retrait quotidien des plats restaurant du marché (minuit heure locale = cron à configurer).
create or replace function public.purge_restaurant_products_midnight()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  update public.products p
  set status = 'blocked'::public.product_status, updated_at = now()
  from public.vendors v
  where p.vendor_id = v.id
    and v.business_type = 'restaurant'
    and p.status = 'active'::public.product_status;
  get diagnostics n = row_count;
  return coalesce(n, 0);
end;
$$;

revoke all on function public.purge_restaurant_products_midnight() from public;
grant execute on function public.purge_restaurant_products_midnight() to service_role;
