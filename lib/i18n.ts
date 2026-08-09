/**
 * Tweetaligheid zonder bibliotheek.
 *
 * Elke taal heeft een eigen padprefix en eigen padsegmenten, zodat de URL's
 * in beide talen leesbaar zijn: /nl/stuk/zwerm naast /en/piece/flock. De
 * stukken houden intern één vaste `id`; alleen de slug verschilt per taal.
 */

export const LOCALES = ["nl", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "nl";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Een tekst die in beide talen bestaat. */
export type Text = Record<Locale, string>;

export const LOCALE_NAMES: Record<Locale, string> = {
  nl: "Nederlands",
  en: "English",
};

/** Wat er in de taalschakelaar staat: kort, en in de doeltaal zelf. */
export const LOCALE_SHORT: Record<Locale, string> = {
  nl: "NL",
  en: "EN",
};

/** De taalcode zoals hij in `hreflang` en `og:locale` hoort. */
export const HTML_LANG: Record<Locale, string> = {
  nl: "nl-NL",
  en: "en",
};

export const OG_LOCALE: Record<Locale, string> = {
  nl: "nl_NL",
  en: "en_US",
};

/* ------------------------------------------------------------------ *
 * Padsegmenten
 * ------------------------------------------------------------------ */

/** Het segment waaronder de stukken staan. */
export const SECTION_STUKKEN: Record<Locale, string> = {
  nl: "stuk",
  en: "piece",
};

/** Het segment van de colofonpagina. */
export const SECTION_COLOFON: Record<Locale, string> = {
  nl: "colofon",
  en: "colophon",
};

export function localeOfSection(
  section: string,
  table: Record<Locale, string>,
): Locale | null {
  for (const locale of LOCALES) {
    if (table[locale] === section) return locale;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Vaste teksten in de schil rond de inhoud
 * ------------------------------------------------------------------ */

export type Dictionary = {
  siteNaam: string;
  siteBeschrijving: string;
  siteOndertitel: string;

  navStukken: string;
  navColofon: string;
  menuLabel: string;
  naarInhoud: string;
  taalLabel: string;

  voetTekst: string;
  voetLink: string;
  voetAlles: string;

  heroEyebrow: string;
  heroTitelVoor: string;
  heroTitelNadruk: string;
  heroLead1: string;
  heroLead2: string;
  heroMeta1: string;
  heroMeta2: string;

  indexKop: string;
  indexAantal: (n: number) => string;
  groepBeeld: string;
  groepKlank: string;

  waaromKop: string;
  waaromAlineas: string[];

  deRegel: string;
  probeerEens: string;
  watHierGebeurt: string;

  vorige: string;
  volgende: string;
  andereStukken: string;

  pauze: string;
  doorgaan: string;
  geluidAan: string;
  geluidUit: string;
  klankUitleg: string;
  volume: string;
  kopieerLink: string;
  linkGekopieerd: string;
  opnieuw: string;
  anderToeval: string;
  bewaarPng: string;
  simulatieVan: (titel: string) => string;

  nietGevondenKop: string;
  nietGevondenTekst: string;
  nietGevondenLink: string;
};

const NL: Dictionary = {
  siteNaam: "Emergentie",
  siteOndertitel: "eenvoudige regels, complex gedrag",
  siteBeschrijving:
    "Zes simulaties waarin ingewikkeld gedrag voortkomt uit een paar regels van niks. Zwermen, patronen, planten en lawines — met de knoppen erbij.",

  navStukken: "Stukken",
  navColofon: "Colofon",
  menuLabel: "Hoofdmenu",
  naarInhoud: "Naar de inhoud",
  taalLabel: "Taal",

  voetTekst: "Emergentie — eenvoudige regels, complex gedrag",
  voetLink: "Colofon en bronnen",
  voetAlles: "Alles draait in de browser.",

  heroEyebrow: "Zes simulaties in de browser",
  heroTitelVoor: "Eenvoudige regels,",
  heroTitelNadruk: "complex gedrag",
  heroLead1:
    "Een zwerm heeft geen leider. Een luipaard heeft geen bouwtekening voor zijn vlekken. Een zandhoop weet niet wanneer hij instort. Toch gebeurt het allemaal, en telkens om dezelfde reden: een handvol regels die op zichzelf niets voorstellen, maar die tegelijk en heel vaak worden toegepast.",
  heroLead2:
    "Op deze zes bladzijden staat telkens de hele regel opgeschreven — vier zinnen, hooguit — met de knoppen erbij. Wat eruit komt, staat nergens.",
  heroMeta1: "Alles rekent in uw eigen browser",
  heroMeta2: "Geen gegevens, geen trackers",

  indexKop: "De stukken",
  indexAantal: (n) => `${n} stuks`,
  groepBeeld: "Beeld",
  groepKlank: "Klank",

  waaromKop: "Waarom dit de moeite waard is",
  waaromAlineas: [
    "Emergentie is het woord voor wat er gebeurt als het geheel iets doet wat in geen van de delen te vinden is. Het is geen mystiek begrip: de zwerm hierboven is volledig bepaald door de vier zinnen die ernaast staan, en er zit niets in verstopt. En toch is er geen manier om uit die vier zinnen af te lezen hoe de wolk zal draaien.",
    "Dat is de kern van het ongemak. We zijn gewend te denken dat begrip betekent: het kunnen voorspellen. Bij deze systemen valt dat uit elkaar. Je kunt de regel volledig kennen, hem zelf hebben opgeschreven, en nog steeds alleen maar te weten komen wat hij doet door hem uit te voeren en te kijken.",
    "Vandaar de knoppen. Elk stuk is zo gemaakt dat je aan één parameter kunt draaien en het gedrag ziet kantelen — meestal ergens waar je het niet verwacht, en zelden geleidelijk.",
  ],

  deRegel: "De hele regel",
  probeerEens: "Probeer eens",
  watHierGebeurt: "Wat hier gebeurt",

  vorige: "Vorige",
  volgende: "Volgende",
  andereStukken: "Andere stukken",

  pauze: "Pauze",
  doorgaan: "Doorgaan",
  geluidAan: "Geluid aan",
  geluidUit: "Geluid uit",
  klankUitleg:
    "Dit stuk is bedoeld om naar te luisteren. Het beeld werkt ook zonder.",
  volume: "Volume",
  kopieerLink: "Kopieer link",
  linkGekopieerd: "Gekopieerd",
  opnieuw: "Opnieuw",
  anderToeval: "Ander toeval",
  bewaarPng: "Bewaar PNG",
  simulatieVan: (titel) => `Simulatie: ${titel}`,

  nietGevondenKop: "Deze bladzijde bestaat niet",
  nietGevondenTekst:
    "Er is hier geen regel die dit adres oplevert. De zes stukken staan op de voorpagina.",
  nietGevondenLink: "Naar de voorpagina",
};

const EN: Dictionary = {
  siteNaam: "Emergence",
  siteOndertitel: "simple rules, complex behaviour",
  siteBeschrijving:
    "Six simulations in which intricate behaviour follows from a handful of trivial rules. Flocks, patterns, plants and avalanches — with the dials included.",

  navStukken: "Pieces",
  navColofon: "Colophon",
  menuLabel: "Main menu",
  naarInhoud: "Skip to content",
  taalLabel: "Language",

  voetTekst: "Emergence — simple rules, complex behaviour",
  voetLink: "Colophon and sources",
  voetAlles: "Everything runs in the browser.",

  heroEyebrow: "Six simulations in the browser",
  heroTitelVoor: "Simple rules,",
  heroTitelNadruk: "complex behaviour",
  heroLead1:
    "A flock has no leader. A leopard has no blueprint for its spots. A sandpile does not know when it will collapse. All of it happens anyway, and always for the same reason: a handful of rules that amount to nothing on their own, applied simultaneously and very many times.",
  heroLead2:
    "Each of these six pages states the whole rule — four sentences at most — and hands you the dials. What comes out of it is written down nowhere.",
  heroMeta1: "Everything computes in your own browser",
  heroMeta2: "No data, no trackers",

  indexKop: "The pieces",
  indexAantal: (n) => `${n} in total`,
  groepBeeld: "Sight",
  groepKlank: "Sound",

  waaromKop: "Why this is worth your time",
  waaromAlineas: [
    "Emergence is the word for what happens when the whole does something that cannot be found in any of its parts. There is nothing mystical about it: the flock on these pages is fully determined by the four sentences printed beside it, and nothing is hidden inside them. And still there is no way to read off, from those four sentences, how the cloud will turn.",
    "That is the uncomfortable part. We are used to thinking that understanding means being able to predict. With these systems that equation comes apart. You can know the rule completely, you can have written it yourself, and the only way to find out what it does is still to run it and watch.",
    "Hence the dials. Every piece is built so that you can turn a single parameter and watch the behaviour tip over — usually somewhere you did not expect, and rarely by degrees.",
  ],

  deRegel: "The whole rule",
  probeerEens: "Things to try",
  watHierGebeurt: "What is going on here",

  vorige: "Previous",
  volgende: "Next",
  andereStukken: "Other pieces",

  pauze: "Pause",
  doorgaan: "Resume",
  geluidAan: "Sound on",
  geluidUit: "Sound off",
  klankUitleg:
    "This piece is meant to be listened to. The visuals work without it.",
  volume: "Volume",
  kopieerLink: "Copy link",
  linkGekopieerd: "Copied",
  opnieuw: "Restart",
  anderToeval: "Reseed",
  bewaarPng: "Save PNG",
  simulatieVan: (titel) => `Simulation: ${titel}`,

  nietGevondenKop: "This page does not exist",
  nietGevondenTekst:
    "No rule here produces this address. The six pieces are listed on the front page.",
  nietGevondenLink: "To the front page",
};

export const DICTIONARIES: Record<Locale, Dictionary> = { nl: NL, en: EN };

export function dict(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/* ------------------------------------------------------------------ *
 * Padopbouw
 * ------------------------------------------------------------------ */

export function homePath(locale: Locale): string {
  return `/${locale}`;
}

export function colofonPath(locale: Locale): string {
  return `/${locale}/${SECTION_COLOFON[locale]}`;
}

export function stukPath(locale: Locale, slug: string): string {
  return `/${locale}/${SECTION_STUKKEN[locale]}/${slug}`;
}
