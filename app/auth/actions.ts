"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  applyDiscountPercent,
  evaluateProductPricing,
  getRestaurantListingConsumeBy,
} from "@/lib/business-rules";
import { signVendorDocumentPair } from "@/lib/admin/vendor-docs";
import { isUndefinedColumnError } from "@/lib/supabase/pg-errors";
import {
  isOwnProductImagesPublicUrl,
  removeProductImageIfOwned,
  uploadSellerProductImage,
} from "@/lib/supabase/product-storage";
import type { BusinessType } from "@/lib/types";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase non configuré (.env.local)." };
  }
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/marketplace");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/marketplace");
}

export async function registerAction(
  _prev: { error?: string; message?: string } | null,
  formData: FormData,
): Promise<{ error?: string; message?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase non configuré (.env.local)." };
  }
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? "http://localhost:3000";

  if (phone.length < 8) {
    return { error: "Numéro de téléphone invalide." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {
    message:
      "Compte créé. Si la confirmation e-mail est activée sur Supabase, vérifiez votre boîte.",
  };
}

export async function registerVendorAction(
  _prev: { error?: string; message?: string } | null,
  formData: FormData,
): Promise<{ error?: string; message?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase non configuré (.env.local)." };
  }
  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const business_name = String(formData.get("business_name") ?? "").trim();
  let business_type = String(formData.get("business_type") ?? "supermarket").trim();
  if (business_type === "boutique") business_type = "supermarket";
  if (business_type !== "supermarket" && business_type !== "restaurant") {
    business_type = "supermarket";
  }
  const location = String(formData.get("location") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? "http://localhost:3000";

  const full_name = `${first_name} ${last_name}`.trim();
  if (first_name.length < 1 || last_name.length < 1) {
    return { error: "Indiquez votre prénom et votre nom." };
  }
  if (business_name.length < 2) {
    return { error: "Indiquez le nom de votre commerce." };
  }
  if (location.length < 2) {
    return { error: "Indiquez une localisation (ville, quartier…)." };
  }
  if (phone.length < 8) {
    return { error: "Numéro de téléphone invalide." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        first_name,
        last_name,
        business_name,
        business_type,
        location,
        phone,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {
    message:
      "Compte commerçant créé. Si la confirmation e-mail est activée, validez le lien reçu puis déposez votre dossier (pièces et photos).",
  };
}

/**
 * Crée un utilisateur Auth + profil avec rôle `admin` (API Admin, service role).
 * Protégé par `CREATE_ADMIN_SECRET` dans .env.local — ne jamais exposer la service role au client.
 */
export async function createAdminAccountAction(
  _prev: { error?: string; message?: string } | null,
  formData: FormData,
): Promise<{ error?: string; message?: string }> {
  const expectedSecret = process.env.CREATE_ADMIN_SECRET?.trim();
  if (!expectedSecret) {
    return {
      error:
        "CREATE_ADMIN_SECRET n’est pas défini dans .env.local. Ajoutez une phrase secrète longue, puis redémarrez le serveur.",
    };
  }
  const setupSecret = String(formData.get("setup_secret") ?? "").trim();
  if (setupSecret !== expectedSecret) {
    return { error: "Clé de configuration incorrecte." };
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return {
      error:
        "Client service role indisponible : vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.",
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  if (!email || !password) {
    return { error: "E-mail et mot de passe requis." };
  }
  if (password.length < 8) {
    return { error: "Mot de passe : au moins 8 caractères." };
  }
  if (full_name.length < 2) {
    return { error: "Indiquez un nom affiché (au moins 2 caractères)." };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (createErr) return { error: createErr.message };
  const userId = created.user?.id;
  if (!userId) {
    return { error: "Création utilisateur sans identifiant — vérifiez les logs Supabase." };
  }

  const { error: profileErr } = await admin
    .from("profiles")
    .update({
      role: "admin",
      full_name,
      email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileErr) {
    return {
      error: `Compte créé mais mise à jour du profil en échec : ${profileErr.message}. Corrigez le rôle en SQL : update public.profiles set role = 'admin' where id = '${userId}';`,
    };
  }

  revalidatePath("/", "layout");
  return {
    message: `Administrateur créé pour ${email}. Connectez-vous sur /auth/login puis supprimez ou désactivez cette page en production.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function applyVendorApplication(input: {
  firstName: string;
  lastName: string;
  businessName: string;
  businessType: BusinessType;
  location: string;
  phone: string;
  idDocumentPath: string;
  storefrontPhotoPath: string;
  /** URL publique bucket product-images (portrait, même dossier que votre compte). */
  profilePhotoPublicUrl: string;
}) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Connectez-vous pour postuler." };

  const profileUrl = input.profilePhotoPublicUrl.trim();
  if (!isOwnProductImagesPublicUrl(user.id, profileUrl)) {
    return {
      error:
        "Photo de profil invalide : importez une image depuis le formulaire (fichier portrait).",
    };
  }

  const rawBt = input.businessType as unknown as string;
  const businessType: BusinessType =
    rawBt === "boutique"
      ? "supermarket"
      : rawBt === "restaurant"
        ? "restaurant"
        : "supermarket";

  const rowFull = {
    user_id: user.id,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    business_name: input.businessName.trim(),
    business_type: businessType,
    location: input.location.trim(),
    phone: input.phone.trim(),
    id_document_url: input.idDocumentPath,
    storefront_photo_url: input.storefrontPhotoPath,
    profile_photo_url: profileUrl,
    status: "pending" as const,
  };

  let { error } = await supabase.from("vendors").insert(rowFull);

  if (error && isUndefinedColumnError(error.message, "profile_photo_url")) {
    const { profile_photo_url: _omitProfilePhoto, ...rowLegacy } = rowFull;
    void _omitProfilePhoto;
    ({ error } = await supabase.from("vendors").insert(rowLegacy));
  }

  if (error) {
    if (error.code === "23505") {
      return { error: "Une demande vendeur existe déjà pour ce compte." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function createProductAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  let { data: vendor, error: vendorSelErr } = await supabase
    .from("vendors")
    .select("id, business_type, status, profile_photo_url")
    .eq("user_id", user.id)
    .maybeSingle();

  let vendorSchemaHasProfilePhoto = true;
  if (vendorSelErr && isUndefinedColumnError(vendorSelErr.message, "profile_photo_url")) {
    vendorSchemaHasProfilePhoto = false;
    ({ data: vendor, error: vendorSelErr } = await supabase
      .from("vendors")
      .select("id, business_type, status")
      .eq("user_id", user.id)
      .maybeSingle());
  } else if (vendorSelErr) {
    return { error: vendorSelErr.message };
  }

  if (!vendor || vendor.status !== "approved") {
    return { error: "Compte vendeur non approuvé." };
  }

  const photo = (vendor as { profile_photo_url?: string | null }).profile_photo_url?.trim();
  if (vendorSchemaHasProfilePhoto && !photo) {
    return {
      error:
        "Ajoutez d’abord votre photo de profil commerçant dans l’espace vendeur (obligatoire pour publier).",
    };
  }

  const imageField = formData.get("image");
  const imageFile =
    imageField instanceof File && imageField.size > 0 ? imageField : null;
  if (!imageFile) {
    return { error: "Ajoutez une photo du produit (upload obligatoire)." };
  }

  const uploaded = await uploadSellerProductImage(supabase, user.id, imageFile);
  if ("error" in uploaded) return { error: uploaded.error };
  const imageUrl = uploaded.publicUrl;

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceOriginal = Number(formData.get("price_original"));
  const stock = Number(formData.get("stock") ?? 0);
  const expiresAtRaw = String(formData.get("expires_at") ?? "").trim();
  const preparedAtRaw = String(formData.get("prepared_at") ?? "").trim();

  const businessType = vendor.business_type as BusinessType;

  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  const preparedAt =
    preparedAtRaw && !Number.isNaN(new Date(preparedAtRaw).getTime())
      ? new Date(preparedAtRaw)
      : null;
  const nowCreate = new Date();
  const consumeBy =
    businessType === "restaurant"
      ? getRestaurantListingConsumeBy(nowCreate)
      : null;

  const evalResult = evaluateProductPricing(businessType, {
    expiresAt,
    preparedAt,
    consumeBy,
    now: nowCreate,
  });

  if (!evalResult.ok || evalResult.discountPercent == null) {
    return { error: evalResult.refuseReason ?? "Produit refusé par les règles." };
  }

  const pricePromo = applyDiscountPercent(
    priceOriginal,
    evalResult.discountPercent,
  );

  const { error } = await supabase.from("products").insert({
    vendor_id: vendor.id,
    name,
    description: description || null,
    image_url: imageUrl,
    price_original: priceOriginal,
    price_promo: pricePromo,
    stock: Number.isFinite(stock) ? stock : 0,
    expires_at: expiresAt?.toISOString() ?? null,
    prepared_at: preparedAt?.toISOString() ?? null,
    consume_by: consumeBy?.toISOString() ?? null,
    status: "active",
  });

  if (error) return { error: error.message };

  revalidatePath("/marketplace");
  revalidatePath("/seller");
  revalidatePath("/seller/products");
  return { ok: true as const };
}

export async function updateVendorProfilePhotoAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const imageField = formData.get("profile_photo");
  const file =
    imageField instanceof File && imageField.size > 0 ? imageField : null;
  if (!file) {
    return { error: "Choisissez une photo de profil (portrait, visage visible)." };
  }

  const uploaded = await uploadSellerProductImage(supabase, user.id, file);
  if ("error" in uploaded) return { error: uploaded.error };

  const { error } = await supabase.rpc("set_vendor_profile_photo", {
    p_url: uploaded.publicUrl,
  });
  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("set_vendor_profile_photo") &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return {
        error:
          "Migration Supabase manquante : exécutez le fichier supabase/migrations/20260410120000_vendor_profile_photo.sql dans l’éditeur SQL.",
      };
    }
    return { error: msg };
  }

  revalidatePath("/seller");
  revalidatePath("/seller/account");
  revalidatePath("/marketplace");
  return { ok: true as const };
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { data: product, error: loadErr } = await supabase
    .from("products")
    .select("id, vendor_id, image_url")
    .eq("id", productId)
    .maybeSingle();

  if (loadErr) return { error: loadErr.message };
  if (!product) {
    return { error: "Produit introuvable ou vous n’y avez pas accès." };
  }

  const { data: myVendors, error: vErr } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id);

  if (vErr) return { error: vErr.message };
  const mine = new Set((myVendors ?? []).map((r) => r.id));
  if (!mine.has(product.vendor_id)) {
    return { error: "Vous ne pouvez supprimer que les offres de votre commerce." };
  }

  const { count, error: cErr } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (cErr) return { error: cErr.message };
  if (count != null && count > 0) {
    return {
      error:
        "Impossible de supprimer : ce produit figure déjà dans une ou plusieurs commandes (historique à conserver). Il peut rester « bloqué » hors marché ; contactez le support BOMA TCHOP si vous devez le retirer définitivement.",
    };
  }

  const { data: deleted, error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .select("id");

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.toLowerCase().includes("foreign key") ||
      msg.includes("violates foreign key")
    ) {
      return {
        error:
          "Suppression impossible : ce produit est encore référencé (commande ou donnée liée).",
      };
    }
    return { error: msg };
  }

  if (!deleted?.length) {
    return {
      error:
        "La suppression n’a pas abouti (droits base de données). Vérifiez que la migration RLS produits est à jour, ou contactez le support.",
    };
  }

  await removeProductImageIfOwned(supabase, user.id, product.image_url);

  revalidatePath("/marketplace");
  revalidatePath("/seller");
  revalidatePath("/seller/products");
  return { ok: true as const };
}

export async function adminApproveVendor(vendorId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const { error } = await supabase.rpc("admin_approve_vendor", {
    p_vendor_id: vendorId,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function adminRejectVendor(vendorId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const { error } = await supabase.rpc("admin_reject_vendor", {
    p_vendor_id: vendorId,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function adminSuspendVendor(vendorId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const { error } = await supabase.rpc("admin_suspend_vendor", {
    p_vendor_id: vendorId,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true as const };
}

function parseAdminDateField(
  raw: string,
  label: string,
): { ok: true; iso: string } | { ok: false; error: string } {
  const s = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return { ok: false, error: `${label} : utilisez le format AAAA-MM-JJ.` };
  }
  const t = Date.parse(`${s}T12:00:00.000Z`);
  if (Number.isNaN(t)) {
    return { ok: false, error: `${label} : date invalide.` };
  }
  return { ok: true, iso: new Date(t).toISOString() };
}

/** Enregistre un paiement d’abonnement et la prochaine échéance (console admin). */
export async function adminSetVendorSubscriptionAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const vendorId = String(formData.get("vendor_id") ?? "").trim();
  const clear = String(formData.get("clear_schedule") ?? "") === "1";
  const paidRaw = String(formData.get("paid_at") ?? "").trim();
  const nextRaw = String(formData.get("next_due_at") ?? "").trim();
  const noteRaw = String(formData.get("subscription_note") ?? "").trim();

  if (!vendorId) return { error: "Identifiant vendeur manquant." };

  if (clear) {
    const { error } = await supabase
      .from("vendors")
      .update({
        subscription_last_paid_at: null,
        subscription_next_due_at: null,
        subscription_note: noteRaw.length > 0 ? noteRaw : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendorId);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/admin/vendors");
    revalidatePath("/admin/subscriptions");
    return { ok: true as const };
  }

  const paid = parseAdminDateField(paidRaw, "Date du paiement");
  if (!paid.ok) return { error: paid.error };
  const next = parseAdminDateField(nextRaw, "Prochaine échéance");
  if (!next.ok) return { error: next.error };

  const { error } = await supabase
    .from("vendors")
    .update({
      subscription_last_paid_at: paid.iso,
      subscription_next_due_at: next.iso,
      subscription_note: noteRaw.length > 0 ? noteRaw : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vendorId);

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/subscriptions");
  return { ok: true as const };
}

/** Efface dates + note d’abonnement (sans passer par le formulaire). */
export async function adminWipeVendorSubscriptionAction(vendorId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const id = vendorId.trim();
  if (!id) return { error: "Identifiant vendeur manquant." };
  const { error } = await supabase
    .from("vendors")
    .update({
      subscription_last_paid_at: null,
      subscription_next_due_at: null,
      subscription_note: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/subscriptions");
  return { ok: true as const };
}

const VENDOR_FIELD_CLEAR = {
  id_document: "id_document_url",
  storefront: "storefront_photo_url",
  profile: "profile_photo_url",
  whatsapp: "whatsapp_phone",
} as const;

type VendorFieldClearKind = keyof typeof VENDOR_FIELD_CLEAR;

/** Retire une référence (URL ou texte) du dossier vendeur. */
export async function adminClearVendorFieldAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const vendorId = String(formData.get("vendor_id") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim() as VendorFieldClearKind;
  if (!vendorId) return { error: "Identifiant vendeur manquant." };
  const column = VENDOR_FIELD_CLEAR[kind];
  if (!column) return { error: "Type de suppression invalide." };
  const { error } = await supabase
    .from("vendors")
    .update({
      [column]: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", vendorId);
  if (error) return { error: error.message };
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/subscriptions");
  return { ok: true as const };
}

/**
 * Supprime la ligne vendeur (cascade produits, etc.). Réservé aux statuts
 * `pending` et `rejected` pour limiter les accidents.
 */
export async function adminDeleteVendorRecordAction(vendorId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const id = vendorId.trim();
  if (!id) return { error: "Identifiant vendeur manquant." };

  const { data: row, error: readErr } = await supabase
    .from("vendors")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (readErr) return { error: readErr.message };
  if (!row) return { error: "Vendeur introuvable." };
  if (row.status !== "pending" && row.status !== "rejected") {
    return {
      error:
        "Suppression de la fiche réservée aux dossiers « en attente » ou « refusés ». Pour un commerce approuvé ou suspendu, utilisez « Suspendre » ou traitez les commandes liées avant une suppression en base.",
    };
  }

  const { error, data } = await supabase.from("vendors").delete().eq("id", id).select("id");
  if (error) {
    const msg = error.message ?? "";
    if (
      msg.toLowerCase().includes("foreign key") ||
      msg.includes("violates foreign key")
    ) {
      return {
        error:
          "Suppression impossible : des enregistrements sont encore liés (ex. commandes).",
      };
    }
    return { error: msg };
  }
  if (!data?.length) return { error: "Aucune ligne supprimée." };
  revalidatePath("/admin");
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/subscriptions");
  return { ok: true as const };
}

/** URLs signées bucket privé `vendor-documents` (réservé admin via RLS). */
export async function adminGetVendorDossierSignedUrls(vendorId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const { data: row, error } = await supabase
    .from("vendors")
    .select("id_document_url, storefront_photo_url")
    .eq("id", vendorId)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!row) {
    return { error: "Dossier introuvable ou accès refusé." };
  }
  const urls = await signVendorDocumentPair(
    supabase,
    row.id_document_url,
    row.storefront_photo_url,
  );
  return {
    ok: true as const,
    idDocumentUrl: urls.idDocumentUrl,
    storefrontUrl: urls.storefrontUrl,
    ttlSeconds: 3600 as const,
  };
}

export async function adminBlockProduct(productId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const { error } = await supabase
    .from("products")
    .update({ status: "blocked", updated_at: new Date().toISOString() })
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/marketplace");
  return { ok: true as const };
}

const orderStatuses = [
  "pending",
  "paid",
  "preparing",
  "ready",
  "completed",
  "cancelled",
  "abandoned",
] as const;

export type AdminOrderStatus = (typeof orderStatuses)[number];

export async function adminUpdateOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  if (!orderStatuses.includes(status)) {
    return { error: "Statut de commande invalide." };
  }
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

const vendorOrderActionStatuses = [
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;

export type VendorOrderActionStatus =
  (typeof vendorOrderActionStatuses)[number];

/** Fait avancer une commande (commerce unique) — voir `vendor_update_order_status`. */
export async function vendorUpdateOrderStatusAction(
  orderId: string,
  status: VendorOrderActionStatus,
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  if (!vendorOrderActionStatuses.includes(status)) {
    return { error: "Statut invalide." };
  }
  const { error } = await supabase.rpc("vendor_update_order_status", {
    p_order_id: orderId,
    p_new_status: status,
  });
  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("vendor_update_order_status") &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return {
        error:
          "Migration manquante : exécutez supabase/migrations/20260412100000_vendor_order_status.sql",
      };
    }
    return { error: msg };
  }
  revalidatePath("/seller/orders");
  revalidatePath("/seller");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export type CheckoutFulfillment = "home_delivery" | "pickup";

export async function finalizeCheckoutAction(input: {
  fullName: string;
  phone: string;
  /** Livraison à domicile ou retrait au commerce. */
  fulfillment: CheckoutFulfillment;
  /** Obligatoire si `fulfillment` est `home_delivery` (sinon ignoré). */
  deliveryAddress: string;
  items: { product_id: string; quantity: number }[];
}) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Connectez-vous pour commander." };

  if (!input.items?.length) {
    return { error: "Panier vide." };
  }

  const fulfillment =
    input.fulfillment === "pickup" ? "pickup" : "home_delivery";
  const deliveryAddress = input.deliveryAddress.trim();
  if (fulfillment === "home_delivery" && deliveryAddress.length < 12) {
    return {
      error:
        "Indiquez une adresse de livraison complète (rue, quartier, repères, accès…).",
    };
  }

  const { data: blocked, error: blockErr } = await supabase.rpc(
    "is_my_checkout_blocked",
  );
  if (blockErr) return { error: blockErr.message };
  if (blocked === true) {
    return {
      error:
        "Checkout temporairement bloqué (trop d’abandons de panier). Contactez le support.",
    };
  }

  const { error: profErr } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName.trim(),
      phone: input.phone.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profErr) return { error: profErr.message };

  const payload = input.items.map((i) => ({
    product_id: i.product_id,
    quantity: i.quantity,
  }));

  const { data: orderIdsRaw, error } = await supabase.rpc(
    "create_orders_split_by_vendor",
    {
      p_payment: "cash_on_delivery" as const,
      p_items: payload,
      p_delivery_address:
        fulfillment === "pickup" ? null : deliveryAddress,
      p_fulfillment: fulfillment,
    },
  );

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("create_orders_split_by_vendor") &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return {
        error:
          "Migration Supabase requise : commandes multi-vendeur + livraison + retrait (20260413130000, 20260415140000, 20260415150000_orders_fulfillment_pickup.sql).",
      };
    }
    if (
      (msg.toLowerCase().includes("delivery_address") ||
        msg.toLowerCase().includes("fulfillment")) &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return {
        error:
          "Schéma commandes incomplet : appliquez supabase/migrations/20260415140000_orders_delivery_address.sql puis 20260415150000_orders_fulfillment_pickup.sql",
      };
    }
    return { error: msg };
  }

  const orderIds = Array.isArray(orderIdsRaw)
    ? (orderIdsRaw as string[])
    : orderIdsRaw != null
      ? [String(orderIdsRaw)]
      : [];

  revalidatePath("/dashboard");
  revalidatePath("/seller/orders");
  revalidatePath("/marketplace");
  return { ok: true as const, orderIds };
}

export async function recordCheckoutAbandonAction() {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };
  const { data, error } = await supabase.rpc("record_checkout_abandon");
  if (error) return { error: error.message };
  return { ok: true as const, data };
}

export async function updateProductAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const productId = String(formData.get("product_id") ?? "").trim();
  if (!productId) return { error: "Produit introuvable." };

  let { data: vendor, error: vendorSelErr } = await supabase
    .from("vendors")
    .select("id, business_type, status, profile_photo_url")
    .eq("user_id", user.id)
    .maybeSingle();

  let vendorSchemaHasProfilePhoto = true;
  if (vendorSelErr && isUndefinedColumnError(vendorSelErr.message, "profile_photo_url")) {
    vendorSchemaHasProfilePhoto = false;
    ({ data: vendor, error: vendorSelErr } = await supabase
      .from("vendors")
      .select("id, business_type, status")
      .eq("user_id", user.id)
      .maybeSingle());
  } else if (vendorSelErr) {
    return { error: vendorSelErr.message };
  }

  if (!vendor || vendor.status !== "approved") {
    return { error: "Compte vendeur non approuvé." };
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("products")
    .select("id, vendor_id, image_url, status")
    .eq("id", productId)
    .maybeSingle();

  if (fetchErr || !existing || existing.vendor_id !== vendor.id) {
    return { error: "Offre introuvable ou accès refusé." };
  }

  const statusRaw = String(formData.get("status") ?? "active").trim();
  const status =
    statusRaw === "draft" ? "draft" : statusRaw === "active" ? "active" : null;
  if (!status) {
    return { error: "Statut invalide (brouillon ou actif uniquement)." };
  }

  if (status === "active") {
    const photo = (vendor as { profile_photo_url?: string | null }).profile_photo_url?.trim();
    if (vendorSchemaHasProfilePhoto && !photo) {
      return {
        error:
          "Ajoutez d’abord votre photo de profil commerçant pour publier une offre active.",
      };
    }
  }

  const imageField = formData.get("image");
  const imageFile =
    imageField instanceof File && imageField.size > 0 ? imageField : null;

  let imageUrl = existing.image_url as string | null;
  if (imageFile) {
    const uploaded = await uploadSellerProductImage(supabase, user.id, imageFile);
    if ("error" in uploaded) return { error: uploaded.error };
    imageUrl = uploaded.publicUrl;
    await removeProductImageIfOwned(supabase, user.id, existing.image_url);
  }

  if (!imageUrl) {
    return { error: "Une image est requise (ajoutez une photo ou conservez l’existante)." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceOriginal = Number(formData.get("price_original"));
  const stock = Number(formData.get("stock") ?? 0);
  const expiresAtRaw = String(formData.get("expires_at") ?? "").trim();
  const preparedAtRaw = String(formData.get("prepared_at") ?? "").trim();

  const businessType = vendor.business_type as BusinessType;

  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  const preparedAt =
    preparedAtRaw && !Number.isNaN(new Date(preparedAtRaw).getTime())
      ? new Date(preparedAtRaw)
      : null;
  const nowUpdate = new Date();
  const consumeBy =
    businessType === "restaurant"
      ? getRestaurantListingConsumeBy(nowUpdate)
      : null;

  const evalResult = evaluateProductPricing(
    businessType,
    {
      expiresAt,
      preparedAt,
      consumeBy,
      now: nowUpdate,
    },
    {
      skipRestaurantPublishWindow:
        businessType === "restaurant" && status === "draft",
    },
  );

  if (!evalResult.ok || evalResult.discountPercent == null) {
    return { error: evalResult.refuseReason ?? "Produit refusé par les règles." };
  }

  const pricePromo = applyDiscountPercent(
    priceOriginal,
    evalResult.discountPercent,
  );

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description: description || null,
      image_url: imageUrl,
      price_original: priceOriginal,
      price_promo: pricePromo,
      stock: Number.isFinite(stock) ? stock : 0,
      expires_at: expiresAt?.toISOString() ?? null,
      prepared_at: preparedAt?.toISOString() ?? null,
      consume_by: consumeBy?.toISOString() ?? null,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("vendor_id", vendor.id);

  if (error) return { error: error.message };

  revalidatePath("/marketplace");
  revalidatePath("/seller");
  revalidatePath("/seller/products");
  revalidatePath(`/seller/products/${productId}/edit`);
  return { ok: true as const };
}

export async function updateSellerProfileAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!full_name) {
    return { error: "Le nom affiché est requis." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/seller/account");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function updateVendorShopCoordinatesAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const clear = String(formData.get("clear") ?? "").trim() === "1";

  let pLat: number | null;
  let pLon: number | null;
  if (clear) {
    pLat = null;
    pLon = null;
  } else {
    const lat = Number(String(formData.get("latitude") ?? "").replace(",", "."));
    const lon = Number(String(formData.get("longitude") ?? "").replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return { error: "Latitude et longitude invalides." };
    }
    pLat = lat;
    pLon = lon;
  }

  const { data, error } = await supabase.rpc("set_vendor_shop_coordinates", {
    p_lat: pLat,
    p_lon: pLon,
  });

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("set_vendor_shop_coordinates") &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return {
        error:
          "Migration manquante : exécutez supabase/migrations/20260415100000_vendors_shop_coordinates.sql",
      };
    }
    return { error: msg };
  }

  const payload = data as { ok?: boolean; error?: string } | null;
  if (payload && payload.ok === false && typeof payload.error === "string") {
    return { error: payload.error };
  }

  revalidatePath("/seller/account");
  revalidatePath("/marketplace");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function updateVendorWhatsAppAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const raw = String(formData.get("whatsapp_phone") ?? "").trim();
  if (raw.length > 0) {
    const { toWhatsAppDigits } = await import("@/lib/whatsapp");
    if (!toWhatsAppDigits(raw)) {
      return {
        error:
          "Numéro WhatsApp invalide : indicatif pays inclus, 8 à 15 chiffres (espaces et + acceptés).",
      };
    }
  }

  const { data, error } = await supabase.rpc("set_vendor_whatsapp_phone", {
    p_phone: raw.length > 0 ? raw : null,
  });

  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("set_vendor_whatsapp_phone") &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return {
        error:
          "Migration manquante : exécutez supabase/migrations/20260416200000_vendors_whatsapp_phone.sql",
      };
    }
    return { error: msg };
  }

  const payload = data as { ok?: boolean; error?: string } | null;
  if (payload && payload.ok === false && typeof payload.error === "string") {
    return { error: payload.error };
  }

  revalidatePath("/seller/parametres");
  revalidatePath("/marketplace");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function markVendorMessageReadAction(messageId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { error } = await supabase.rpc("mark_vendor_message_read", {
    p_id: messageId,
  });
  if (error) {
    const msg = error.message ?? "";
    if (
      msg.includes("mark_vendor_message_read") &&
      (msg.includes("does not exist") || msg.includes("n'existe pas"))
    ) {
      return {
        error:
          "Migration manquante : exécutez supabase/migrations/20260411200000_vendor_messages.sql",
      };
    }
    return { error: msg };
  }

  revalidatePath("/seller/messages");
  revalidatePath("/seller");
  return { ok: true as const };
}

export async function adminSendVendorMessageAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: "Accès réservé à l’administration." };
  }

  const vendorId = String(formData.get("vendor_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!vendorId || !body) {
    return { error: "Commerce et message sont requis." };
  }

  const { error } = await supabase.from("vendor_messages").insert({
    vendor_id: vendorId,
    title: title || "Message de l’équipe BOMA TCHOP",
    body,
    sender_id: user.id,
  });

  if (error) {
    if (error.message?.includes("vendor_messages")) {
      return {
        error:
          "Table introuvable : appliquez la migration 20260411200000_vendor_messages.sql",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/seller/messages");
  return { ok: true as const };
}

export async function adminTriggerRestaurantMidnightPurgeAction(): Promise<
  | { ok: true; count: number }
  | { error: string }
> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase n’est pas configuré." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Vous devez être connecté." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { error: profileError.message };
  }
  if (profile?.role !== "admin") {
    return { error: "Accès réservé aux administrateurs." };
  }

  const { data, error } = await supabase.rpc(
    "admin_trigger_restaurant_midnight_purge",
  );

  if (error) {
    return { error: error.message };
  }

  const count = typeof data === "number" ? data : Number(data ?? 0);
  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/seller");
  revalidatePath("/admin/schedule");
  return { ok: true as const, count: Number.isFinite(count) ? count : 0 };
}
