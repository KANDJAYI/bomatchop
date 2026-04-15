-- Messages de l’admin vers les vendeurs (boîte de réception pro)
create table public.vendor_messages (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  title text not null default 'Message de l’équipe BOMA TCHOP',
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index vendor_messages_vendor_created_idx
  on public.vendor_messages (vendor_id, created_at desc);

alter table public.vendor_messages enable row level security;

create policy "vendor_messages_select_own_vendor"
  on public.vendor_messages for select
  using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_messages.vendor_id and v.user_id = auth.uid()
    )
  );

create policy "vendor_messages_select_admin"
  on public.vendor_messages for select
  using (public.is_admin());

create policy "vendor_messages_insert_admin"
  on public.vendor_messages for insert
  with check (public.is_admin());

create or replace function public.mark_vendor_message_read(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.vendor_messages m
  set read_at = coalesce(m.read_at, now())
  where m.id = p_id
    and exists (
      select 1 from public.vendors v
      where v.id = m.vendor_id and v.user_id = auth.uid()
    );
end;
$$;

grant execute on function public.mark_vendor_message_read(uuid) to authenticated;
