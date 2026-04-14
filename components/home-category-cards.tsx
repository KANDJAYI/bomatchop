"use client";

import {
  faArrowRight,
  faBasketShopping,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { VendorType } from "@/lib/types";

const CATEGORY_ICONS: Record<VendorType, IconDefinition> = {
  restaurant: faUtensils,
  supermarche: faBasketShopping,
};

const ICON_RING: Record<VendorType, string> = {
  restaurant:
    "bg-boma-spectrum-red/15 text-boma-spectrum-red dark:bg-boma-spectrum-red/25 dark:text-boma-spectrum-red",
  supermarche:
    "bg-boma-blue/15 text-boma-blue dark:bg-boma-blue/20 dark:text-boma-blue",
};

/** CTA pill — couleur alignée sur le type de commerce */
const CTA_PILL: Record<VendorType, string> = {
  restaurant: [
    "border-boma-spectrum-red/35 text-boma-spectrum-red",
    "shadow-[0_2px_16px_rgba(220,38,38,0.14)]",
    "ring-1 ring-boma-spectrum-red/15",
    "group-hover:border-transparent group-hover:text-white",
    "group-hover:bg-gradient-to-r group-hover:from-boma-spectrum-red group-hover:to-orange-500",
    "group-hover:shadow-[0_10px_32px_-4px_rgba(220,38,38,0.45)] group-hover:ring-boma-spectrum-red/25",
    "dark:border-boma-spectrum-red/45 dark:ring-boma-spectrum-red/20",
  ].join(" "),
  supermarche: [
    "border-boma-blue/35 text-boma-blue",
    "shadow-[0_2px_16px_rgba(37,99,235,0.14)]",
    "ring-1 ring-boma-blue/15",
    "group-hover:border-transparent group-hover:text-white",
    "group-hover:bg-gradient-to-r group-hover:from-boma-blue group-hover:to-sky-500",
    "group-hover:shadow-[0_10px_32px_-4px_rgba(37,99,235,0.42)] group-hover:ring-boma-blue/25",
    "dark:border-boma-blue/45 dark:ring-boma-blue/20",
  ].join(" "),
};

export type HomeCategoryItem = {
  type: VendorType;
  label: string;
  description: string;
  accentClass: string;
  count: number;
};

export function HomeCategoryCardsList({ items }: { items: HomeCategoryItem[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((c) => (
        <li key={c.type}>
          <Link
            href={`/marketplace?type=${c.type}`}
            className="boma-panel boma-panel--glow group relative block overflow-hidden rounded-3xl bg-card p-6 shadow-sm ring-1 ring-foreground/[0.05] transition-all duration-300 hover:-translate-y-0.5 dark:ring-white/[0.06]"
          >
            <div
              className={`pointer-events-none absolute inset-0 opacity-90 ${c.accentClass}`}
              aria-hidden
            />
            <div className="relative flex min-h-[160px] flex-col">
              <span
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${ICON_RING[c.type]}`}
              >
                <FontAwesomeIcon
                  icon={CATEGORY_ICONS[c.type]}
                  className="h-6 w-6"
                  aria-hidden
                />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">
                {c.label}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted leading-relaxed">
                {c.description}
              </p>
              {c.count > 0 ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-boma-blue">
                  {c.count}{" "}
                  {c.count === 1 ? "offre en ligne" : "offres en ligne"}
                </p>
              ) : (
                <p className="mt-4 text-xs text-muted">Voir le marché</p>
              )}
              <span
                className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full border bg-white/90 px-4 py-2.5 text-sm font-semibold tracking-tight backdrop-blur-[6px] transition-all duration-300 ease-out dark:bg-card/80 ${CTA_PILL[c.type]}`}
              >
                Explorer
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-current/10 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:bg-white/20"
                  aria-hidden
                >
                  <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
                </span>
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
