"use client";

import {
  faBasketShopping,
  faShop,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { VendorType } from "@/lib/types";

const CATEGORY_ICONS: Record<VendorType, IconDefinition> = {
  restaurant: faUtensils,
  supermarche: faBasketShopping,
  boutique: faShop,
};

const ICON_RING: Record<VendorType, string> = {
  restaurant:
    "bg-boma-spectrum-red/15 text-boma-spectrum-red dark:bg-boma-spectrum-red/25 dark:text-boma-spectrum-red",
  supermarche:
    "bg-boma-blue/15 text-boma-blue dark:bg-boma-blue/20 dark:text-boma-blue",
  boutique:
    "bg-boma-spectrum-yellow/20 text-boma-forest dark:bg-boma-spectrum-yellow/25 dark:text-boma-spectrum-yellow",
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
    <ul className="grid gap-4 sm:grid-cols-3">
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
              <span className="mt-2 text-sm font-semibold text-boma-forest transition-colors group-hover:text-boma-blue dark:text-boma-spectrum-yellow dark:group-hover:text-boma-blue">
                Explorer →
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
