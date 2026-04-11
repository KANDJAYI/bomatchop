export type BusinessType = "supermarket" | "boutique" | "restaurant";

export type VendorType = "restaurant" | "supermarche" | "boutique";

export type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  pricePromo: number;
  priceOriginal: number;
  vendorType: VendorType;
  vendorName: string;
  /** Portrait du vendeur (URL publique), pour reconnaître le commerce sur les annonces. */
  vendorAvatarUrl?: string | null;
};

export type CartLine = {
  product: Product;
  quantity: number;
};

export type OrderSummary = {
  id: string;
  date: string;
  total: number;
  itemCount: number;
  /** Statut BOMA (pending, paid, preparing, …) */
  status: string;
};

export type ProfileRole = "client" | "vendor" | "admin";

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export type PaymentMethod =
  | "cash_on_delivery"
  | "airtel_money"
  | "moov_money";
