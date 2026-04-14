-- Retrait du type d’activité « boutique » côté produit : les commerces concernés
-- deviennent « supermarché » (mêmes règles de dépôt d’offres).
update public.vendors
set
  business_type = 'supermarket'::public.business_type,
  updated_at = now()
where business_type = 'boutique'::public.business_type;
