import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { getSiteOrigin } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "BOMA TCHOP — Anti-gaspillage alimentaire",
    template: "%s | BOMA TCHOP",
  },
  description:
    "Achetez des produits et plats à prix réduits au Gabon (Libreville, Owendo, Akanda…). BOMA TCHOP connecte commerces, restaurants et consommateurs pour réduire le gaspillage alimentaire.",
  applicationName: "BOMA TCHOP",
  metadataBase: getSiteOrigin(),
  appleWebApp: {
    capable: true,
    title: "BOMA TCHOP",
    statusBarStyle: "default",
  },
  keywords: [
    "anti-gaspillage",
    "anti gaspillage",
    "gaspillage alimentaire",
    "promotions",
    "réduction",
    "invendus",
    "paniers",
    "plats",
    "courses",
    "restaurant",
    "supermarché",
    "Gabon",
    "Libreville",
    "Owendo",
    "Akanda",
    "Port-Gentil",
    "Franceville",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_GA",
    siteName: "BOMA TCHOP",
    title: "BOMA TCHOP — Anti-gaspillage alimentaire au Gabon",
    description:
      "Des offres anti-gaspillage au Gabon : plats, courses et invendus à prix réduit. Trouvez des offres près de chez vous sur BOMA TCHOP.",
    url: "/",
    images: [
      {
        url: "/logobomatchop-removebg-preview.png",
        width: 512,
        height: 512,
        alt: "BOMA TCHOP",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "BOMA TCHOP — Anti-gaspillage alimentaire au Gabon",
    description:
      "Des offres anti-gaspillage au Gabon : plats, courses et invendus à prix réduit.",
    images: ["/logobomatchop-removebg-preview.png"],
  },
  other: {
    "geo.region": "GA",
    "geo.placename": "Gabon",
    // Libreville approx.
    "geo.position": "0.4162;9.4673",
    ICBM: "0.4162, 9.4673",
  },
  icons: {
    icon: [{ url: "/logobomatchop-removebg-preview.png", type: "image/png" }],
    apple: [{ url: "/logobomatchop-removebg-preview.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const origin = getSiteOrigin().toString().replace(/\/$/, "");
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BOMA TCHOP",
    url: origin,
    logo: `${origin}/logobomatchop-removebg-preview.png`,
    sameAs: [
      "https://www.facebook.com/",
      "https://www.instagram.com/",
      "https://www.tiktok.com/",
    ],
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BOMA TCHOP",
    url: origin,
    inLanguage: "fr-GA",
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/marketplace?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="boma-body-ambient flex min-h-full flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteLd),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
