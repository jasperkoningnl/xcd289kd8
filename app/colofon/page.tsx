import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Colofon",
  description:
    "Waar deze site vandaan komt, hoe ze gebouwd is, en waar de zes modellen zijn beschreven.",
};

const alineas = [
  "Emergentie is een kleine, op zichzelf staande site: zes klassieke modellen uit de complexiteitswetenschap, elk met de volledige regel ernaast en genoeg knoppen om het gedrag te laten kantelen. Er is geen server bij betrokken. Alles wat u ziet wordt op het moment zelf in uw eigen browser uitgerekend, met de gewone tekenfuncties van een canvas — geen shaders, geen WebGL, geen bibliotheken.",
  "Dat is een keuze en geen beperking. Deze modellen dateren uit een tijd waarin een computer minder rekenkracht had dan de telefoon in uw zak, en juist dat is het punt: de rijkdom zit niet in het rekenwerk maar in de regel. Wat er per beeld gebeurt, past in een paar dozijn regels code.",
  "De teksten proberen twee dingen tegelijk: de regel volledig opschrijven, en eerlijk zijn over wat er daarna niet meer uit af te leiden valt. Bij vrijwel elk stuk geldt dat de kortste manier om te weten wat de regel doet, is om hem uit te voeren. Dat is niet een gebrek aan inzicht dat later wordt ingehaald — bij sommige van deze systemen is bewezen dat er geen kortere weg bestaat.",
];

const bronnen: { term: string; tekst: React.ReactNode }[] = [
  {
    term: "Zwerm",
    tekst: (
      <>
        Craig W. Reynolds, <em>Flocks, Herds and Schools: A Distributed
        Behavioral Model</em>, SIGGRAPH 1987. De drie regels zijn sindsdien
        onveranderd gebleven.
      </>
    ),
  },
  {
    term: "Patroon",
    tekst: (
      <>
        Alan M. Turing, <em>The Chemical Basis of Morphogenesis</em>, 1952. De
        variant hier is die van P. Gray en S. K. Scott (1984), zoals populair
        gemaakt door Karl Sims.
      </>
    ),
  },
  {
    term: "Regel",
    tekst: (
      <>
        Stephen Wolfram, <em>Statistical Mechanics of Cellular Automata</em>,
        1983. Het bewijs dat regel 110 universeel is, is van Matthew Cook (2004).
      </>
    ),
  },
  {
    term: "Stroming",
    tekst: (
      <>
        Ken Perlin, <em>An Image Synthesizer</em>, SIGGRAPH 1985. De ruis hier is
        een eenvoudiger waardenruis; het idee van deeltjes door een veld is
        gemeengoed in de generatieve kunst.
      </>
    ),
  },
  {
    term: "Groei",
    tekst: (
      <>
        Aristid Lindenmayer, <em>Mathematical models for cellular interaction in
        development</em>, 1968. De vormen komen uit <em>The Algorithmic Beauty of
        Plants</em> (Prusinkiewicz en Lindenmayer, 1990).
      </>
    ),
  },
  {
    term: "Zandhoop",
    tekst: (
      <>
        Per Bak, Chao Tang en Kurt Wiesenfeld, <em>Self-organized criticality</em>,
        1987. Het abelse karakter is aangetoond door Deepak Dhar (1990).
      </>
    ),
  },
];

export default function Colofon() {
  return (
    <div className="wrap wrap-narrow blok">
      <p className="eyebrow">Colofon</p>
      <h1 className="blok-kop">Over deze site</h1>
      <Prose alineas={alineas} />

      <h2 className="blok-kop" style={{ marginTop: "3.5rem" }}>
        Waar het vandaan komt
      </h2>
      <dl className="definities">
        {bronnen.map((bron) => (
          <div key={bron.term} style={{ display: "contents" }}>
            <dt>{bron.term}</dt>
            <dd>{bron.tekst}</dd>
          </div>
        ))}
      </dl>

      <h2 className="blok-kop" style={{ marginTop: "3.5rem" }}>
        Techniek
      </h2>
      <dl className="definities">
        <dt>Bouw</dt>
        <dd>Next.js met de App Router, TypeScript, statisch uitgeserveerd.</dd>
        <dt>Tekenwerk</dt>
        <dd>
          Canvas 2D, met de hand geschreven. Geen tekenbibliotheek, geen WebGL.
        </dd>
        <dt>Letters</dt>
        <dd>Fraunces voor de koppen, Inter voor de tekst, JetBrains Mono voor cijfers.</dd>
        <dt>Gegevens</dt>
        <dd>
          Geen. Er staan geen cookies, er is geen statistiek en er gaat niets
          naar buiten.
        </dd>
        <dt>Toegankelijkheid</dt>
        <dd>
          Wie in het besturingssysteem minder beweging heeft ingesteld, krijgt de
          achtergrond stil te zien. Elke simulatie is met de knop{" "}
          <em>Pauze</em> stil te zetten.
        </dd>
      </dl>
    </div>
  );
}
