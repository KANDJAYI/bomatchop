import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez BOMA (Gabon) : support, partenariats, vendeurs. Réponse rapide via formulaire.",
};

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@boma.ga";

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Contactez BOMA
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
            Une question sur une offre, votre compte, ou un partenariat au Gabon ?
            Envoyez-nous un message : on revient vers vous rapidement.
          </p>

          <div className="boma-panel boma-panel--glow mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-foreground/[0.05] dark:ring-white/[0.06]">
            <p className="text-sm font-semibold text-foreground/90">
              Contact direct
            </p>
            <p className="mt-2 text-sm text-muted">
              Pour un échange rapide, vous pouvez aussi nous écrire par email.
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-4 inline-flex w-fit rounded-full bg-boma-blue/10 px-4 py-2 text-sm font-semibold text-boma-blue transition-colors hover:bg-boma-blue/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {contactEmail}
            </a>
            <p className="mt-4 text-xs text-muted">
              Horaires : Lun–Sam · 9h–18h (heure du Gabon)
            </p>
          </div>
          <div className="mt-8">
            <ButtonLink href="/marketplace" variant="secondary">
              Retour au marché
            </ButtonLink>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
