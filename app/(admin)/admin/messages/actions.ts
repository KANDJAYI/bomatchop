"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const statuses = ["new", "open", "answered", "closed"] as const;
export type ContactMessageStatus = (typeof statuses)[number];

function isStatus(v: unknown): v is ContactMessageStatus {
  return typeof v === "string" && (statuses as readonly string[]).includes(v);
}

export async function adminUpdateContactMessage(input: {
  id: string;
  status: ContactMessageStatus;
  adminReply: string;
}) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase non configuré." };

  if (!input.id) return { error: "Message introuvable." };
  if (!isStatus(input.status)) return { error: "Statut invalide." };

  const reply = input.adminReply.trim();
  const payload: Record<string, unknown> = {
    status: input.status,
    admin_reply: reply.length ? reply : null,
    replied_at: reply.length ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("contact_messages")
    .update(payload)
    .eq("id", input.id);

  if (error) return { error: error.message };
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${input.id}`);
  return { ok: true as const };
}

