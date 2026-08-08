import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Glyph } from "@/components/Glyph";
import { HeroCanvas } from "@/components/HeroCanvas";
import { LOCALES, dict, homePath, isLocale, stukPath } from "@/lib/i18n";
import { alternates } from "@/lib/paths";
import { STUKKEN } from "@/lib/stukken";

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

        <div className="kaarten">
          {STUKKEN.map((stuk, i) => {
            const tekst = stuk.tekst[lang];
            return (
              <Link
                key={stuk.id}
                href={stukPath(lang, stuk.slug[lang])}
                className="kaart"
              >
                <div className="kaart-top">
                  <span className="kaart-nr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Glyph slug={stuk.id} />
                </div>
                <h2 className="kaart-titel">{tekst.titel}</h2>
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
