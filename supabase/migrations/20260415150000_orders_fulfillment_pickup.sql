-- Mode de réception : livraison à domicile (adresse) ou retrait sur place au commerce.
create type public.order_fulfillment as enum ('home_delivery', 'pickup');

alter table public.orders
  add column if not exists fulfillment public.order_fulfillment not null default 'home_delivery';

comment on column public.orders.fulfillment is 'home_delivery = adresse livrée ; pickup = le client retire au commerce.';

drop function if exists public.create_orders_split_by_vendor(public.payment_method, jsonb);
drop function if exists public.create_orders_split_by_vendor(public.payment_method, jsonb, text);

create or replace function public.create_orders_split_by_vendor(
  p_payment public.payment_method,
  p_items jsonb,
  p_delivery_address text default null,
  p_fulfillment public.order_fulfillment default 'home_delivery'
)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_status public.order_status;
  order_ids uuid[] := array[]::uuid[];
  v_order uuid;
  v_total numeric(14, 2);
  it jsonb;
  pid uuid;
  qty int;
  unit_price numeric(14, 2);
  avail int;
  vid uuid;
  r_vendor record;
  v_delivery text;
begin
  if v_uid is null then
    raise exception 'Non authentifié';
  end if;

  if p_fulfillment = 'pickup'::public.order_fulfillment then
    v_delivery := null;
  elsif p_fulfillment = 'home_delivery'::public.order_fulfillment then
    v_delivery := nullif(trim(coalesce(p_delivery_address, '')), '');
    if v_delivery is null or length(v_delivery) < 12 then
      raise exception 'Adresse de livraison requise (au moins 12 caractères)';
    end if;
  else
    raise exception 'Mode de réception invalide';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'Panier vide ou invalide';
  end if;

  if exists (
    select 1
    from public.customer_abandonment ca
    where ca.user_id = v_uid
      and ca.blocked_until is not null
      and ca.blocked_until > now()
  ) then
    raise exception 'Commande temporairement bloquée (trop d’abandons).';
  end if;

  for it in select * from jsonb_array_elements(p_items)
  loop
    pid := (it->>'product_id')::uuid;
    qty := (it->>'quantity')::int;
    if qty <= 0 then
      raise exception 'Quantité invalide';
    end if;

    select p.price_promo, p.stock, p.vendor_id
    into unit_price, avail, vid
    from public.products p
    join public.vendors v on v.id = p.vendor_id
    where p.id = pid and v.status = 'approved' and p.status = 'active';

    if unit_price is null then
      raise exception 'Produit indisponible';
    end if;

    if avail < qty then
      raise exception 'Stock insuffisant';
    end if;
  end loop;

  v_status :=
    case p_payment
      when 'cash_on_delivery' then 'pending'::public.order_status
      else 'paid'::public.order_status
    end;

  for r_vendor in
    select distinct p.vendor_id as vendor_id
    from jsonb_array_elements(p_items) it
    join public.products p on p.id = (it->>'product_id')::uuid
    join public.vendors v on v.id = p.vendor_id
    where v.status = 'approved' and p.status = 'active'
  loop
    v_total := 0;

    for it in select * from jsonb_array_elements(p_items)
    loop
      pid := (it->>'product_id')::uuid;
      qty := (it->>'quantity')::int;
      select p.price_promo, p.vendor_id
      into unit_price, vid
      from public.products p
      join public.vendors v on v.id = p.vendor_id
      where p.id = pid and v.status = 'approved' and p.status = 'active';

      if vid = r_vendor.vendor_id then
        v_total := v_total + unit_price * qty;
      end if;
    end loop;

    insert into public.orders (
      customer_id,
      status,
      payment_method,
      total_amount,
      delivery_address,
      fulfillment
    )
    values (v_uid, v_status, p_payment, v_total, v_delivery, p_fulfillment)
    returning id into v_order;

    order_ids := array_append(order_ids, v_order);

    for it in select * from jsonb_array_elements(p_items)
    loop
      pid := (it->>'product_id')::uuid;
      qty := (it->>'quantity')::int;
      select p.price_promo, p.vendor_id
      into unit_price, vid
      from public.products p
      join public.vendors v on v.id = p.vendor_id
      where p.id = pid and v.status = 'approved' and p.status = 'active';

      if vid = r_vendor.vendor_id then
        insert into public.order_items (order_id, product_id, quantity, unit_price)
        values (v_order, pid, qty, unit_price);

        update public.products
        set stock = stock - qty, updated_at = now()
        where id = pid;
      end if;
    end loop;
  end loop;

  return order_ids;
end;
$$;

grant execute on function public.create_orders_split_by_vendor(
  public.payment_method,
  jsonb,
  text,
  public.order_fulfillment
) to authenticated;
