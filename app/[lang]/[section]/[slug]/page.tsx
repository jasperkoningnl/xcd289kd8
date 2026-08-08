import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/Prose";
import { StukView } from "@/components/StukView";
import {
  LOCALES,
  SECTION_STUKKEN,
  dict,
  isLocale,
  stukPath,
} from "@/lib/i18n";
import { alternates } from "@/lib/paths";
import { STUKKEN, buren, getStukBySlug } from "@/lib/stukken";

type Props = { params: Promise<{ lang: string; section: string; slug: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    STUKKEN.map((stuk) => ({
      lang,
      section: SECTION_STUKKEN[lang],
      slug: stuk.slug[lang],
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, section, slug } = await params;
  if (!isLocale(lang) || section !== SECTION_STUKKEN[lang]) return {};

  const stuk = getStukBySlug(lang, slug);
  if (!stuk) return {};

  const tekst = stuk.tekst[lang];
  const path = stukPath(lang, slug);
  const t = dict(lang);

  return {
    title: tekst.titel,
    description: tekst.samenvatting,
    alternates: {
      canonical: path,
      languages: alternates(path, LOCALES),
    },
    openGraph: {
      title: `${tekst.titel} — ${t.siteNaam}`,
      description: tekst.samenvatting,
    },
  };
}

export default async function StukPagina({ params }: Props) {
  const { lang, section, slug } = await params;
  if (!isLocale(lang)) notFound();

  // Het sectiesegment hoort bij de taal: /en/stuk/... bestaat niet.
  if (section !== SECTION_STUKKEN[lang]) notFound();

  const stuk = getStukBySlug(lang, slug);
  if (!stuk) notFound();

  const t = dict(lang);
  const tekst = stuk.tekst[lang];
  const nav = buren(stuk.id);

  return (
    <article className="wrap">
      <header className="stuk-head">
        <p className="eyebrow">{tekst.kicker}</p>
        <h1 className="stuk-titel">{tekst.titel}</h1>
        <p className="stuk-samenvatting">{tekst.samenvatting}</p>
        <p className="stuk-herkomst">{tekst.herkomst}</p>
      </header>

      <div className="stuk-body">
        <div>
          <StukView
            id={stuk.id}
            titel={tekst.titel}
            aspect={stuk.aspect}
            locale={lang}
          />

          <div className="blok">
            <h2 className="blok-kop">{t.watHierGebeurt}</h2>
            <Prose alineas={tekst.alineas} />
          </div>
        </div>

        <aside className="stuk-zijkolom">
          <div className="regelkaart">
            <h2 className="regelkaart-kop">{t.deRegel}</h2>
            <ol className="regellijst">
              {tekst.regel.map((regel, i) => (
                <li key={i}>{regel}</li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="regelkaart-kop">{t.probeerEens}</h2>
            <div className="probeer">
              {tekst.probeer.map((item) => (
                <div className="probeer-item" key={item.titel}>
                  <p className="probeer-titel">{item.titel}</p>
                  <p className="probeer-tekst">{item.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {nav ? (
        <nav className="stuk-nav" aria-label={t.andereStukken}>
          <Link href={stukPath(lang, nav.vorige.slug[lang])}>
            <span className="stuk-nav-label">{t.vorige}</span>
            <span className="stuk-nav-titel">{nav.vorige.tekst[lang].titel}</span>
          </Link>
          <Link href={stukPath(lang, nav.volgende.slug[lang])}>
            <span className="stuk-nav-label">{t.volgende}</span>
            <span className="stuk-nav-titel">
              {nav.volgende.tekst[lang].titel}
            </span>
          </Link>
        </nav>
      ) : null}
    </article>
  );
}
