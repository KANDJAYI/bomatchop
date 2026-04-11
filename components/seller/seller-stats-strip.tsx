import { formatXAF } from "@/lib/mock-products";

type Props = {
  businessName: string;
  businessTypeLabel: string;
  productCount: number;
  totalStock: number;
  revenuePotential: number;
};

export function SellerStatsStrip({
  businessName,
  businessTypeLabel,
  productCount,
  totalStock,
  revenuePotential,
}: Props) {
  return (
    <div className="boma-panel boma-panel--glow overflow-hidden rounded-3xl bg-gradient-to-br from-boma-forest/12 via-card to-boma-blue/[0.08] p-6 sm:p-8 dark:from-boma-forest/25 dark:via-card dark:to-boma-blue/10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-boma-forest dark:text-boma-spectrum-yellow">
            Espace professionnel
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {businessName}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {businessTypeLabel} — vos offres sont diffusées sur le marché BOMA dès
            publication.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatBox label="Références" value={String(productCount)} />
          <StatBox label="Stock total" value={String(totalStock)} />
          <StatBox
            label="CA potentiel"
            value={formatXAF(revenuePotential)}
            sub="(prix promo × stock)"
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="boma-panel rounded-2xl bg-background/90 px-3 py-3 text-center dark:bg-background/40 sm:px-4 sm:py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-foreground sm:text-base">{value}</p>
      {sub ? <p className="mt-0.5 text-[9px] text-muted sm:text-[10px]">{sub}</p> : null}
    </div>
  );
}
