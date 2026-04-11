import type { BusinessType } from "@/lib/types";

/** Fuseau utilisé pour l’heure « avant 22 h » / minuit (restaurant). */
export function bomaMarketTimeZone(): string {
  const z =
    typeof process !== "undefined"
      ? process.env.BOMA_MARKET_TIMEZONE?.trim()
      : undefined;
  return z && z.length > 0 ? z : "Africa/Libreville";
}

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

export type PricingEvaluation = {
  ok: boolean;
  /** Taux de réduction en % (valeur positive : ex. 40 = 40 % du prix catalogue en moins). */
  discountPercent?: number;
  refuseReason?: string;
};

/**
 * Règles de réduction / refus (Fonctionnalites.md)
 * `expiresAt` = date limite de consommation (DLC) pour supermarché / boutique.
 * Restaurant : utiliser `preparedAt` + `consumeBy` (fin de validité du plat).
 */
export function evaluateProductPricing(
  type: BusinessType,
  input: {
    expiresAt?: Date | null;
    preparedAt?: Date | null;
    consumeBy?: Date | null;
    now?: Date;
  },
): PricingEvaluation {
  const now = input.now ?? new Date();

  if (type === "supermarket") {
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
    if (d >= 60) return { ok: true, discountPercent: 80 };
    if (d >= 30) return { ok: true, discountPercent: 60 };
    if (d >= 14) return { ok: true, discountPercent: 40 };
    return { ok: false, refuseReason: "Période non éligible." };
  }

  if (type === "boutique") {
    if (!input.expiresAt) {
      return { ok: false, refuseReason: "Date d’expiration requise." };
    }
    const d = daysBetween(now, input.expiresAt);
    if (d < 14) {
      return {
        ok: false,
        refuseReason: "DLC à moins de 2 semaines : refus boutique.",
      };
    }
    if (d >= 60) return { ok: true, discountPercent: 60 };
    if (d >= 30) return { ok: true, discountPercent: 45 };
    if (d >= 14) return { ok: true, discountPercent: 30 };
    return { ok: false, refuseReason: "Période non éligible." };
  }

  if (type === "restaurant") {
    if (!input.preparedAt) {
      return {
        ok: false,
        refuseReason: "Indiquez l’heure de préparation du plat (obligatoire).",
      };
    }
    if (!input.consumeBy) {
      return {
        ok: false,
        refuseReason: "Indiquez l’heure d’expiration du plat (à consommer avant).",
      };
    }
    if (input.consumeBy.getTime() <= input.preparedAt.getTime()) {
      return {
        ok: false,
        refuseReason:
          "L’heure d’expiration doit être après l’heure de préparation.",
      };
    }
    const shelfHours =
      (input.consumeBy.getTime() - input.preparedAt.getTime()) /
      (1000 * 60 * 60);
    if (shelfHours < 2) {
      return {
        ok: false,
        refuseReason:
          "Entre la préparation et l’expiration, il faut au moins 2 h (règle sanitaire).",
      };
    }
    if (shelfHours > 24) {
      return {
        ok: false,
        refuseReason:
          "La durée entre préparation et expiration ne peut pas dépasser 24 h.",
      };
    }
    const msUntilConsume = input.consumeBy.getTime() - now.getTime();
    const hoursUntilConsume = msUntilConsume / (1000 * 60 * 60);
    if (hoursUntilConsume < 0) {
      return {
        ok: false,
        refuseReason: "L’heure d’expiration est déjà passée.",
      };
    }
    if (hoursUntilConsume < 2) {
      return {
        ok: false,
        refuseReason:
          "Il doit rester au moins 2 h avant l’expiration pour proposer ce plat.",
      };
    }
    if (hoursUntilConsume > 24) {
      return {
        ok: false,
        refuseReason:
          "L’expiration ne peut pas être à plus de 24 h à partir de maintenant.",
      };
    }
    /* Restaurant : réduction selon l’heure de publication (fuseau marché).
     * Avant 22 h : −25 % → prix promo = 75 % du catalogue.
     * À partir de 22 h : −50 % → prix promo = 50 % du catalogue.
     * (discountPercent = part retirée du prix, voir applyDiscountPercent.) */
    const h = getMarketLocalHour(now);
    if (h >= 22) return { ok: true, discountPercent: 50 };
    return { ok: true, discountPercent: 25 };
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
