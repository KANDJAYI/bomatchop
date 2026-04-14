const MS_DAY = 86_400_000;
const MS_HOUR = 3_600_000;

export type SupermarketDlcDisplay = {
  /** Ex. « Encore 45 jours avant expiration » */
  remaining: string;
  /** Ex. « 15 avril 2026 à 23:59 » (fuseau navigateur / serveur selon contexte) */
  deadlineShort: string;
};

export type SupermarketPublicationProgress = {
  /** Durée totale de publication en jours (14, 30, 60). */
  totalDays: number;
  /** Jours écoulés depuis publication (>= 0). */
  elapsedDays: number;
  /** Jours restants avant suppression auto (>= 0). */
  remainingDays: number;
  /** 0..1 progression (écoulé / total). */
  ratio: number;
  /** Ex. « Publication : 10/37 jours » */
  label: string;
};

/**
 * Textes d’affichage pour la DLC supermarché (durée restante + date limite).
 */
export function getSupermarketDlcDisplay(
  expiresAtIso: string,
  now: Date = new Date(),
): SupermarketDlcDisplay | null {
  const end = new Date(expiresAtIso);
  if (Number.isNaN(end.getTime())) return null;

  const deadlineShort = end.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const diff = end.getTime() - now.getTime();
  if (diff <= 0) {
    return { remaining: "DLC dépassée", deadlineShort };
  }

  const days = Math.floor(diff / MS_DAY);
  if (days >= 1) {
    return {
      remaining:
        days === 1
          ? "Encore 1 jour avant expiration"
          : `Encore ${days} jours avant expiration`,
      deadlineShort,
    };
  }

  const hours = Math.max(1, Math.ceil(diff / MS_HOUR));
  return {
    remaining:
      hours >= 24
        ? "Encore moins de 24 h avant expiration"
        : `Encore ~${hours} h avant expiration`,
    deadlineShort,
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function daysBetweenMs(ms: number): number {
  return Math.floor(ms / MS_DAY);
}

/**
 * Durée de publication supermarché (barre) + règle de suppression auto.
 *
 * On déduit le palier “14j / 30j / 60j” à partir de l’écart entre `createdAt` et `expiresAt`
 * au moment de la publication.
 *
 * Règle demandée :
 * - publication 2 semaines → suppression après 14 jours
 * - publication 1 mois → suppression après 30 jours
 * - publication 2 mois → suppression après 60 jours
 */
export function getSupermarketPublicationProgress(
  createdAtIso: string,
  expiresAtIso: string,
  now: Date = new Date(),
): SupermarketPublicationProgress | null {
  const created = new Date(createdAtIso);
  const expires = new Date(expiresAtIso);
  if (Number.isNaN(created.getTime()) || Number.isNaN(expires.getTime())) return null;

  const initialGapDays = daysBetweenMs(expires.getTime() - created.getTime());
  const bucket =
    initialGapDays >= 60 ? 60 : initialGapDays >= 30 ? 30 : initialGapDays >= 14 ? 14 : 14;
  const totalDays = bucket === 60 ? 60 : bucket === 30 ? 30 : 14;

  const elapsedDays = Math.max(0, daysBetweenMs(now.getTime() - created.getTime()));
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const ratio = clamp01(elapsedDays / totalDays);
  return {
    totalDays,
    elapsedDays,
    remainingDays,
    ratio,
    label: `Publication : ${Math.min(elapsedDays, totalDays)}/${totalDays} jours`,
  };
}

/** Une ligne compacte pour cartes / listes. */
export function formatSupermarketDlcOneLine(
  expiresAtIso: string,
  now?: Date,
): string | null {
  const d = getSupermarketDlcDisplay(expiresAtIso, now);
  if (!d) return null;
  return `${d.remaining} · À consommer avant le ${d.deadlineShort}`;
}
