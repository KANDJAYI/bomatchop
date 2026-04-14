-- BOMA — schéma initial Supabase (RLS, auth, stockage)
-- Exécuter via Supabase SQL Editor ou `supabase db push`

create extension if not exists "pgcrypto";

-- ─── Types ───────────────────────────────────────────────────────────
create type public.app_role as enum ('client', 'vendor', 'admin');
create type public.vendor_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.business_type as enum ('supermarket', 'boutique', 'restaurant');
create type public.product_status as enum ('draft', 'active', 'blocked');
create type public.order_status as enum (
  'pending',
  'paid',
  'preparing',
  'ready',
  'completed',
  'cancelled',
  'abandoned'
);
create type public.payment_method as enum (
  'cash_on_delivery',
  'airtel_money',
  'moov_money'
);

-- ─── Profiles ────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role public.app_role not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- ─── Vendors ─────────────────────────────────────────────────────────
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  business_name text not null,
  business_type public.business_type not null,
  location text not null,
  phone text not null,
  id_document_url text,
  storefront_photo_url text,
  profile_photo_url text,
  status public.vendor_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index vendors_status_idx on public.vendors (status);

-- ─── Products ────────────────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  price_original numeric(14, 2) not null check (price_original >= 0),
  price_promo numeric(14, 2) not null check (price_promo >= 0),
  stock integer not null default 0 check (stock >= 0),
  expires_at timestamptz,
  prepared_at timestamptz,
  consume_by timestamptz,
  status public.product_status not null default 'draft',
  visibility_boost boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_vendor_idx on public.products (vendor_id);
create index products_status_idx on public.products (status);

-- ─── Orders ──────────────────────────────────────────────────────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  status public.order_status not null default 'pending',
  payment_method public.payment_method not null,
  total_amount numeric(14, 2) not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_idx on public.orders (customer_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0)
);

create index order_items_order_idx on public.order_items (order_id);

-- ─── Abandon anti-fraude ─────────────────────────────────────────────
create table public.customer_abandonment (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  abandon_count integer not null default 0 check (abandon_count >= 0),
  blocked_until timestamptz,
  last_warned_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ─── Helpers RLS ───────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_approved_vendor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.vendors v
    where v.user_id = auth.uid() and v.status = 'approved'
  );
$$;

create or replace function public.my_vendor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select v.id from public.vendors v
  where v.user_id = auth.uid() and v.status = 'approved'
  limit 1;
$$;

-- ─── Trigger profil à l’inscription ───────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'client'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── RPC admin / abandon ─────────────────────────────────────────────
create or replace function public.admin_approve_vendor(p_vendor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Accès refusé';
  end if;
  update public.vendors
  set status = 'approved', updated_at = now()
  where id = p_vendor_id
  returning user_id into v_user;
  if v_user is null then
    raise exception 'Vendeur introuvable';
  end if;
  update public.profiles set role = 'vendor', updated_at = now() where id = v_user;
end;
$$;

create or replace function public.admin_reject_vendor(p_vendor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès refusé';
  end if;
  update public.vendors
  set status = 'rejected', updated_at = now()
  where id = p_vendor_id;
end;
$$;

create or replace function public.admin_suspend_vendor(p_vendor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Accès refusé';
  end if;
  update public.vendors
  set status = 'suspended', updated_at = now()
  where id = p_vendor_id
  returning user_id into v_user;
  if v_user is not null then
    update public.profiles set role = 'client', updated_at = now() where id = v_user;
  end if;
end;
$$;

-- Photo portrait du commerçant (visible sur les annonces ; mise à jour par le vendeur approuvé)
create or replace function public.set_vendor_profile_photo(p_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(trim(p_url), '') = '' then
    raise exception 'URL requise';
  end if;
  update public.vendors v
  set profile_photo_url = trim(p_url), updated_at = now()
  where v.user_id = auth.uid() and v.status = 'approved';
  if not found then
    raise exception 'Aucun commerce approuvé pour ce compte';
  end if;
end;
$$;

-- Chaque minuit (cron + service_role) : plats restaurant actifs supprimés s’ils n’ont jamais été commandés, sinon bloqués.
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

create or replace function public.record_checkout_abandon()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c int;
  blk timestamptz;
  msg text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'Non connecté');
  end if;

  insert into public.customer_abandonment (user_id, abandon_count, updated_at)
  values (auth.uid(), 1, now())
  on conflict (user_id) do update
  set
    abandon_count = public.customer_abandonment.abandon_count + 1,
    updated_at = now()
  returning abandon_count into c;

  if c between 1 and 2 then
    msg := 'warning';
    update public.customer_abandonment set last_warned_at = now() where user_id = auth.uid();
  elsif c between 3 and 5 then
    blk := now() + interval '3 days';
    update public.customer_abandonment set blocked_until = blk where user_id = auth.uid();
    msg := 'blocked_temp';
  else
    blk := now() + interval '90 days';
    update public.customer_abandonment set blocked_until = blk where user_id = auth.uid();
    msg := 'suspended';
  end if;

  return jsonb_build_object('ok', true, 'count', c, 'level', msg, 'blocked_until', blk);
end;
$$;

create or replace function public.is_my_checkout_blocked()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ca.blocked_until is not null and ca.blocked_until > now()
      from public.customer_abandonment ca
      where ca.user_id = auth.uid()
    ),
    false
  );
$$;

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

grant execute on function public.admin_approve_vendor(uuid) to authenticated;
grant execute on function public.admin_reject_vendor(uuid) to authenticated;
grant execute on function public.admin_suspend_vendor(uuid) to authenticated;
grant execute on function public.set_vendor_profile_photo(text) to authenticated;
grant execute on function public.record_checkout_abandon() to authenticated;
grant execute on function public.is_my_checkout_blocked() to authenticated;
grant execute on function public.create_order(public.payment_method, jsonb) to authenticated;

-- ─── RLS ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customer_abandonment enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

create policy "profiles_admin_update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- vendors
create policy "vendors_select_public_approved_or_own_or_admin"
  on public.vendors for select
  using (
    status = 'approved'
    or user_id = auth.uid()
    or public.is_admin()
  );

create policy "vendors_insert_own_pending"
  on public.vendors for insert
  with check (
    user_id = auth.uid()
    and status = 'pending'
  );

create policy "vendors_update_own_when_pending"
  on public.vendors for update
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid());

