import type { BusinessType } from "@/lib/types";

/** Fuseau utilisé pour l’heure « avant 22 h » / minuit (restaurant). */
export function bomaMarketTimeZone(): string {
  if (typeof process === "undefined") return "Africa/Libreville";
  const z = (
    process.env.NEXT_PUBLIC_BOMA_MARKET_TIMEZONE ??
    process.env.BOMA_MARKET_TIMEZONE ??
    ""
  ).trim();
  return z.length > 0 ? z : "Africa/Libreville";
}

/** Publication restaurant : entre 4 h inclus et 22 h exclus (heure locale du fuseau marché). */
export function isRestaurantPublishWindowOpen(
  now = new Date(),
  timeZone = bomaMarketTimeZone(),
): boolean {
  const h = getMarketLocalHour(now, timeZone);
  return h >= 4 && h < 22;
}

export const BOMA_TCHOP_RESTAURANT_PUBLISH_HOURS_FR =
  "Les restaurants ne peuvent mettre une offre sur le marché qu’entre 4 h et 22 h (heure locale du fuseau marché : BOMA_MARKET_TIMEZONE côté serveur, NEXT_PUBLIC_BOMA_MARKET_TIMEZONE côté interface si besoin). En dehors de cette plage, enregistrez en brouillon ou réessayez plus tard.";

/** Heure locale 0–23 dans le fuseau marché (pour une date instantanée UTC). */
export function getMarketLocalHour(date: Date, timeZone = bomaMarketTimeZone()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);
  const h = parts.find((p) => p.type === "hour")?.value;
  return h != null ? parseInt(h, 10) : 0;
}

/** Date calendaire locale (YYYY-MM-DD) dans le fuseau marché. */
function formatYmdInMarket(date: Date, timeZone = bomaMarketTimeZone()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Premier instant (UTC) où le jour calendaire change dans le fuseau marché après `from`.
 * Ex. : mardi 14 h Libreville → mercredi 00 h Libreville.
 */
/**
 * Limite « à consommer avant » imposée côté serveur pour les plats restaurant :
 * dernière seconde avant le minuit marché suivant l’instant `now` (aligné sur la purge quotidienne).
 */
export function getRestaurantListingConsumeBy(
  now = new Date(),
  timeZone = bomaMarketTimeZone(),
): Date {
  const saleEnd = getMarketNextMidnight(now, timeZone);
  return new Date(saleEnd.getTime() - 1000);
}

export function getMarketNextMidnight(
  from: Date,
  timeZone = bomaMarketTimeZone(),
): Date {
  const startLabel = formatYmdInMarket(from, timeZone);
  let lo = from.getTime();
  let hi = from.getTime() + 48 * 60 * 60 * 1000;
  if (formatYmdInMarket(new Date(hi), timeZone) === startLabel) {
    hi = from.getTime() + 8 * 24 * 60 * 60 * 1000;
  }
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (formatYmdInMarket(new Date(mid), timeZone) === startLabel) lo = mid;
    else hi = mid;
  }
  return new Date(hi);
}

/** Refus rare (fenêtre publication / préparation trop tard). */
export const BOMA_TCHOP_RESTAURANT_LISTING_LIMIT_FR =
  "Ce plat ne rentre pas dans la journée BOMA TCHOP : avancez l’heure de préparation ou réessayez demain matin.";

export type PricingEvaluation = {
  ok: boolean;
  /** Taux de réduction en % (valeur positive : ex. 40 = 40 % du prix catalogue en moins). */
  discountPercent?: number;
  refuseReason?: string;
};

export type EvaluateProductPricingOptions = {
  /** Brouillon restaurant : permet d’ajuster les horaires hors plage 4 h–22 h sans publier. */
  skipRestaurantPublishWindow?: boolean;
};

/**
 * Règles de réduction / refus (Fonctionnalites.md)
 * `expiresAt` = date limite de consommation (DLC) pour supermarché.
 * Supermarché : `now` = moment de publication ; réduction selon le nombre de jours jusqu’à la DLC.
 * Restaurant : `preparedAt` (formulaire) ; `consumeBy` doit être fourni par le serveur
 * (ex. `getRestaurantListingConsumeBy(now)`), pas par le client.
 */
