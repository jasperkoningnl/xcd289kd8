import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Glyph } from "@/components/Glyph";
import { HeroCanvas } from "@/components/HeroCanvas";
import { LOCALES, dict, homePath, isLocale, stukPath, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/paths";
import { BEELD, KLANK, STUKKEN, type Stuk } from "@/lib/stukken";

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    alternates: {
      canonical: homePath(lang),
      languages: alternates(homePath(lang), LOCALES),
    },
  };
}

function Kaarten({
  stukken,
  lang,
  vanaf,
}: {
  stukken: Stuk[];
  lang: Locale;
  vanaf: number;
}) {
  return (
    <div className="kaarten">
      {stukken.map((stuk, i) => {
        const tekst = stuk.tekst[lang];
        return (
          <Link
            key={stuk.id}
            href={stukPath(lang, stuk.slug[lang])}
            className="kaart"
          >
            <div className="kaart-top">
              <span className="kaart-nr">
                {String(vanaf + i + 1).padStart(2, "0")}
              </span>
              <Glyph slug={stuk.id} />
            </div>
            <h3 className="kaart-titel">{tekst.titel}</h3>
            <p className="kaart-samenvatting">{tekst.samenvatting}</p>
            <div className="kaart-voet">
              <span>{tekst.kicker}</span>
              <span className="kaart-pijl" aria-hidden="true">
                →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function Voorpagina({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = dict(lang);

  return (
    <>
      <section className="hero">
        <HeroCanvas />
        <div className="wrap hero-inner">
          <p className="eyebrow">{t.heroEyebrow}</p>
          <h1 className="hero-title">
            {t.heroTitelVoor} <em>{t.heroTitelNadruk}</em>
          </h1>
          <p className="hero-lead">{t.heroLead1}</p>
          <p className="hero-lead">{t.heroLead2}</p>
          <div className="hero-meta">
            <span>{t.heroMeta1}</span>
            <span>{t.heroMeta2}</span>
          </div>
        </div>
      </section>

      <section className="wrap index" id="stukken">
        <div className="index-head">
          <p className="eyebrow">{t.indexKop}</p>
          <p className="index-count">{t.indexAantal(STUKKEN.length)}</p>
        </div>
        <h2 className="groep-kop">{t.groepBeeld}</h2>
        <Kaarten stukken={BEELD} lang={lang} vanaf={0} />

        <h2 className="groep-kop groep-kop-tweede">{t.groepKlank}</h2>
        <Kaarten stukken={KLANK} lang={lang} vanaf={BEELD.length} />
      </section>

      <section className="wrap wrap-narrow blok">
        <h2 className="blok-kop">{t.waaromKop}</h2>
        <div className="prose">
          {t.waaromAlineas.map((alinea, i) => (
            <p key={i}>{alinea}</p>
          ))}
        </div>
      </section>
    </>
  );
}
