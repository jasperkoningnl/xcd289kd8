import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/Prose";
import { StukView } from "@/components/StukView";
import { STUKKEN, buren, getStuk } from "@/lib/stukken";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return STUKKEN.map((stuk) => ({ slug: stuk.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const stuk = getStuk(slug);
  if (!stuk) return { title: "Niet gevonden" };

  return {
    title: stuk.titel,
    description: stuk.samenvatting,
    openGraph: {
      title: `${stuk.titel} — Emergentie`,
      description: stuk.samenvatting,
    },
  };
}

export default async function StukPagina({ params }: Props) {
  const { slug } = await params;
  const stuk = getStuk(slug);
  if (!stuk) notFound();

  const nav = buren(slug);

  return (
    <article className="wrap">
      <header className="stuk-head">
        <p className="eyebrow">{stuk.kicker}</p>
        <h1 className="stuk-titel">{stuk.titel}</h1>
        <p className="stuk-samenvatting">{stuk.samenvatting}</p>
        <p className="stuk-herkomst">{stuk.herkomst}</p>
      </header>

      <div className="stuk-body">
        <div>
          <StukView slug={stuk.slug} titel={stuk.titel} aspect={stuk.aspect} />

          <div className="blok">
            <h2 className="blok-kop">Wat hier gebeurt</h2>
            <Prose alineas={stuk.alineas} />
          </div>
        </div>

        <aside className="stuk-zijkolom">
          <div className="regelkaart">
            <h2 className="regelkaart-kop">De hele regel</h2>
            <ol className="regellijst">
              {stuk.regel.map((regel, i) => (
                <li key={i}>{regel}</li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="regelkaart-kop">Probeer eens</h2>
            <div className="probeer">
              {stuk.probeer.map((item) => (
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
        <nav className="stuk-nav" aria-label="Andere stukken">
          <Link href={`/stuk/${nav.vorige.slug}`}>
            <span className="stuk-nav-label">Vorige</span>
            <span className="stuk-nav-titel">{nav.vorige.titel}</span>
          </Link>
          <Link href={`/stuk/${nav.volgende.slug}`}>
            <span className="stuk-nav-label">Volgende</span>
            <span className="stuk-nav-titel">{nav.volgende.titel}</span>
          </Link>
        </nav>
      ) : null}
    </article>
  );
}
