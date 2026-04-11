-- Permet au commerçant de faire avancer le statut des commandes qui ne concernent
-- que son commerce (un seul vendor_id sur tous les articles). Les commandes
-- multi-commerces restent gérées par l’admin.

create or replace function public.vendor_update_order_status(
  p_order_id uuid,
  p_new_status public.order_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vid uuid;
  v_current public.order_status;
  v_vendor_count int;
begin
  if auth.uid() is null then
    raise exception 'Non authentifié';
  end if;

  select v.id into v_vid
  from public.vendors v
  where v.user_id = auth.uid() and v.status = 'approved';

  if v_vid is null then
    raise exception 'Compte vendeur non approuvé.';
  end if;

  select count(distinct p.vendor_id) into v_vendor_count
  from public.order_items oi
  join public.products p on p.id = oi.product_id
  where oi.order_id = p_order_id;

  if v_vendor_count = 0 then
    raise exception 'Commande introuvable.';
  end if;

  if v_vendor_count > 1 then
    raise exception 'Cette commande regroupe plusieurs commerces. Seul le support BOMA peut modifier le statut.';
  end if;

  if not exists (
    select 1 from public.order_items oi
    join public.products p on p.id = oi.product_id
    where oi.order_id = p_order_id and p.vendor_id = v_vid
  ) then
    raise exception 'Cette commande ne contient aucun de vos articles.';
  end if;

  select o.status into v_current
  from public.orders o
  where o.id = p_order_id;

  if v_current is null then
    raise exception 'Commande introuvable.';
  end if;

  if p_new_status = v_current then
    return;
  end if;

  if p_new_status = 'abandoned' then
    raise exception 'Statut réservé au système.';
  end if;

  if p_new_status = 'paid' then
    raise exception 'Le statut « payé » est géré automatiquement.';
  end if;

  if p_new_status = 'cancelled' then
    if v_current not in ('pending', 'paid', 'preparing') then
      raise exception 'Impossible d’annuler une commande à ce stade.';
    end if;
    update public.orders
    set status = 'cancelled', updated_at = now()
    where id = p_order_id;
    return;
  end if;

  if p_new_status = 'preparing' then
    if v_current not in ('pending', 'paid') then
      raise exception 'Vous ne pouvez accepter la commande qu’à partir d’« en attente » ou « payé ».';
    end if;
    update public.orders
    set status = 'preparing', updated_at = now()
    where id = p_order_id;
    return;
  end if;

  if p_new_status = 'ready' then
    if v_current <> 'preparing' then
      raise exception 'Indiquez d’abord que la commande est « en préparation ».';
    end if;
    update public.orders
    set status = 'ready', updated_at = now()
    where id = p_order_id;
    return;
  end if;

  if p_new_status = 'completed' then
    if v_current not in ('ready', 'preparing') then
      raise exception 'Terminez le flux : prêt à retirer, ou en préparation.';
    end if;
    update public.orders
    set status = 'completed', updated_at = now()
    where id = p_order_id;
    return;
  end if;

  raise exception 'Transition de statut non autorisée pour le commerçant.';
end;
$$;

grant execute on function public.vendor_update_order_status(uuid, public.order_status) to authenticated;

-- Nombre de commerces distincts dans une commande (pour l’UI vendeur / admin)
create or replace function public.order_distinct_vendor_count(p_order_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select count(distinct p.vendor_id)::integer
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      where oi.order_id = p_order_id
    ),
    0
  );
$$;

grant execute on function public.order_distinct_vendor_count(uuid) to authenticated;
