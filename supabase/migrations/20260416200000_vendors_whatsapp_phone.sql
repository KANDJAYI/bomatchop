-- Numéro WhatsApp dédié au retrait sur place (restaurants), affiché au checkout.
alter table public.vendors
  add column if not exists whatsapp_phone text;

comment on column public.vendors.whatsapp_phone is 'WhatsApp pour convenir du retrait (indicatif pays inclus). Utilisé au checkout si renseigné ; sinon repli sur vendors.phone.';

create or replace function public.set_vendor_whatsapp_phone(p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_clean text;
begin
  v_clean := nullif(trim(coalesce(p_phone, '')), '');

  update public.vendors v
  set
    whatsapp_phone = v_clean,
    updated_at = now()
  where v.user_id = auth.uid()
    and v.status = 'approved'
    and v.business_type = 'restaurant'
  returning v.id into v_id;

  if v_id is null then
    return jsonb_build_object(
      'ok', false,
      'error',
      'Réservé aux restaurants approuvés, ou commerce introuvable.'
    );
  end if;

  return jsonb_build_object('ok', true, 'vendor_id', v_id);
end;
$$;

revoke all on function public.set_vendor_whatsapp_phone(text) from public;
grant execute on function public.set_vendor_whatsapp_phone(text) to authenticated;
