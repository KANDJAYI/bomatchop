-- Abonnements vendeurs : dates de paiement et prochaine échéance (admin).

alter table public.vendors
  add column if not exists subscription_last_paid_at timestamptz,
  add column if not exists subscription_next_due_at timestamptz,
  add column if not exists subscription_note text;

comment on column public.vendors.subscription_last_paid_at is 'Dernier paiement d’abonnement enregistré par l’admin.';
comment on column public.vendors.subscription_next_due_at is 'Prochaine date d’échéance (rappels admin).';
comment on column public.vendors.subscription_note is 'Commentaire interne admin (facultatif).';

create index if not exists vendors_subscription_next_due_idx
  on public.vendors (subscription_next_due_at)
  where subscription_next_due_at is not null and status = 'approved';
