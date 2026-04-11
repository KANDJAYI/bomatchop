-- Restaure le stock quand une commande encore « réservée » passe en annulée / abandonnée.
-- Empêche create_order avec un panier vide.

create or replace function public.restore_order_stock_from_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products p
  set
    stock = p.stock + oi.quantity,
    updated_at = now()
  from public.order_items oi
  where oi.order_id = new.id
    and oi.product_id = p.id;
  return new;
end;
$$;

drop trigger if exists orders_restore_stock_on_cancel_or_abandon on public.orders;

create trigger orders_restore_stock_on_cancel_or_abandon
  after update of status on public.orders
  for each row
  when (
    new.status in ('cancelled', 'abandoned')
    and old.status is distinct from new.status
    and old.status in ('pending', 'paid', 'preparing', 'ready')
  )
  execute function public.restore_order_stock_from_items();

create or replace function public.create_order(
  p_payment public.payment_method,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order uuid;
  v_total numeric(14, 2) := 0;
  it jsonb;
  v_uid uuid := auth.uid();
  pid uuid;
  qty int;
  unit_price numeric(14, 2);
  avail int;
  v_status public.order_status;
begin
  if v_uid is null then
    raise exception 'Non authentifié';
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

    select p.price_promo, p.stock
    into unit_price, avail
    from public.products p
    join public.vendors v on v.id = p.vendor_id
    where p.id = pid and v.status = 'approved' and p.status = 'active';

    if unit_price is null then
      raise exception 'Produit indisponible';
    end if;

    if avail < qty then
      raise exception 'Stock insuffisant';
    end if;

    v_total := v_total + unit_price * qty;
  end loop;

  v_status :=
    case p_payment
      when 'cash_on_delivery' then 'pending'::public.order_status
      else 'paid'::public.order_status
    end;

  insert into public.orders (customer_id, status, payment_method, total_amount)
  values (v_uid, v_status, p_payment, v_total)
  returning id into v_order;

  for it in select * from jsonb_array_elements(p_items)
  loop
    pid := (it->>'product_id')::uuid;
    qty := (it->>'quantity')::int;
    select p.price_promo
    into unit_price
    from public.products p
    join public.vendors v on v.id = p.vendor_id
    where p.id = pid and v.status = 'approved' and p.status = 'active';

    insert into public.order_items (order_id, product_id, quantity, unit_price)
    values (v_order, pid, qty, unit_price);

    update public.products
    set stock = stock - qty, updated_at = now()
    where id = pid;
  end loop;

  return v_order;
end;
$$;
