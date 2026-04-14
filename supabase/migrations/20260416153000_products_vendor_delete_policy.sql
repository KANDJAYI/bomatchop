-- Aligner la suppression produit vendeur avec la lecture : le vendeur peut supprimer
-- ses propres lignes tant qu’il en est propriétaire (même si le statut commerce change).
-- Avant : seuls les vendeurs « approved » pouvaient DELETE → échec silencieux (0 ligne) dans certains cas.
drop policy if exists "products_vendor_delete" on public.products;

create policy "products_vendor_delete"
  on public.products for delete
  using (
    exists (
      select 1 from public.vendors v
      where v.id = products.vendor_id
        and v.user_id = auth.uid()
    )
  );