create policy "vendors_admin_update"
  on public.vendors for update
  using (public.is_admin())
  with check (public.is_admin());

-- products: lecture publique si vendeur approuvé et produit actif
create policy "products_select_visible"
  on public.products for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.vendors v
      where v.id = products.vendor_id
        and v.status = 'approved'
        and products.status = 'active'
    )
    or exists (
      select 1 from public.vendors v2
      where v2.id = products.vendor_id and v2.user_id = auth.uid()
    )
  );

create policy "products_vendor_manage"
  on public.products for insert
  with check (
    vendor_id = public.my_vendor_id()
    and public.my_vendor_id() is not null
  );

create policy "products_vendor_update"
  on public.products for update
  using (
    exists (
      select 1 from public.vendors v
      where v.id = products.vendor_id and v.user_id = auth.uid() and v.status = 'approved'
    )
  );

create policy "products_vendor_delete"
  on public.products for delete
  using (
    exists (
      select 1 from public.vendors v
      where v.id = products.vendor_id and v.user_id = auth.uid() and v.status = 'approved'
    )
  );

create policy "products_admin_update"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

-- orders
create policy "orders_select_customer_vendor_admin"
  on public.orders for select
  using (
    customer_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.vendors v on v.id = p.vendor_id
      where oi.order_id = orders.id and v.user_id = auth.uid()
    )
  );

create policy "orders_insert_own_customer"
  on public.orders for insert
  with check (customer_id = auth.uid());

create policy "orders_admin_update"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- order_items
create policy "order_items_select_linked"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          o.customer_id = auth.uid()
          or exists (
            select 1 from public.products p
            join public.vendors v on v.id = p.vendor_id
            where p.id = order_items.product_id and v.user_id = auth.uid()
          )
        )
    )
  );

create policy "order_items_insert_own_order"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
  );

create policy "order_items_admin_update"
  on public.order_items for update
  using (public.is_admin())
  with check (public.is_admin());

-- abandonment
create policy "abandonment_select_own"
  on public.customer_abandonment for select
  using (user_id = auth.uid() or public.is_admin());

create policy "abandonment_insert_own"
  on public.customer_abandonment for insert
  with check (user_id = auth.uid());

create policy "abandonment_update_own"
  on public.customer_abandonment for update
  using (user_id = auth.uid());

create policy "abandonment_admin_all"
  on public.customer_abandonment for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Storage ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('vendor-documents', 'vendor-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "vendor_docs_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'vendor-documents'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "vendor_docs_select_own_or_admin"
  on storage.objects for select
  using (
    bucket_id = 'vendor-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "product_images_authenticated_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_own_update_delete"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "product_images_own_delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
