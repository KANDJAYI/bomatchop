import type { ReactNode } from "react";
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
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-zinc-50/80 to-boma-blue/[0.06] p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900/90 dark:via-zinc-900/70 dark:to-boma-blue/10 sm:p-8">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full bg-boma-blue/[0.06] blur-3xl dark:bg-boma-blue/20" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Identité commerce
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {businessName}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {businessTypeLabel} — offres visibles sur le marché BOMA dès publication.
          </p>
        </div>
        <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3 lg:max-w-lg lg:shrink-0">
          <StatBox label="Références" value={String(productCount)} icon={<IconTag />} />
          <StatBox label="Stock total" value={String(totalStock)} icon={<IconLayers />} />
          <StatBox
            label="CA potentiel"
            value={formatXAF(revenuePotential)}
            sub="prix promo × stock"
            icon={<IconTrending />}
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
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white/90 px-3 py-3 text-center shadow-sm dark:border-zinc-700/80 dark:bg-zinc-950/50 sm:px-4 sm:py-4">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {icon}
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold tabular-nums tracking-tight text-foreground sm:text-base">
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[9px] leading-tight text-muted sm:text-[10px]">{sub}</p> : null}
    </div>
  );
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9h.01" />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function IconTrending({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
