export type BusinessType = "supermarket" | "restaurant";

export type VendorType = "restaurant" | "supermarche";

export type Product = {
  id: string;
  name: string;
  description: string;
  image: string;
  pricePromo: number;
  priceOriginal: number;
  /** Date de création en base (ISO) — sert à calculer la durée de publication. */
  createdAt: string;
  vendorType: VendorType;
  vendorName: string;
  /** Identifiant vendeur (DB ou mock) — pour regrouper panier / commandes. */
  vendorId: string;
  /** Portrait du vendeur (URL publique), pour reconnaître le commerce sur les annonces. */
  vendorAvatarUrl?: string | null;
  /** Adresse textuelle du commerce (vendors.location), pour carte / itinéraire au checkout. */
  vendorLocation?: string | null;
  /** Point de retrait exact (WGS84), défini par le vendeur sur son compte — prioritaire sur le géocodage de l’adresse. */
  vendorLatitude?: number | null;
  vendorLongitude?: number | null;
  /** Numéro pour le lien WhatsApp au retrait : vendors.whatsapp_phone si renseigné, sinon vendors.phone. */
  vendorPhone?: string | null;
  /** DLC (supermarché), ISO timestamptz — pour afficher la durée restante sur les offres. */
  expiresAt?: string | null;
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
  /** Statut BOMA TCHOP (pending, paid, preparing, …) */
  status: string;
};

export type ProfileRole = "client" | "vendor" | "admin";

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export type PaymentMethod = "cash_on_delivery";
