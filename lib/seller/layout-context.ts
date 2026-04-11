import type { SupabaseClient } from "@supabase/supabase-js";
import { isUndefinedColumnError } from "@/lib/supabase/pg-errors";
import type { BusinessType } from "@/lib/types";

export type SellerLayoutVendor = {
  id: string;
  business_name: string;
  business_type: BusinessType;
  status: string;
  profile_photo_url?: string | null;
};

export async function fetchSellerVendorForLayout(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  vendor: SellerLayoutVendor | null;
  profilePhotoColumnMissing: boolean;
}> {
  let { data: vendor, error: vendorErr } = await supabase
    .from("vendors")
    .select("id, business_name, business_type, status, profile_photo_url")
    .eq("user_id", userId)
    .maybeSingle();

  let profilePhotoColumnMissing = false;
  if (vendorErr && isUndefinedColumnError(vendorErr.message, "profile_photo_url")) {
    profilePhotoColumnMissing = true;
    ({ data: vendor, error: vendorErr } = await supabase
      .from("vendors")
      .select("id, business_name, business_type, status")
      .eq("user_id", userId)
      .maybeSingle());
  }

  if (vendorErr || !vendor) {
    return { vendor: null, profilePhotoColumnMissing };
  }

  return {
    vendor: vendor as SellerLayoutVendor,
    profilePhotoColumnMissing,
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
