/**
 * Libellés français pour les valeurs techniques (énumérations DB / API).
 */

export const ORDER_STATUS_FR: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  preparing: "En préparation",
  ready: "Prête",
  completed: "Terminée",
  cancelled: "Annulée",
  abandoned: "Abandonnée",
};

export const PRODUCT_STATUS_FR: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  blocked: "Bloqué",
};

export const VENDOR_STATUS_FR: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
  suspended: "Suspendu",
};

export const APP_ROLE_FR: Record<string, string> = {
  client: "Client",
  vendor: "Vendeur",
  admin: "Administrateur",
};

export const BUSINESS_TYPE_FR: Record<string, string> = {
  supermarket: "Supermarché",
  restaurant: "Restaurant",
};

/** Types commerce côté catalogue (marché / fiches produits). */
export const VENDOR_TYPE_FR: Record<string, string> = {
  restaurant: "Restaurant",
  supermarche: "Supermarché",
};

export function labelOrderStatus(status: string): string {
  return ORDER_STATUS_FR[status] ?? status;
}

export function labelProductStatus(status: string): string {
  return PRODUCT_STATUS_FR[status] ?? status;
}

export function labelVendorStatus(status: string): string {
  return VENDOR_STATUS_FR[status] ?? status;
}

export function labelAppRole(role: string): string {
  return APP_ROLE_FR[role] ?? role;
}

export function labelBusinessType(type: string): string {
  if (type === "boutique") return "Supermarché";
  return BUSINESS_TYPE_FR[type] ?? type;
}

export function labelVendorType(vendorType: string): string {
  if (vendorType === "boutique") return VENDOR_TYPE_FR.supermarche;
  return VENDOR_TYPE_FR[vendorType] ?? vendorType;
}

export const PAYMENT_METHOD_FR: Record<string, string> = {
  cash_on_delivery: "Paiement à la livraison",
  airtel_money: "Airtel Money",
  moov_money: "Moov Money",
};

export function labelPaymentMethod(method: string): string {
  return PAYMENT_METHOD_FR[method] ?? method;
}

export const ORDER_FULFILLMENT_FR: Record<string, string> = {
  home_delivery: "Livraison à domicile",
  pickup: "Retrait sur place au commerce",
};

export function labelOrderFulfillment(value: string): string {
  return ORDER_FULFILLMENT_FR[value] ?? value;
}
