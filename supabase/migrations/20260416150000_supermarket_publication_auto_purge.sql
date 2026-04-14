-- Durée de publication supermarché : suppression auto après un délai basé sur la DLC au moment de la publication.
-- Règle demandée (approx. jours) :
-- - publication 2 semaines (DLC ~14j) → suppression après 14j
-- - publication 1 mois (DLC ~30j) → suppression après 30j + 1 semaine = 37j
-- - publication 2 mois (DLC ~60j) → suppression après 60j + 2 semaines = 74j
--
-- Comme on ne stocke pas explicitement le palier au moment de la publication, on le déduit via (expires_at - created_at).
create or replace function public.purge_supermarket_publications_expired()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n_del int;
  n_blk int;
begin
  with candidates as (
    select
      p.id,
      case
        when floor(extract(epoch from (p.expires_at - p.created_at)) / 86400) >= 60 then 74
        when floor(extract(epoch from (p.expires_at - p.created_at)) / 86400) >= 30 then 37
        else 14
      end as total_days
    from public.products p
    join public.vendors v on v.id = p.vendor_id
    where p.status = 'active'::public.product_status
      and p.expires_at is not null
      and v.business_type in ('supermarket', 'boutique')
  ),
  expired as (
    select c.id
    from candidates c
    join public.products p on p.id = c.id
    where now() >= (p.created_at + (c.total_days || ' days')::interval)
  )
  delete from public.products p
  using expired e
  where p.id = e.id
    and not exists (select 1 from public.order_items oi where oi.product_id = p.id);
  get diagnostics n_del = row_count;

  with candidates as (
    select
      p.id,
      case
        when floor(extract(epoch from (p.expires_at - p.created_at)) / 86400) >= 60 then 74
        when floor(extract(epoch from (p.expires_at - p.created_at)) / 86400) >= 30 then 37
        else 14
      end as total_days
    from public.products p
    join public.vendors v on v.id = p.vendor_id
    where p.status = 'active'::public.product_status
      and p.expires_at is not null
      and v.business_type in ('supermarket', 'boutique')
  ),
  expired as (
    select c.id
    from candidates c
    join public.products p on p.id = c.id
    where now() >= (p.created_at + (c.total_days || ' days')::interval)
  )
  update public.products p
  set status = 'blocked'::public.product_status, updated_at = now()
  from expired e
  where p.id = e.id
    and exists (select 1 from public.order_items oi where oi.product_id = p.id);
  get diagnostics n_blk = row_count;

  return coalesce(n_del, 0) + coalesce(n_blk, 0);
end;
$$;

revoke all on function public.purge_supermarket_publications_expired() from public;
grant execute on function public.purge_supermarket_publications_expired() to service_role;

