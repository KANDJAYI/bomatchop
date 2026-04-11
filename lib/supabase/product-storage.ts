import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;

function safeImageExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(fromName)) {
    return fromName === "jpg" ? "jpeg" : fromName;
  }
  const t = file.type.toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("webp")) return "webp";
  if (t.includes("heic") || t.includes("heif")) return "heic";
  return "jpeg";
}

export async function uploadSellerProductImage(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ publicUrl: string } | { error: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "Le fichier doit être une image (JPG, PNG, WebP…)." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image trop volumineuse (5 Mo maximum)." };
  }
  if (file.size === 0) {
    return { error: "Image invalide." };
  }

  const ext = safeImageExtension(file);
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const buf = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, new Uint8Array(buf), {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}

const PUBLIC_MARKER = "/object/public/product-images/";

/** Vérifie qu’une URL publique pointe bien vers le dossier product-images du vendeur. */
export function isOwnProductImagesPublicUrl(userId: string, url: string): boolean {
  if (!url || typeof url !== "string" || url.length > 4096) return false;
  const needle = `/object/public/product-images/${userId}/`;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.pathname.includes(needle);
  } catch {
    return false;
  }
}

export async function removeProductImageIfOwned(
  supabase: SupabaseClient,
  userId: string,
  imageUrl: string | null | undefined,
): Promise<void> {
  if (!imageUrl || !imageUrl.includes("product-images")) return;
  const idx = imageUrl.indexOf(PUBLIC_MARKER);
  if (idx === -1) return;
  const path = decodeURIComponent(imageUrl.slice(idx + PUBLIC_MARKER.length));
  if (!path.startsWith(`${userId}/`)) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
