import type { SupabaseClient } from "@supabase/supabase-js";
import { isUndefinedColumnError } from "@/lib/supabase/pg-errors";
import type { BusinessType } from "@/lib/types";

export type SellerLayoutVendor = {
  id: string;
  business_name: string;
  business_type: BusinessType;
  status: string;
  profile_photo_url?: string | null;
  /** WhatsApp retrait (restaurants), si colonne présente en base. */
  whatsapp_phone?: string | null;
};

export async function fetchSellerVendorForLayout(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  vendor: SellerLayoutVendor | null;
  profilePhotoColumnMissing: boolean;
  whatsappColumnMissing: boolean;
}> {
  let profilePhotoColumnMissing = false;
  let whatsappColumnMissing = false;

  let { data: vendor, error: vendorErr } = await supabase
    .from("vendors")
    .select("id, business_name, business_type, status, profile_photo_url, whatsapp_phone")
    .eq("user_id", userId)
    .maybeSingle();

  if (vendorErr && isUndefinedColumnError(vendorErr.message, "profile_photo_url")) {
    profilePhotoColumnMissing = true;
    ({ data: vendor, error: vendorErr } = await supabase
      .from("vendors")
      .select("id, business_name, business_type, status, whatsapp_phone")
      .eq("user_id", userId)
      .maybeSingle());
  }

  if (vendorErr && isUndefinedColumnError(vendorErr.message, "whatsapp_phone")) {
    whatsappColumnMissing = true;
    ({ data: vendor, error: vendorErr } = await supabase
      .from("vendors")
      .select(
        profilePhotoColumnMissing
          ? "id, business_name, business_type, status"
          : "id, business_name, business_type, status, profile_photo_url",
      )
      .eq("user_id", userId)
      .maybeSingle());
  }

  if (vendorErr || !vendor) {
    return { vendor: null, profilePhotoColumnMissing, whatsappColumnMissing };
  }

  return {
    vendor: vendor as SellerLayoutVendor,
    profilePhotoColumnMissing,
    whatsappColumnMissing,
  };
}

export async function countUnreadVendorMessages(
  supabase: SupabaseClient,
  vendorId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("vendor_messages")
    .select("id", { count: "exact", head: true })
    .eq("vendor_id", vendorId)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}
