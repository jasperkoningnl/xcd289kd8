import Link from "next/link";
import { Glyph } from "@/components/Glyph";
import { HeroCanvas } from "@/components/HeroCanvas";
import { STUKKEN } from "@/lib/stukken";

export default function Voorpagina() {
  return (
    <>
      <section className="hero">
        <HeroCanvas />
        <div className="wrap hero-inner">
          <p className="eyebrow">Zes simulaties in de browser</p>
          <h1 className="hero-title">
            Eenvoudige regels, <em>complex gedrag</em>
          </h1>
          <p className="hero-lead">
            Een zwerm heeft geen leider. Een luipaard heeft geen bouwtekening
            voor zijn vlekken. Een zandhoop weet niet wanneer hij instort. Toch
            gebeurt het allemaal, en telkens om dezelfde reden: een handvol
            regels die op zichzelf niets voorstellen, maar die tegelijk en heel
            vaak worden toegepast.
          </p>
          <p className="hero-lead">
            Op deze zes bladzijden staat telkens de hele regel opgeschreven —
            vier zinnen, hooguit — met de knoppen erbij. Wat eruit komt, staat
            nergens.
          </p>
          <div className="hero-meta">
            <span>Alles rekent in uw eigen browser</span>
            <span>Geen gegevens, geen trackers</span>
          </div>
        </div>
      </section>

      <section className="wrap index" id="stukken">
        <div className="index-head">
          <p className="eyebrow">De stukken</p>
          <p className="index-count">{STUKKEN.length} stuks</p>
        </div>

        <div className="kaarten">
          {STUKKEN.map((stuk, i) => (
            <Link key={stuk.slug} href={`/stuk/${stuk.slug}`} className="kaart">
              <div className="kaart-top">
                <span className="kaart-nr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Glyph slug={stuk.slug} />
              </div>
              <h2 className="kaart-titel">{stuk.titel}</h2>
              <p className="kaart-samenvatting">{stuk.samenvatting}</p>
              <div className="kaart-voet">
                <span>{stuk.kicker}</span>
                <span className="kaart-pijl" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap wrap-narrow blok">
        <h2 className="blok-kop">Waarom dit de moeite waard is</h2>
        <div className="prose">
          <p>
            Emergentie is het woord voor wat er gebeurt als het geheel iets doet
            wat in geen van de delen te vinden is. Het is geen mystiek begrip:
            de zwerm hierboven is volledig bepaald door de vier zinnen die
            ernaast staan, en er zit niets in verstopt. En toch is er geen
            manier om uit die vier zinnen af te lezen hoe de wolk zal draaien.
          </p>
          <p>
            Dat is de kern van het ongemak. We zijn gewend te denken dat begrip
            betekent: het kunnen voorspellen. Bij deze systemen valt dat uit
            elkaar. Je kunt de regel volledig kennen, hem zelf hebben
            opgeschreven, en nog steeds alleen maar te weten komen wat hij doet
            door hem uit te voeren en te kijken.
          </p>
          <p>
            Vandaar de knoppen. Elk stuk is zo gemaakt dat je aan één parameter
            kunt draaien en het gedrag ziet kantelen — meestal ergens waar je
            het niet verwacht, en zelden geleidelijk.
          </p>
        </div>
      </section>
    </>
  );
}
