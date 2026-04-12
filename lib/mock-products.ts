import type { Product } from "./types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    vendorId: "mock-vendor-boulangerie-centre",
    name: "Panier surprise boulangerie",
    description:
      "Viennoiseries et pains du jour à récupérer en fin de matinée. Contenu variable selon les invendus.",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    pricePromo: 2_900,
    priceOriginal: 6_500,
    vendorType: "supermarche",
    vendorName: "Boulangerie du Centre",
    vendorAvatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&q=80",
  },
  {
    id: "2",
    vendorId: "mock-vendor-gabon-gourmand",
    name: "Menu du midi",
    description:
      "Plat du jour + accompagnement. Préparé le matin même, à retirer entre 14h et 16h.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    pricePromo: 4_500,
    priceOriginal: 9_000,
    vendorType: "restaurant",
    vendorName: "Le Gabon Gourmand",
    vendorAvatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&q=80",
  },
  {
    id: "3",
    vendorId: "mock-vendor-marche-vert",
    name: "Plateau fruits & légumes",
    description:
      "Sélection de fruits et légumes encore parfaits pour consommation immédiate ou jus.",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
    pricePromo: 3_200,
    priceOriginal: 7_000,
    vendorType: "supermarche",
    vendorName: "Marché Vert",
    vendorAvatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&q=80",
  },
  {
    id: "4",
    vendorId: "mock-vendor-sushi-libreville",
    name: "Box sushi du soir",
    description:
      "Assortiment 12 pièces. Dernière fournée avant fermeture — à consommer rapidement.",
    image:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80",
    pricePromo: 8_900,
    priceOriginal: 15_000,
    vendorType: "restaurant",
    vendorName: "Sushi Libreville",
    vendorAvatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&q=80",
  },
  {
    id: "5",
    vendorId: "mock-vendor-hyper-u",
    name: "Plateaux fromages & charcuterie",
    description:
      "Invendus du rayon traiteur, emballés sous vide. Date courte.",
    image:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80",
    pricePromo: 5_500,
    priceOriginal: 12_000,
    vendorType: "supermarche",
    vendorName: "Hyper U",
    vendorAvatarUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=128&h=128&fit=crop&q=80",
  },
  {
    id: "6",
    vendorId: "mock-vendor-pizza-nova",
    name: "Pizza familiale",
    description:
      "Grande pizza du jour non vendue en soirée. À réchauffer au four.",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
    pricePromo: 6_000,
    priceOriginal: 11_500,
    vendorType: "restaurant",
    vendorName: "Pizza Nova",
    vendorAvatarUrl:
      "https://images.unsplash.com/photo-1504257432389-52ee517ed3a6?w=128&h=128&fit=crop&q=80",
  },
];

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

export function formatXAF(value: number): string {
  return new Intl.NumberFormat("fr-GA", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(value);
}
