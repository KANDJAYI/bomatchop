import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter l’équipe BOMA.",
};

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@boma.ga";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Contact
      </h1>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
        Une question sur le service, un partenariat ou le support vendeur ? Écrivez-nous,
        nous vous répondrons dans les meilleurs délais.
      </p>
      <div className="boma-panel boma-panel--glow mt-10 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-foreground/[0.05] dark:ring-white/[0.06] sm:p-8">
        <p className="text-sm font-medium text-foreground/90">E-mail</p>
        <a
          href={`mailto:${contactEmail}`}
          className="mt-1 inline-block rounded-sm text-boma-blue transition-colors hover:text-boma-blue/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {contactEmail}
        </a>
      </div>
      <div className="mt-10">
        <ButtonLink href="/marketplace" variant="secondary">
          Retour au marché
        </ButtonLink>
      </div>
    </div>
  );
}
