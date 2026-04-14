"use client";

import { useEffect, useState } from "react";
import {
  bomaMarketTimeZone,
  isRestaurantPublishWindowOpen,
} from "@/lib/business-rules";

/** Heure locale du marché (pour affichage). */
function formatMarketTimeLabel(d = new Date(), timeZone = bomaMarketTimeZone()) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function useRestaurantPublishWindowOpen(pollMs = 45_000) {
  const [open, setOpen] = useState(() => isRestaurantPublishWindowOpen());
  useEffect(() => {
    const tick = () => setOpen(isRestaurantPublishWindowOpen());
    tick();
    const id = setInterval(tick, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);
  return open;
}

export function RestaurantPublishClosedBanner() {
  const open = useRestaurantPublishWindowOpen();
  if (open) return null;
  const tz = bomaMarketTimeZone();
  return (
    <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-50">
      <p className="font-semibold text-foreground dark:text-amber-50">
        Fenêtre de publication fermée
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted dark:text-amber-100/90">
        Les restaurants ne peuvent pas mettre d’offre <strong>active</strong> sur le marché entre
        22 h et 4 h (heure locale du fuseau <code className="rounded bg-black/5 px-1 py-0.5 text-[11px] dark:bg-white/10">{tz}</code>
        ). Il est actuellement <strong>{formatMarketTimeLabel()}</strong> sur ce fuseau. Vous pouvez
        enregistrer en <strong>brouillon</strong> ou revenir entre 4 h et 22 h.
      </p>
    </div>
  );
}
