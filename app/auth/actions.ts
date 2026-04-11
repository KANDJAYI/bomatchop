"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  applyDiscountPercent,
  evaluateProductPricing,
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
  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
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

  const rowFull = {
    user_id: user.id,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    business_name: input.businessName.trim(),
    business_type: input.businessType,
    location: input.location.trim(),
    phone: input.phone.trim(),
    id_document_url: input.idDocumentPath,
    storefront_photo_url: input.storefrontPhotoPath,
    profile_photo_url: profileUrl,
    status: "pending" as const,
  };

  let { error } = await supabase.from("vendors").insert(rowFull);

  if (error && isUndefinedColumnError(error.message, "profile_photo_url")) {
    const { profile_photo_url: _p, ...rowLegacy } = rowFull;
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
  const consumeByRaw = String(formData.get("consume_by") ?? "").trim();

  const businessType = vendor.business_type as BusinessType;

  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  const preparedAt =
    preparedAtRaw && !Number.isNaN(new Date(preparedAtRaw).getTime())
      ? new Date(preparedAtRaw)
      : null;
  const consumeBy =
    consumeByRaw && !Number.isNaN(new Date(consumeByRaw).getTime())
      ? new Date(consumeByRaw)
      : null;

  const evalResult = evaluateProductPricing(businessType, {
    expiresAt,
    preparedAt,
    consumeBy,
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

  const { data: row } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };

  await removeProductImageIfOwned(supabase, user.id, row?.image_url);

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
  return { ok: true as const };
}

export async function finalizeCheckoutAction(input: {
  fullName: string;
  phone: string;
  paymentMethod: "cash_on_delivery" | "airtel_money" | "moov_money";
  items: { product_id: string; quantity: number }[];
}) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Connectez-vous pour commander." };

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

  const { data: orderId, error } = await supabase.rpc("create_order", {
    p_payment: input.paymentMethod,
    p_items: payload,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true as const, orderId: orderId as string };
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
  const consumeByRaw = String(formData.get("consume_by") ?? "").trim();

  const businessType = vendor.business_type as BusinessType;

  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  const preparedAt =
    preparedAtRaw && !Number.isNaN(new Date(preparedAtRaw).getTime())
      ? new Date(preparedAtRaw)
      : null;
  const consumeBy =
    consumeByRaw && !Number.isNaN(new Date(consumeByRaw).getTime())
      ? new Date(consumeByRaw)
      : null;

  const evalResult = evaluateProductPricing(businessType, {
    expiresAt,
    preparedAt,
    consumeBy,
  });

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
    title: title || "Message de l’équipe BOMA",
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
