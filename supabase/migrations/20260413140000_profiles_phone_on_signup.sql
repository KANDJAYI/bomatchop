-- Enregistrer le téléphone saisi à l’inscription (métadonnées utilisateur) dans public.profiles.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), ''),
    'client'
  );
  return new;
end;
$$;
