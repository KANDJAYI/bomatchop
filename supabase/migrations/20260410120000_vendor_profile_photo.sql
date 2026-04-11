-- Bases déjà initialisées sans colonne : ajout portrait vendeur + RPC de mise à jour
alter table public.vendors
  add column if not exists profile_photo_url text;

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

grant execute on function public.set_vendor_profile_photo(text) to authenticated;
