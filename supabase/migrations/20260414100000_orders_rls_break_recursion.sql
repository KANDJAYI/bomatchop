-- orders_select referenced order_items; order_items_select referenced orders → infinite RLS recursion.
-- Centralize visibility in a SECURITY DEFINER helper (table owner bypasses RLS inside the function).

create or replace function public.user_can_select_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id = p_order_id
        and o.customer_id = auth.uid()
    )
    or exists (
      select 1
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.vendors v on v.id = p.vendor_id
      where oi.order_id = p_order_id
        and v.user_id = auth.uid()
    );
$$;

comment on function public.user_can_select_order(uuid) is
  'True if current user may SELECT this order (client, vendor with a line, or admin). Used by RLS to avoid orders↔order_items recursion.';

revoke all on function public.user_can_select_order(uuid) from public;
grant execute on function public.user_can_select_order(uuid) to authenticated;
grant execute on function public.user_can_select_order(uuid) to service_role;

drop policy if exists "orders_select_customer_vendor_admin" on public.orders;
create policy "orders_select_customer_vendor_admin"
  on public.orders for select
  using (public.user_can_select_order(id));

drop policy if exists "order_items_select_linked" on public.order_items;
create policy "order_items_select_linked"
  on public.order_items for select
  using (public.user_can_select_order(order_id));
