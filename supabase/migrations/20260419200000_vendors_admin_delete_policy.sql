-- Permet à l’admin de supprimer une ligne vendeur (ex. demande en attente / refusée),
-- sous réserve des contraintes FK (produits liés à des commandes, etc.).

create policy "vendors_admin_delete"
  on public.vendors for delete
  using (public.is_admin());
