function normalizeUrl(raw: string): string {
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

/**
 * URL canonique du site (prod/dev).
 *
 * - Préfère `NEXT_PUBLIC_SITE_URL` si défini (ex: https://boma.ga)
 * - Sinon utilise `VERCEL_URL` si présent (ex: my-app.vercel.app)
 * - Fallback local.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return normalizeUrl(explicit);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const withProto = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return normalizeUrl(withProto);
  }

  return "http://localhost:3000";
}

export function getSiteOrigin(): URL {
  return new URL(getSiteUrl());
}

