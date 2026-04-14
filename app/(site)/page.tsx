import Image from "next/image";
import Link from "next/link";
import {
  HomeCategoryCardsList,
  type HomeCategoryItem,
} from "@/components/home-category-cards";
import { ParallaxSectionBg } from "@/components/parallax-section-bg";
import { ProductCard } from "@/components/product-card";
import { ButtonLink } from "@/components/ui/button";
import { VENDOR_TYPE_FR } from "@/lib/labels-fr";
import { fetchMarketplaceProducts } from "@/lib/data/products";
import type { Product, VendorType } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Fonds parallaxe — sections « Comment ça marche » et « Pourquoi BOMA » (~4K, haute qualité) */
const stepsSectionParallaxImage =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=3840&h=2160&q=95";
const whyBomaSectionParallaxImage =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=3840&h=2160&q=95";

/** Voile minimal : photo très visible ; titres/sous-titre renforcés au-dessus */
const parallaxOverlayMid =
  "bg-gradient-to-b from-background/28 via-background/10 to-transparent dark:from-background/36 dark:via-background/14 dark:to-transparent";

const heroBannerTiles = [
  {
    discount: "45 %",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    imageAlt: "Pains et viennoiseries sur une planche",
  },
  {
    discount: "38 %",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    imageAlt: "Bol coloré de salade et légumes frais",
  },
  {
    discount: "52 %",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80",
    imageAlt: "Fruits et légumes variés",
  },
  {
    discount: "30 %",
    image:
      "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80",
    imageAlt: "Assortiment de sushis",
  },
] as const;

function countByVendorType(products: Product[], t: VendorType): number {
  return products.reduce((n, p) => n + (p.vendorType === t ? 1 : 0), 0);
}

function discountPctLabel(p: Product): string {
  const original = p.priceOriginal;
  if (!Number.isFinite(original) || original <= 0) return "0 %";
  const disc = 1 - p.pricePromo / original;
  const pct = Math.max(0, Math.min(100, Math.round(disc * 100)));
  return `${pct} %`;
}

const homeCategories: {
  type: VendorType;
  description: string;
  accentClass: string;
}[] = [
  {
    type: "restaurant",
    description: "Plats, menus et invendus prêts à déguster.",
    accentClass:
      "bg-gradient-to-br from-boma-spectrum-red/18 via-transparent to-boma-blue/8",
  },
  {
    type: "supermarche",
    description: "Courses et produits frais à prix réduit.",
    accentClass:
      "bg-gradient-to-br from-boma-blue/15 via-transparent to-boma-spectrum-green/12",
  },
];

function pickBestOffers(products: Product[], limit = 6): Product[] {
  return [...products]
    .map((p) => {
      const original = p.priceOriginal;
      const disc =
        original > 0
          ? Math.max(0, Math.min(1, 1 - p.pricePromo / original))
          : 0;
      return { p, disc };
    })
    .sort((a, b) => b.disc - a.disc)
    .slice(0, limit)
    .map(({ p }) => p);
}

/** Offres les plus récemment publiées (`created_at` côté base). */
function pickNewestOffers(products: Product[], limit = 4): Product[] {
  return [...products]
    .sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      const aOk = Number.isFinite(ta);
      const bOk = Number.isFinite(tb);
      if (!aOk && !bOk) return 0;
      if (!aOk) return 1;
      if (!bOk) return -1;
      return tb - ta;
    })
    .slice(0, limit);
}

const steps = [
  {
    title: "Parcourez les offres",
    text: "Restaurants et commerces publient leurs invendus à prix réduit sur la carte.",
  },
  {
    title: "Réservez en quelques clics",
    text: "Payez en ligne ou sur place selon le commerce — toujours un parcours court.",
  },
  {
    title: "Récupérez votre panier",
    text: "Retirez votre commande dans la fenêtre indiquée et savourez sans culpabiliser.",
  },
];

const benefits = [
  {
    title: "Pouvoir d’achat",
    text: "Des prix promo sur des produits encore excellents.",
  },
  {
    title: "Impact local",
    text: "Soutenez les commerces de votre quartier tout en réduisant le gaspillage.",
  },
  {
    title: "Expérience fluide",
    text: "Interface pensée mobile-first, chargements rapides et feedback clair.",
  },
];

