-- Position exacte du point de retrait du commerce (WGS84), définie par le vendeur.
alter table public.vendors
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

comment on column public.vendors.latitude is 'Latitude WGS84 du point de retrait (carte / trajet clients).';
comment on column public.vendors.longitude is 'Longitude WGS84 du point de retrait.';

-- Mise à jour sécurisée sans élargir les colonnes modifiables par RLS côté client.
create or replace function public.set_vendor_shop_coordinates(
  p_lat double precision,
  p_lon double precision
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if (p_lat is null) is distinct from (p_lon is null) then
    return jsonb_build_object(
      'ok', false,
      'error', 'Indiquez la latitude et la longitude ensemble, ou effacez les deux.'
    );
  end if;

  if p_lat is not null then
    if p_lat < -90::double precision or p_lat > 90::double precision
       or p_lon < -180::double precision or p_lon > 180::double precision then
      return jsonb_build_object('ok', false, 'error', 'Coordonnées hors limites.');
    end if;
  end if;

  update public.vendors v
  set
    latitude = p_lat,
    longitude = p_lon,
    updated_at = now()
  where v.user_id = auth.uid()
    and v.status in ('pending', 'approved')
  returning v.id into v_id;

  if v_id is null then
    return jsonb_build_object(
      'ok', false,
      'error', 'Commerce introuvable ou statut ne permet pas la mise à jour.'
    );
  end if;

  return jsonb_build_object('ok', true, 'vendor_id', v_id);
end;
$$;

revoke all on function public.set_vendor_shop_coordinates(double precision, double precision) from public;
grant execute on function public.set_vendor_shop_coordinates(double precision, double precision) to authenticated;
