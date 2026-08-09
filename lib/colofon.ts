/**
 * De inhoud van de colofonpagina. Losse tekst met *cursief* erin, die door
 * `inline()` wordt opgemaakt — zo blijft het data en geen JSX.
 */

import type { Locale } from "./i18n";

export type ColofonInhoud = {
  kop: string;
  alineas: string[];
  bronnenKop: string;
  bronnen: { term: string; tekst: string }[];
  techniekKop: string;
  techniek: { term: string; tekst: string }[];
};

export const COLOFON: Record<Locale, ColofonInhoud> = {
  nl: {
    kop: "Over deze site",
    alineas: [
      "Emergentie is een kleine, op zichzelf staande site: zes klassieke modellen uit de complexiteitswetenschap, elk met de volledige regel ernaast en genoeg knoppen om het gedrag te laten kantelen. Er is geen server bij betrokken. Alles wat u ziet wordt op het moment zelf in uw eigen browser uitgerekend, met de gewone tekenfuncties van een canvas — geen shaders, geen WebGL, geen bibliotheken.",
      "Dat is een keuze en geen beperking. Deze modellen dateren uit een tijd waarin een computer minder rekenkracht had dan de telefoon in uw zak, en juist dat is het punt: de rijkdom zit niet in het rekenwerk maar in de regel. Wat er per beeld gebeurt, past in een paar dozijn regels code.",
      "De teksten proberen twee dingen tegelijk: de regel volledig opschrijven, en eerlijk zijn over wat er daarna niet meer uit af te leiden valt. Bij vrijwel elk stuk geldt dat de kortste manier om te weten wat de regel doet, is om hem uit te voeren. Dat is niet een gebrek aan inzicht dat later wordt ingehaald — bij sommige van deze systemen is bewezen dat er geen kortere weg bestaat.",
    ],
    bronnenKop: "Waar het vandaan komt",
    bronnen: [
      {
        term: "Zwerm",
        tekst:
          "Craig W. Reynolds, *Flocks, Herds and Schools: A Distributed Behavioral Model*, SIGGRAPH 1987. De drie regels zijn sindsdien onveranderd gebleven.",
      },
      {
        term: "Patroon",
        tekst:
          "Alan M. Turing, *The Chemical Basis of Morphogenesis*, 1952. De variant hier is die van P. Gray en S. K. Scott (1984), zoals populair gemaakt door Karl Sims.",
      },
      {
        term: "Regel",
        tekst:
          "Stephen Wolfram, *Statistical Mechanics of Cellular Automata*, 1983. Het bewijs dat regel 110 universeel is, is van Matthew Cook (2004).",
      },
      {
        term: "Stroming",
        tekst:
          "Ken Perlin, *An Image Synthesizer*, SIGGRAPH 1985. De ruis hier is een eenvoudiger waardenruis; het idee van deeltjes door een veld is gemeengoed in de generatieve kunst.",
      },
      {
        term: "Groei",
        tekst:
          "Aristid Lindenmayer, *Mathematical models for cellular interaction in development*, 1968. De vormen komen uit *The Algorithmic Beauty of Plants* (Prusinkiewicz en Lindenmayer, 1990).",
      },
      {
        term: "Zandhoop",
        tekst:
          "Per Bak, Chao Tang en Kurt Wiesenfeld, *Self-organized criticality*, 1987. Het abelse karakter is aangetoond door Deepak Dhar (1990).",
      },
      {
        term: "Synchronie",
        tekst:
          "Yoshiki Kuramoto, *Self-entrainment of a population of coupled non-linear oscillators*, 1975. Het overzicht van Strogatz, *From Kuramoto to Crawford* (2000), legt uit waarom de drempel er is.",
      },
      {
        term: "Ritme",
        tekst:
          "Godfried T. Toussaint, *The Euclidean Algorithm Generates Traditional Musical Rhythms*, 2005. Het onderliggende algoritme is van E. Bjorklund (1999), geschreven voor pulstiming in een deeltjesversneller.",
      },
    ],
    techniekKop: "Techniek",
    techniek: [
      {
        term: "Bouw",
        tekst: "Next.js met de App Router, TypeScript, statisch uitgeserveerd.",
      },
      {
        term: "Tekenwerk",
        tekst:
          "Canvas 2D, met de hand geschreven. Geen tekenbibliotheek, geen WebGL.",
      },
      {
        term: "Klank",
        tekst:
          "Web Audio API, ook zonder bibliotheek. Elke toon wordt ter plekke gemaakt uit een oscillator; er zijn geen opnames. Het beeld loopt op de framelus, de muziek op de audioklok — anders hoor je het schommelen.",
      },
      {
        term: "Delen",
        tekst:
          "Elke stand van de knoppen staat in de adresbalk. Wie een mooie instelling vindt, kan de link doorsturen en de ander ziet precies hetzelfde.",
      },
      {
        term: "Talen",
        tekst:
          "Nederlands en Engels, elk met een eigen adres: /nl/stuk/zwerm naast /en/piece/flock.",
      },
      {
        term: "Letters",
        tekst:
          "Fraunces voor de koppen, Inter voor de tekst, JetBrains Mono voor cijfers.",
      },
      {
        term: "Gegevens",
        tekst:
          "Geen. Er staan geen cookies, er is geen statistiek en er gaat niets naar buiten.",
      },
      {
        term: "Toegankelijkheid",
        tekst:
          "Wie in het besturingssysteem minder beweging heeft ingesteld, krijgt de achtergrond stil te zien. Elke simulatie is met de knop *Pauze* stil te zetten. Geluid begint nooit vanzelf: dat gaat pas aan als u erom vraagt, en elk klankstuk werkt ook zonder.",
      },
    ],
  },
  en: {
    kop: "About this site",
    alineas: [
      "Emergence is a small, self-contained site: six classic models from complexity science, each with the whole rule printed beside it and enough dials to make the behaviour tip over. No server is involved. Everything you see is computed on the spot in your own browser, using the ordinary drawing functions of a canvas — no shaders, no WebGL, no libraries.",
      "That is a choice, not a limitation. These models date from a time when a computer had less compute than the phone in your pocket, and that is exactly the point: the richness is not in the arithmetic but in the rule. What happens per frame fits into a few dozen lines of code.",
      "The texts try to do two things at once: state the rule in full, and be honest about what cannot be derived from it afterwards. For nearly every piece, the shortest way to know what the rule does is to run it. This is not a gap in understanding that will later be closed — for some of these systems it has been proven that no shortcut exists.",
    ],
    bronnenKop: "Where it comes from",
    bronnen: [
      {
        term: "Flock",
        tekst:
          "Craig W. Reynolds, *Flocks, Herds and Schools: A Distributed Behavioral Model*, SIGGRAPH 1987. The three rules have remained unchanged since.",
      },
      {
        term: "Pattern",
        tekst:
          "Alan M. Turing, *The Chemical Basis of Morphogenesis*, 1952. The variant used here is that of P. Gray and S. K. Scott (1984), popularised by Karl Sims.",
      },
      {
        term: "Rule",
        tekst:
          "Stephen Wolfram, *Statistical Mechanics of Cellular Automata*, 1983. The proof that rule 110 is universal is due to Matthew Cook (2004).",
      },
      {
        term: "Flow",
        tekst:
          "Ken Perlin, *An Image Synthesizer*, SIGGRAPH 1985. The noise used here is a simpler value noise; the idea of particles travelling through a field is common property in generative art.",
      },
      {
        term: "Growth",
        tekst:
          "Aristid Lindenmayer, *Mathematical models for cellular interaction in development*, 1968. The shapes come from *The Algorithmic Beauty of Plants* (Prusinkiewicz and Lindenmayer, 1990).",
      },
      {
        term: "Sandpile",
        tekst:
          "Per Bak, Chao Tang and Kurt Wiesenfeld, *Self-organized criticality*, 1987. The abelian property was established by Deepak Dhar (1990).",
      },
      {
        term: "Synchrony",
        tekst:
          "Yoshiki Kuramoto, *Self-entrainment of a population of coupled non-linear oscillators*, 1975. Strogatz's survey *From Kuramoto to Crawford* (2000) explains where the threshold comes from.",
      },
      {
        term: "Rhythm",
        tekst:
          "Godfried T. Toussaint, *The Euclidean Algorithm Generates Traditional Musical Rhythms*, 2005. The underlying algorithm is due to E. Bjorklund (1999), written for pulse timing in a particle accelerator.",
      },
    ],
    techniekKop: "Technical notes",
    techniek: [
      {
        term: "Build",
        tekst: "Next.js with the App Router, TypeScript, served statically.",
      },
      {
        term: "Drawing",
        tekst: "Canvas 2D, written by hand. No drawing library, no WebGL.",
      },
      {
        term: "Sound",
        tekst:
          "Web Audio API, again with no library. Every tone is synthesised on the spot from an oscillator; there are no recordings. The visuals run on the frame loop, the music on the audio clock — otherwise you would hear it wobble.",
      },
      {
        term: "Sharing",
        tekst:
          "Every position of the dials lives in the address bar. Find a setting you like and the link will show someone else exactly the same thing.",
      },
      {
        term: "Languages",
        tekst:
          "Dutch and English, each with its own address: /nl/stuk/zwerm alongside /en/piece/flock.",
      },
      {
        term: "Type",
        tekst:
          "Fraunces for the headings, Inter for the text, JetBrains Mono for figures.",
      },
      {
        term: "Data",
        tekst:
          "None. There are no cookies, there is no analytics, and nothing leaves your machine.",
      },
      {
        term: "Accessibility",
        tekst:
          "Anyone who has asked their system for reduced motion gets the background standing still. Every simulation can be halted with the *Pause* button. Sound never starts on its own: it plays only once you ask for it, and every sound piece works without it.",
      },
    ],
  },
};
