/**
 * Explications en français pour les expressions cron courantes (horloge du serveur = UTC).
 */
export function humanizeCronSchedule(
  cron: string,
  opts?: { fuseauMarche?: string },
): string {
  const m = cron.trim();
  const zone = opts?.fuseauMarche ?? "Afrique centrale (ex. Libreville, UTC+1)";

  if (m === "0 23 * * *") {
    return `Chaque jour à 23 h (heure du serveur, UTC). En pratique, c’est souvent l’heure du passage à minuit dans votre fuseau marché (${zone}) : les plats restaurant du jour sont alors retirés du marché.`;
  }
  if (m === "0 0 * * *") {
    return `Chaque jour à minuit exactement (UTC), sur le serveur.`;
  }
  if (m === "30 23 * * *") {
    return `Chaque jour à 23 h 30 (UTC), sur le serveur.`;
  }
  return `Planification technique au format « cron » : ${m}. L’heure affichée est celle du serveur de base de données (généralement UTC), pas celle de votre navigateur.`;
}
