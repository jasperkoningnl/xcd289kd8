import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prose, inline } from "@/components/Prose";
import { COLOFON } from "@/lib/colofon";
import {
  LOCALES,
  SECTION_COLOFON,
  colofonPath,
  dict,
  isLocale,
} from "@/lib/i18n";
import { alternates } from "@/lib/paths";

type Props = { params: Promise<{ lang: string; section: string }> };

/**
 * Dit segment is alleen de colofonpagina. Het stukkensegment heeft altijd
 * een slug eronder en komt in de map hiernaast terecht.
 */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang, section: SECTION_COLOFON[lang] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, section } = await params;
  if (!isLocale(lang) || section !== SECTION_COLOFON[lang]) return {};

  const t = dict(lang);
  const path = colofonPath(lang);

  return {
    title: t.navColofon,
    description: COLOFON[lang].alineas[0].slice(0, 155),
    alternates: {
      canonical: path,
      languages: alternates(path, LOCALES),
    },
  };
}

export default async function ColofonPagina({ params }: Props) {
  const { lang, section } = await params;
  if (!isLocale(lang) || section !== SECTION_COLOFON[lang]) notFound();

  const t = dict(lang);
  const inhoud = COLOFON[lang];

  return (
    <div className="wrap wrap-narrow blok">
      <p className="eyebrow">{t.navColofon}</p>
      <h1 className="blok-kop">{inhoud.kop}</h1>
      <Prose alineas={inhoud.alineas} />

      <h2 className="blok-kop blok-kop-vervolg">{inhoud.bronnenKop}</h2>
      <dl className="definities">
        {inhoud.bronnen.map((bron) => (
          <div key={bron.term} style={{ display: "contents" }}>
            <dt>{bron.term}</dt>
            <dd>{inline(bron.tekst)}</dd>
          </div>
        ))}
      </dl>

      <h2 className="blok-kop blok-kop-vervolg">{inhoud.techniekKop}</h2>
      <dl className="definities">
        {inhoud.techniek.map((item) => (
          <div key={item.term} style={{ display: "contents" }}>
            <dt>{item.term}</dt>
            <dd>{inline(item.tekst)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
