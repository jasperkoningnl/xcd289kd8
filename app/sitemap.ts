import type { MetadataRoute } from "next";
import { LOCALES, colofonPath, homePath, stukPath } from "@/lib/i18n";
import { alternates } from "@/lib/paths";
import { STUKKEN } from "@/lib/stukken";
import { siteUrl } from "@/lib/site";

/**
 * Alle bladzijden in beide talen, met onderlinge `hreflang`-verwijzingen
 * zodat zoekmachines de twee versies aan elkaar koppelen.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl().replace(/\/$/, "");
  const absolute = (path: string) => `${base}${path}`;

  const paths = [
    ...LOCALES.map((locale) => homePath(locale)),
    ...LOCALES.map((locale) => colofonPath(locale)),
    ...LOCALES.flatMap((locale) =>
      STUKKEN.map((stuk) => stukPath(locale, stuk.slug[locale])),
    ),
  ];

  return paths.map((path) => ({
    url: absolute(path),
    changeFrequency: "yearly",
    priority: path.split("/").length <= 2 ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        Object.entries(alternates(path, LOCALES)).map(([locale, target]) => [
          locale,
          absolute(target),
        ]),
      ),
    },
  }));
}
