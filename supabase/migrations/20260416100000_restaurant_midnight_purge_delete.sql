-- Minuit marché : plats restaurant actifs — suppression si jamais commandés, sinon blocage (historique commandes).
create or replace function public.purge_restaurant_products_midnight()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n_del int;
  n_blk int;
begin
  delete from public.products p
  using public.vendors v
  where p.vendor_id = v.id
    and v.business_type = 'restaurant'
    and p.status = 'active'::public.product_status
    and not exists (
      select 1 from public.order_items oi where oi.product_id = p.id
    );
  get diagnostics n_del = row_count;

  update public.products p
  set status = 'blocked'::public.product_status, updated_at = now()
  from public.vendors v
  where p.vendor_id = v.id
    and v.business_type = 'restaurant'
    and p.status = 'active'::public.product_status;
  get diagnostics n_blk = row_count;

  return coalesce(n_del, 0) + coalesce(n_blk, 0);
end;
$$;

revoke all on function public.purge_restaurant_products_midnight() from public;
grant execute on function public.purge_restaurant_products_midnight() to service_role;