export default async function HomePage() {
  const products = await fetchMarketplaceProducts();
  const heroOfferTiles = pickNewestOffers(products, 4);
  const bestOffers = pickBestOffers(products, 6);
  const categoryItems: HomeCategoryItem[] = homeCategories.map((c) => ({
    type: c.type,
    label: VENDOR_TYPE_FR[c.type],
    description: c.description,
    accentClass: c.accentClass,
    count: countByVendorType(products, c.type),
  }));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="boma-spectrum-bg" aria-hidden />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1 space-y-8 animate-fade-up">
            <p className="inline-flex rounded-full bg-gradient-to-r from-boma-spectrum-green/15 via-boma-spectrum-yellow/12 to-boma-spectrum-red/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-boma-forest dark:text-boma-spectrum-yellow">
              Gabon & au-delà
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Sauvez le bon goût,{" "}
              <span className="text-boma-blue">pas seulement votre budget</span>.
            </h1>
            <p className="max-w-xl text-lg text-muted leading-relaxed">
              BOMA connecte commerces, restaurants et consommateurs pour écouler les
              invendus à prix doux — une expérience premium, simple et rapide.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/marketplace" variant="primary">
                Explorer les offres
              </ButtonLink>
              <ButtonLink href="/auth/register" variant="secondary">
                Créer un compte
              </ButtonLink>
            </div>
          </div>
          <div className="flex flex-1 justify-center lg:justify-end">
            <div className="relative w-full max-w-md animate-fade-up [animation-delay:120ms]">
              <div
                className="absolute -inset-4 rounded-[2rem] blur-2xl motion-safe:animate-[boma-spectrum-drift_18s_ease-in-out_infinite_alternate]"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--boma-blue) 28%, transparent), color-mix(in srgb, var(--boma-spectrum-yellow) 22%, transparent), color-mix(in srgb, var(--boma-spectrum-red) 20%, transparent), color-mix(in srgb, var(--boma-spectrum-green) 24%, transparent))",
                }}
              />
              <div className="boma-panel boma-panel--glow relative overflow-hidden rounded-[2rem] bg-card shadow-2xl shadow-boma-blue/10">
                <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-6">
                  {heroOfferTiles.length > 0
                    ? heroOfferTiles.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      aria-label={`Voir l’offre : ${p.name}`}
                      className="group boma-tile-glow flex aspect-[10/11] flex-col overflow-hidden rounded-2xl bg-boma-forest/10 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-boma-blue/45 sm:aspect-square"
                    >
                      <div className="flex shrink-0 items-start px-2 pt-2 sm:px-3 sm:pt-3">
                        <span className="text-lg font-bold leading-none text-boma-blue sm:text-2xl">
                          {discountPctLabel(p)}
                        </span>
                      </div>
                      <div className="relative mx-1.5 my-1.5 min-h-[6.25rem] flex-1 overflow-hidden rounded-lg bg-foreground/5 sm:mx-2 sm:my-2 sm:min-h-0 sm:rounded-xl">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          className="object-contain object-center p-0.5 transition-transform duration-500 group-hover:scale-[1.02] sm:object-cover sm:p-0 sm:group-hover:scale-105"
                          sizes="(max-width: 640px) 45vw, 180px"
                        />
                      </div>
                      <span className="shrink-0 px-2 pb-2 text-[10px] font-medium leading-tight text-muted sm:px-3 sm:pb-3 sm:text-xs">
                        Offre du jour
                      </span>
                    </Link>
                    ))
                    : heroBannerTiles.map((tile) => (
                    <div
                      key={tile.discount}
                      className="group boma-tile-glow flex aspect-[10/11] flex-col overflow-hidden rounded-2xl bg-boma-forest/10 sm:aspect-square"
                    >
                      <div className="flex shrink-0 items-start px-2 pt-2 sm:px-3 sm:pt-3">
                        <span className="text-lg font-bold leading-none text-boma-blue sm:text-2xl">
                          {tile.discount}
                        </span>
                      </div>
                      <div className="relative mx-1.5 my-1.5 min-h-[6.25rem] flex-1 overflow-hidden rounded-lg bg-foreground/5 sm:mx-2 sm:my-2 sm:min-h-0 sm:rounded-xl">
                        <Image
                          src={tile.image}
                          alt={tile.imageAlt}
                          fill
                          className="object-contain object-center p-0.5 transition-transform duration-500 group-hover:scale-[1.02] sm:object-cover sm:p-0 sm:group-hover:scale-105"
                          sizes="(max-width: 640px) 45vw, 180px"
                        />
                      </div>
                      <span className="shrink-0 px-2 pb-2 text-[10px] font-medium leading-tight text-muted sm:px-3 sm:pb-3 sm:text-xs">
                        Offre du jour
                      </span>
                    </div>
                  ))}
                </div>
                <p className="px-6 py-4 text-center text-sm text-muted">
                  Des centaines de paniers sauvés chaque semaine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-foreground/5 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Catégories
            </h2>
            <p className="mt-2 text-muted leading-relaxed">
              Parcourez les offres par type de commerce — le même filtre s’applique
              automatiquement sur le marché.
            </p>
          </div>
          <HomeCategoryCardsList items={categoryItems} />
        </div>
      </section>

      <section className="border-t border-foreground/5 bg-boma-forest/[0.03] py-16 dark:bg-boma-forest/[0.08]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                Les meilleures offres
              </h2>
              <p className="mt-2 text-muted leading-relaxed">
                Une sélection des réductions les plus marquantes du moment —
                mis à jour avec les offres actives sur le marché.
              </p>
            </div>
            <ButtonLink href="/marketplace" variant="secondary" className="shrink-0 self-start sm:self-auto">
              Tout voir
            </ButtonLink>
          </div>
          {bestOffers.length === 0 ? (
            <div className="boma-panel boma-panel--glow rounded-3xl bg-card px-6 py-14 text-center shadow-sm">
              <p className="text-muted">
                Aucune offre pour l’instant. Revenez bientôt ou parcourez le
                marché pour les nouveautés.
              </p>
              <div className="mt-6 flex justify-center">
                <ButtonLink href="/marketplace">Ouvrir le marché</ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {bestOffers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ParallaxSectionBg
        imageSrc={stepsSectionParallaxImage}
        intensity={0.12}
        priority
        className="border-t border-foreground/5 py-20 sm:py-24"
        contentClassName="mx-auto max-w-6xl px-4 sm:px-6"
        overlayClassName={parallaxOverlayMid}
      >
        <h2 className="text-center text-3xl font-semibold tracking-tight [text-shadow:0_0_28px_var(--background),0_2px_12px_var(--background),0_1px_2px_rgba(0,0,0,0.12)] dark:[text-shadow:0_0_32px_rgb(0,0,0),0_2px_16px_rgb(0,0,0),0_1px_2px_rgba(0,0,0,0.5)]">
          Comment ça marche
        </h2>
        <p className="mx-auto mt-3 max-w-lg rounded-2xl bg-background/70 px-5 py-2.5 text-center text-sm text-foreground/90 shadow-sm ring-1 ring-foreground/10 backdrop-blur-[6px] dark:bg-background/55 dark:text-foreground/95">
          Trois étapes pour transformer une invendu en repas ou en courses malins.
        </p>
        <ol className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="boma-panel boma-panel--glow relative rounded-3xl bg-card p-8 shadow-md ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5"
            >
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-boma-blue text-lg font-bold text-white">
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </ParallaxSectionBg>

      <ParallaxSectionBg
        imageSrc={whyBomaSectionParallaxImage}
        intensity={0.12}
        className="border-t border-foreground/5 py-20 sm:py-24"
        contentClassName="mx-auto max-w-6xl px-4 sm:px-6"
        overlayClassName={parallaxOverlayMid}
      >
        <h2 className="text-center text-3xl font-semibold tracking-tight [text-shadow:0_0_28px_var(--background),0_2px_12px_var(--background),0_1px_2px_rgba(0,0,0,0.12)] dark:[text-shadow:0_0_32px_rgb(0,0,0),0_2px_16px_rgb(0,0,0),0_1px_2px_rgba(0,0,0,0.5)]">
          Pourquoi BOMA
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="boma-panel boma-panel--glow rounded-3xl bg-background/92 p-8 shadow-md ring-1 ring-foreground/5 backdrop-blur-sm transition-all hover:scale-[1.02] dark:bg-background/88"
            >
              <h3 className="text-lg font-semibold text-boma-forest dark:text-boma-blue">
                {b.title}
              </h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </ParallaxSectionBg>

      <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight">
          Prêt à votre premier panier sauvé ?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Rejoignez le mouvement : moins de gaspillage, plus de saveurs
          accessibles.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/marketplace">Découvrir le marché</ButtonLink>
          <ButtonLink href="/seller" variant="forest">
            Je suis commerçant
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
