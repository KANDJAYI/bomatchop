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
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-boma-blue/[0.07] p-6 shadow-md shadow-zinc-900/[0.04] ring-1 ring-black/[0.03] dark:border-zinc-700 dark:from-zinc-900 dark:via-zinc-900 dark:to-boma-blue/[0.12] dark:shadow-black/30 dark:ring-white/[0.06] sm:p-8">
      <div className="pointer-events-none absolute -right-8 top-1/2 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-boma-blue/[0.12] blur-3xl dark:bg-boma-blue/25" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 translate-y-1/3 rounded-full bg-boma-forest/[0.08] blur-3xl dark:bg-emerald-500/10" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-10">
        <div className="max-w-xl lg:py-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Identité commerce
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {businessName}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {businessTypeLabel} — offres visibles sur le marché BOMA dès publication.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-3 sm:gap-4 lg:max-w-xl lg:shrink-0">
          <StatBox
            label="Références"
            value={String(productCount)}
            icon={<IconTag />}
            accent="blue"
          />
          <StatBox
            label="Stock total"
            value={String(totalStock)}
            icon={<IconLayers />}
            accent="forest"
          />
          <StatBox
            label="CA potentiel"
            value={formatXAF(revenuePotential)}
            sub="prix promo × stock"
            icon={<IconTrending />}
            accent="revenue"
          />
        </div>
      </div>
    </div>
  );
}

const accentStyles = {
  blue: {
    ring: "ring-boma-blue/20 dark:ring-boma-blue/35",
    iconBg:
      "bg-boma-blue/15 text-boma-blue dark:bg-boma-blue/25 dark:text-boma-blue",
    bar: "from-boma-blue/50 to-boma-blue/10",
  },
  forest: {
    ring: "ring-emerald-500/15 dark:ring-emerald-400/25",
    iconBg:
      "bg-emerald-500/12 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
    bar: "from-emerald-500/45 to-emerald-500/10",
  },
  revenue: {
    ring: "ring-amber-500/20 dark:ring-amber-400/25",
    iconBg:
      "bg-amber-500/12 text-amber-900 dark:bg-amber-500/20 dark:text-amber-100",
    bar: "from-amber-500/50 to-amber-400/10",
  },
} as const;

function StatBox({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  accent: keyof typeof accentStyles;
}) {
  const a = accentStyles[accent];
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-center shadow-sm transition-[box-shadow,transform] duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-zinc-600 dark:bg-zinc-800/95 dark:shadow-black/20 dark:hover:shadow-lg sm:px-4 sm:py-5 ${a.ring} ring-1`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-90 ${a.bar}`}
        aria-hidden
      />
      <div
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl shadow-inner ${a.iconBg}`}
      >
        {icon}
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1.5 truncate text-base font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white sm:text-lg">
        {value}
      </p>
      {sub ? (
        <p className="mt-1 text-[10px] leading-snug text-zinc-500 dark:text-zinc-400 sm:text-[11px]">
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
    <svg className={className ?? "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
    <svg className={className ?? "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
