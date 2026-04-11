import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "vendor-documents";
/** Durée de validité des URL signées (accès admin aux documents). */
const SIGNED_TTL_SEC = 3600;

export async function signVendorDocumentPair(
  supabase: SupabaseClient,
  idPath: string | null | undefined,
  storefrontPath: string | null | undefined,
): Promise<{ idDocumentUrl: string | null; storefrontUrl: string | null }> {
  let idDocumentUrl: string | null = null;
  let storefrontUrl: string | null = null;

  if (idPath?.trim()) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(idPath.trim(), SIGNED_TTL_SEC);
    if (!error && data?.signedUrl) idDocumentUrl = data.signedUrl;
  }

  if (storefrontPath?.trim()) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storefrontPath.trim(), SIGNED_TTL_SEC);
    if (!error && data?.signedUrl) storefrontUrl = data.signedUrl;
  }

  return { idDocumentUrl, storefrontUrl };
}
