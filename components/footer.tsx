import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-boma-forest/5 py-12 pb-24 md:py-12 dark:bg-boma-forest/10">
      <div className="boma-spectrum-bg boma-spectrum-bg--subtle" aria-hidden />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-boma-forest dark:text-white">
            BOMA
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Moins de gaspillage, plus d’accès à une alimentation de qualité.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
          <Link
            href="/marketplace"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Les offres
          </Link>
          <Link
            href="/promotions"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Promotions
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Mon compte
          </Link>
          <Link
            href="/contact"
            className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boma-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Contact
          </Link>
          <span className="text-muted/90">
            © {new Date().getFullYear()} BOMA
          </span>
        </div>
      </div>
    </footer>
  );
}
