import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-boma-forest/5 py-12 dark:bg-boma-forest/10">
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
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <Link href="/marketplace" className="hover:text-boma-blue">
            Offres
          </Link>
          <Link href="/dashboard" className="hover:text-boma-blue">
            Compte
          </Link>
          <span>© {new Date().getFullYear()} BOMA</span>
        </div>
      </div>
    </footer>
  );
}
