import Link from "next/link";
import type { ReactNode } from "react";

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-card/60 text-muted shadow-sm backdrop-blur-[6px] transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-white/10 dark:bg-card/35 dark:hover:border-white/20"
    >
      {children}
    </Link>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      {children}
    </Link>
  );
}

function FooterSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/85 dark:text-white/85">
      {children}
    </p>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M13.5 21v-7.2h2.42l.36-2.81H13.5V9.2c0-.82.23-1.38 1.4-1.38h1.5V5.3c-.26-.03-1.15-.1-2.18-.1-2.16 0-3.64 1.32-3.64 3.74V11H8.3v2.81h2.28V21h2.92Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M7.75 2.5h8.5A5.25 5.25 0 0 1 21.5 7.75v8.5A5.25 5.25 0 0 1 16.25 21.5h-8.5A5.25 5.25 0 0 1 2.5 16.25v-8.5A5.25 5.25 0 0 1 7.75 2.5Zm0 1.75A3.5 3.5 0 0 0 4.25 7.75v8.5a3.5 3.5 0 0 0 3.5 3.5h8.5a3.5 3.5 0 0 0 3.5-3.5v-8.5a3.5 3.5 0 0 0-3.5-3.5h-8.5Z" />
      <path d="M12 7.25A4.75 4.75 0 1 1 7.25 12 4.76 4.76 0 0 1 12 7.25Zm0 1.75A3 3 0 1 0 15 12a3 3 0 0 0-3-3Z" />
      <path d="M17.2 6.7a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M15.8 2h2.03c.2 2.02 1.44 3.8 3.17 4.76v2.03c-1.33 0-2.6-.4-3.67-1.1v7.15c0 3.7-3 6.7-6.7 6.7a6.7 6.7 0 0 1-6.7-6.7c0-3.7 3-6.7 6.7-6.7.44 0 .86.04 1.28.12v2.32c-.4-.14-.83-.22-1.28-.22a4.28 4.28 0 1 0 4.28 4.28V2Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-boma-forest/5 pb-24 pt-14 dark:bg-boma-forest/10">
      <div className="boma-spectrum-bg boma-spectrum-bg--subtle" aria-hidden />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="boma-panel boma-panel--glow rounded-3xl bg-card/80 p-6 shadow-sm ring-1 ring-foreground/[0.05] backdrop-blur-[8px] dark:bg-card/55 dark:ring-white/[0.06]">
              <p className="text-sm font-semibold text-boma-forest dark:text-white">
                BOMA TCHOP
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted leading-relaxed">
                Plateforme anti-gaspillage au Gabon : plats et produits à prix réduit,
                publiés par des commerces et restaurants.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/marketplace"
                  className="pressable inline-flex items-center justify-center rounded-full bg-boma-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-boma-blue/20 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  Explorer le marché
                </Link>
                <Link
                  href="/seller"
                  className="pressable inline-flex items-center justify-center rounded-full bg-foreground/[0.06] px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  Devenir vendeur
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <SocialIconLink href="https://www.facebook.com/" label="Facebook">
                  <FacebookIcon className="h-5 w-5" />
                </SocialIconLink>
                <SocialIconLink href="https://www.instagram.com/" label="Instagram">
                  <InstagramIcon className="h-5 w-5" />
                </SocialIconLink>
                <SocialIconLink href="https://www.tiktok.com/" label="TikTok">
                  <TikTokIcon className="h-5 w-5" />
                </SocialIconLink>
                <span className="ml-2 text-xs text-muted">
                  Suivez BOMA TCHOP au Gabon
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4">
                <FooterSectionTitle>Découvrir</FooterSectionTitle>
                <div className="flex flex-col gap-2.5">
                  <FooterLink href="/marketplace">Offres du moment</FooterLink>
                  <FooterLink href="/promotions">Promotions</FooterLink>
                  <FooterLink href="/cart">Panier</FooterLink>
                  <FooterLink href="/checkout">Paiement</FooterLink>
                </div>
              </div>

              <div className="space-y-4">
                <FooterSectionTitle>Compte</FooterSectionTitle>
                <div className="flex flex-col gap-2.5">
                  <FooterLink href="/auth/register">Créer un compte</FooterLink>
                  <FooterLink href="/auth/login">Se connecter</FooterLink>
                  <FooterLink href="/dashboard">Mon compte</FooterLink>
                  <FooterLink href="/seller">Espace vendeur</FooterLink>
                </div>
              </div>

              <div className="space-y-4">
                <FooterSectionTitle>Aide</FooterSectionTitle>
                <div className="flex flex-col gap-2.5">
                  <FooterLink href="/contact">Contact</FooterLink>
                  <FooterLink href="/auth/vendor">Devenir partenaire</FooterLink>
                  <Link
                    href="mailto:contact@boma.ga"
                    className="rounded-md text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    contact@boma.ga
                  </Link>
                  <p className="pt-1 text-sm text-muted">
                    Libreville, Gabon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-foreground/[0.06] py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
          <p>
            © {new Date().getFullYear()} BOMA TCHOP. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <FooterLink href="/promotions">Offres & promos</FooterLink>
            <FooterLink href="/contact">Support</FooterLink>
            <a
              href="/sitemap.xml"
              className="rounded-md text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
