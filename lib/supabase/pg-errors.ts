/** Erreur PostgREST / Postgres quand une colonne n’existe pas encore (migration non appliquée). */
export function isUndefinedColumnError(
  message: string | undefined,
  columnName: string,
): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  const col = columnName.toLowerCase();
  return (
    m.includes(col) &&
    (m.includes("does not exist") ||
      m.includes("n'existe pas") ||
      m.includes("unknown column"))
  );
}
