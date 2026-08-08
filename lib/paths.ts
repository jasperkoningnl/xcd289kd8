/**
 * Het omrekenen van een pad naar een andere taal. Staat los van `i18n.ts`
 * omdat het de stukken nodig heeft, en los van `stukken.ts` omdat zowel de
 * server (voor `hreflang`) als de client (voor de taalschakelaar) het gebruikt.
 */

import {
  DEFAULT_LOCALE,
  SECTION_COLOFON,
  SECTION_STUKKEN,
  colofonPath,
  homePath,
  isLocale,
  stukPath,
  type Locale,
} from "./i18n";
import { getStukBySlug } from "./stukken";

/**
 * Zet een pad om naar dezelfde bladzijde in `target`. Onbekende paden vallen
 * terug op de voorpagina van de doeltaal — beter dan een dood adres.
 */
export function translatePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  const [first, ...rest] = parts;

  const from: Locale = first && isLocale(first) ? first : DEFAULT_LOCALE;
  if (!first || !isLocale(first)) return homePath(target);

  // /nl
  if (rest.length === 0) return homePath(target);

  const [section, slug] = rest;

  // /nl/colofon
  if (section === SECTION_COLOFON[from] && rest.length === 1) {
    return colofonPath(target);
  }

  // /nl/stuk/zwerm
  if (section === SECTION_STUKKEN[from] && slug) {
    const stuk = getStukBySlug(from, slug);
    if (stuk) return stukPath(target, stuk.slug[target]);
  }

  return homePath(target);
}

/** Alle taalvarianten van een pad, voor de `alternates` in de metadata. */
export function alternates(
  pathname: string,
  locales: readonly Locale[],
): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, translatePath(pathname, locale)]),
  );
}
