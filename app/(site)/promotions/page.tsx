import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Promotions",
  description:
    "Promotions et offres spéciales BOMA TCHOP — anti-gaspillage alimentaire au meilleur prix.",
};

export default function PromotionsPage() {
  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Promotions
      </h1>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
        Les promotions et réductions fortes sont regroupées sur le marché : filtres
        par type de commerce et par budget pour trouver vite les meilleures offres.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/marketplace">Voir les offres</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Retour à l’accueil
        </ButtonLink>
      </div>
    </div>
  );
}
