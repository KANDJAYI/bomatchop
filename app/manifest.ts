import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/** Icône unique (512) — le navigateur redimensionne pour 192 / splash. */
const ICON = "/logobomatchop-removebg-preview.png";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();

  return {
    id: `${base}/`,
    name: "BOMA TCHOP — Anti-gaspillage alimentaire",
    short_name: "BOMA TCHOP",
    description:
      "Plateforme anti-gaspillage au Gabon : plats, courses et invendus à prix réduit près de chez vous.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#007bff",
    categories: ["shopping", "food"],
    lang: "fr",
    dir: "ltr",
    icons: [
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: ICON,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
