"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const ROLES = ["client", "vendor", "admin"] as const;
export type AppRole = (typeof ROLES)[number];

function isRole(v: unknown): v is AppRole {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." as const, supabase: null, userId: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { error: "Non authentifié." as const, supabase, userId: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { error: "Accès refusé." as const, supabase, userId: null };
  }
  return { error: null as const, supabase, userId: user.id };
}

export async function adminUpdateUserFromForm(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const phoneRaw = String(formData.get("phone") ?? "");
  const roleRaw = String(formData.get("role") ?? "");
  if (!isRole(roleRaw)) return { error: "Rôle invalide." };
  return adminUpdateUserProfile({
    id,
    fullName,
    phone: phoneRaw.trim() || null,
    role: roleRaw,
  });
}

export async function adminUpdateUserProfile(input: {
  id: string;
  fullName: string;
  phone: string | null;
  role: AppRole;
}) {
  const gate = await requireAdmin();
  if (gate.error || !gate.supabase) return { error: gate.error ?? "Erreur." };

  const id = input.id.trim();
  if (!id) return { error: "Utilisateur invalide." };

  const fullName = input.fullName.trim();
  if (fullName.length < 2) return { error: "Nom trop court." };

  if (!isRole(input.role)) return { error: "Rôle invalide." };

  const { data: target } = await gate.supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();

  if (!target) return { error: "Profil introuvable." };

  if (target.role === "admin" && input.role !== "admin" && gate.userId === id) {
    const { count, error: cErr } = await gate.supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) return { error: cErr.message };
    if ((count ?? 0) <= 1) {
      return { error: "Impossible : vous êtes le dernier administrateur." };
    }
  }

  const { error } = await gate.supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: input.phone?.trim() || null,
      role: input.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { ok: true as const };
}

export async function adminDeleteUser(targetId: string) {
  const gate = await requireAdmin();
  if (gate.error || !gate.supabase || !gate.userId) return { error: gate.error ?? "Erreur." };

  const id = targetId.trim();
  if (!id) return { error: "Utilisateur invalide." };
  if (id === gate.userId) return { error: "Vous ne pouvez pas supprimer votre propre compte." };

  const { data: target } = await gate.supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .maybeSingle();
  if (!target) return { error: "Profil introuvable." };

  if (target.role === "admin") {
    const { count, error: cErr } = await gate.supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) return { error: cErr.message };
    if ((count ?? 0) <= 1) return { error: "Impossible : dernier administrateur." };
  }

  const { count: orderCount, error: oErr } = await gate.supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", id);
  if (oErr) return { error: oErr.message };
  if ((orderCount ?? 0) > 0) {
    return {
      error:
        "Suppression impossible : ce compte a des commandes (historique à conserver).",
    };
  }

  const { data: vendor } = await gate.supabase
    .from("vendors")
    .select("id")
    .eq("user_id", id)
    .maybeSingle();

  if (vendor?.id) {
    const { count: pCount, error: pErr } = await gate.supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", vendor.id);
    if (pErr) return { error: pErr.message };
    if ((pCount ?? 0) > 0) {
      return {
        error:
          "Suppression impossible : ce vendeur a encore des produits. Retirez-les ou bloquez-les d’abord.",
      };
    }
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY manquant : impossible de supprimer le compte Auth. Ajoutez la clé côté serveur ou supprimez l’utilisateur depuis le dashboard Supabase.",
    };
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(id);
  if (delErr) return { error: delErr.message };

  revalidatePath("/admin/users");
  return { ok: true as const };
}
