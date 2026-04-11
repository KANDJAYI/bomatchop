import { ButtonLink } from "@/components/ui/button";

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

export default function HomePage() {
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
              <span className="text-boma-blue">pas seulement votre budget</span>
              .
            </h1>
            <p className="max-w-xl text-lg text-muted leading-relaxed">
              BOMA connecte commerces, restaurants et consommateurs pour écouler
              les invendus à prix doux — une expérience premium, simple et
              rapide.
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
                <div className="grid grid-cols-2 gap-3 p-6">
                  {["45 %", "38 %", "52 %", "30 %"].map((badge) => (
                    <div
                      key={badge}
                      className="boma-tile-glow flex aspect-square flex-col justify-between rounded-2xl bg-boma-forest/10 p-4"
                    >
                      <span className="text-2xl font-bold text-boma-blue">
                        {badge}
                      </span>
                      <span className="text-xs font-medium text-muted">
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

      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-4 py-20 sm:px-6">
        <div className="boma-spectrum-bg boma-spectrum-bg--subtle rounded-[2rem]" aria-hidden />
        <h2 className="relative z-10 text-center text-3xl font-semibold tracking-tight">
          Comment ça marche
        </h2>
        <p className="relative z-10 mx-auto mt-3 max-w-lg text-center text-muted">
          Trois étapes pour transformer une invendu en repas ou en courses
          malins.
        </p>
        <ol className="relative z-10 mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="boma-panel boma-panel--glow relative rounded-3xl bg-card p-8 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-boma-blue text-lg font-bold text-white">
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden bg-boma-forest/[0.04] py-20 dark:bg-boma-forest/10">
        <div className="boma-spectrum-bg boma-spectrum-bg--subtle" aria-hidden />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-semibold tracking-tight">
            Pourquoi BOMA
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="boma-panel boma-panel--glow rounded-3xl bg-background/80 p-8 backdrop-blur-sm transition-all hover:scale-[1.02]"
              >
                <h3 className="text-lg font-semibold text-boma-forest dark:text-boma-blue">
                  {b.title}
                </h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