export function evaluateProductPricing(
  type: BusinessType,
  input: {
    expiresAt?: Date | null;
    preparedAt?: Date | null;
    consumeBy?: Date | null;
    now?: Date;
  },
  options?: EvaluateProductPricingOptions,
): PricingEvaluation {
  const now = input.now ?? new Date();
  const commerceType: BusinessType =
    (type as unknown as string) === "restaurant" ? "restaurant" : "supermarket";

  if (commerceType === "supermarket") {
    if (!input.expiresAt) {
      return { ok: false, refuseReason: "Date d’expiration requise." };
    }
    const d = daysBetween(now, input.expiresAt);
    if (d < 14) {
      return {
        ok: false,
        refuseReason: "DLC à moins de 2 semaines : refus supermarché.",
      };
    }
    /* Jours restants jusqu’à la DLC au moment de la publication :
     * ≥ 2 mois (~60 j) : −20 % · ≥ 1 mois et < 2 mois : −30 % · ≥ 2 sem. et < 1 mois : −50 % */
    if (d >= 60) return { ok: true, discountPercent: 20 };
    if (d >= 30) return { ok: true, discountPercent: 30 };
    if (d >= 14) return { ok: true, discountPercent: 50 };
    return { ok: false, refuseReason: "Période non éligible." };
  }

  if (commerceType === "restaurant") {
    if (!input.preparedAt) {
      return {
        ok: false,
        refuseReason: "Indiquez l’heure de préparation du plat (obligatoire).",
      };
    }
    if (!input.consumeBy) {
      return {
        ok: false,
        refuseReason: "Limite journée restaurant non calculée (contactez le support).",
      };
    }
    if (input.consumeBy.getTime() <= input.preparedAt.getTime()) {
      return {
        ok: false,
        refuseReason:
          "L’heure de préparation doit être avant la fin de journée BOMA TCHOP (minuit, fuseau marché).",
      };
    }
    const shelfHours =
      (input.consumeBy.getTime() - input.preparedAt.getTime()) /
      (1000 * 60 * 60);
    if (shelfHours < 2) {
      return {
        ok: false,
        refuseReason:
          "Entre la préparation et la fin de journée BOMA TCHOP (minuit, fuseau marché), il faut au moins 2 h.",
      };
    }
    if (shelfHours > 24) {
      return {
        ok: false,
        refuseReason: BOMA_TCHOP_RESTAURANT_LISTING_LIMIT_FR,
      };
    }
    const msUntilConsume = input.consumeBy.getTime() - now.getTime();
    const hoursUntilConsume = msUntilConsume / (1000 * 60 * 60);
    if (hoursUntilConsume < 0) {
      return {
        ok: false,
        refuseReason: "La fin de journée BOMA TCHOP est déjà passée pour aujourd’hui.",
      };
    }
    if (hoursUntilConsume < 2) {
      return {
        ok: false,
        refuseReason:
          "Il doit rester au moins 2 h avant minuit (fuseau marché) pour proposer ce plat aujourd’hui.",
      };
    }
    const nextMarketMidnight = getMarketNextMidnight(now);
    if (input.consumeBy.getTime() >= nextMarketMidnight.getTime()) {
      return {
        ok: false,
        refuseReason: BOMA_TCHOP_RESTAURANT_LISTING_LIMIT_FR,
      };
    }
    if (!options?.skipRestaurantPublishWindow && !isRestaurantPublishWindowOpen(now)) {
      return { ok: false, refuseReason: BOMA_TCHOP_RESTAURANT_PUBLISH_HOURS_FR };
    }
    /* Restaurant : −20 % sur le prix catalogue lorsque l’offre est publiée (mise en ligne) entre
     * 4 h et 22 h. Hors plage autorisée, la publication est refusée (sauf brouillon avec skip).
     * En brouillon hors plage, on conserve l’ancienne logique nuit (−50 %) pour le recalcul local. */
    const h = getMarketLocalHour(now);
    if (h >= 4 && h < 22) return { ok: true, discountPercent: 20 };
    return { ok: true, discountPercent: 50 };
  }

  return { ok: false, refuseReason: "Type d’activité inconnu." };
}

export function applyDiscountPercent(
  priceOriginal: number,
  discountPercent: number,
): number {
  const rate = Math.min(100, Math.max(0, discountPercent));
  const p = Math.round(priceOriginal * (1 - rate / 100));
  return Math.max(0, p);
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
