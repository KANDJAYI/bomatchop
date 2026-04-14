-- Messages de contact (public) → console admin

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_message_status') then
    create type public.contact_message_status as enum ('new', 'open', 'answered', 'closed');
  end if;
end$$;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status public.contact_message_status not null default 'new',
  admin_reply text,
  replied_at timestamptz,
  handled_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

alter table public.contact_messages enable row level security;

-- Public : autorise l’envoi de message via API (anon/auth)
create policy "contact_messages_insert_public"
  on public.contact_messages for insert
  with check (true);

-- Admin : lecture / gestion complète
create policy "contact_messages_select_admin"
  on public.contact_messages for select
  using (public.is_admin());

create policy "contact_messages_update_admin"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages_delete_admin"
  on public.contact_messages for delete
  using (public.is_admin());

