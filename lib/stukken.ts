/**
 * De inhoud van de zes stukken. Puur data, zodat serveronderdelen ermee
 * kunnen werken; de simulaties zelf zitten in het clientregister
 * (`components/StukView.tsx`).
 */

export type Stuk = {
  slug: string;
  titel: string;
  /** Korte aanduiding boven de titel. */
  kicker: string;
  /** Herkomst: wie bedacht dit, en wanneer. */
  herkomst: string;
  /** Eén zin voor de kaart op de voorpagina. */
  samenvatting: string;
  /** De regel, in losse stappen. Dit is de hele opgave. */
  regel: string[];
  /** De tekst naast de simulatie. */
  alineas: string[];
  /** Concrete dingen om te proberen aan de knoppen. */
  probeer: { titel: string; tekst: string }[];
  /** Verhouding breedte : hoogte van het canvas. */
  aspect: number;
  /** Twee kleuren voor de miniatuur op de voorpagina. */
  tint: [string, string];
};

export const STUKKEN: Stuk[] = [
  {
    slug: "zwerm",
    titel: "Zwerm",
    kicker: "Beweging",
    herkomst: "Craig Reynolds, 1986",
    samenvatting:
      "Duizend vogels, drie regels, geen leider. De vorm van de zwerm staat nergens opgeschreven.",
    regel: [
      "Kijk naar de buren binnen je zichtstraal.",
      "Stuur weg van wie te dichtbij komt.",
      "Vlieg dezelfde kant op als de rest.",
      "Blijf in de buurt van het midden van je buren.",
    ],
    alineas: [
      "Een spreeuwenwolk boven een rietveld draait, splitst en sluit zich weer, en het is bijna niet te geloven dat niemand dat aanstuurt. Craig Reynolds liet in 1986 zien dat er ook niemand voor nodig is. Zijn boids — een verbastering van *bird-oids* — kennen alleen hun directe buren en volgen drie regels: niet botsen, dezelfde richting kiezen, bij elkaar blijven.",
      "Meer is het niet. Er is geen leider, geen route, geen model van de zwerm als geheel. Elke vogel beslist puur lokaal, op basis van de handvol buren die zij toevallig ziet. De wolk die daaruit ontstaat is nergens beschreven — hij is er gewoon, zodra genoeg vogels tegelijk hetzelfde doen.",
      "Wat de simulatie zichtbaar maakt, is hoe smal het bereik is waarin het mooi wordt. Draai de cohesie op en de zwerm klontert tot een trillende bal. Draai de scheiding op en hij spat uit elkaar tot los grind. Ertussen ligt een strook waarin de zwerm vloeibaar wordt: rekbaar, samenhangend, telkens anders. Dat gebied is niet ingebouwd, het is een gevolg.",
      "De aardigheid van boids is dat ze de verleiding weerstaan om het antwoord in te bouwen. Wie een zwerm wil tekenen, kan een wolk animeren. Reynolds animeerde de vogels en liet de wolk aan de wiskunde over.",
    ],
    probeer: [
      {
        titel: "Zet cohesie op nul",
        tekst:
          "De zwerm valt niet uiteen in willekeur maar in stromen: uitlijning alleen is al genoeg voor gezamenlijke richting.",
      },
      {
        titel: "Zichtstraal omlaag naar 20",
        tekst:
          "Bij een kleine straal blijven het losse groepjes. De wolk als geheel bestaat pas als de buurkringen elkaar overlappen.",
      },
      {
        titel: "Sleep over het beeld",
        tekst:
          "De zwerm wijkt uiteen en sluit zich achter de aanwijzer weer — precies zoals bij een valk. Ook dat gedrag staat nergens.",
      },
    ],
    aspect: 16 / 9,
    tint: ["#e9a23b", "#2b3242"],
  },
  {
    slug: "patroon",
    titel: "Patroon",
    kicker: "Chemie",
    herkomst: "Alan Turing, 1952 · Gray en Scott, 1984",
    samenvatting:
      "Twee stoffen die elkaar opeten en wegdrijven. Uit een egale vloeistof komen vlekken, strepen en kronkels.",
    regel: [
      "Stof A wordt aangevuld, stof B wordt afgevoerd.",
      "Waar B is, eet B stof A op en maakt daarbij meer B.",
      "Beide stoffen verspreiden zich, B trager dan A.",
    ],
    alineas: [
      "In 1952 publiceerde Alan Turing *The chemical basis of morphogenesis*, een van de weinige artikelen waarin een wiskundige uitlegt hoe een luipaard aan zijn vlekken komt. Zijn stelling: je hebt geen bouwtekening nodig. Twee stoffen die op elkaar reageren en verschillend snel door weefsel trekken, produceren vanzelf een patroon — mits de remmer sneller reist dan de aanjager.",
      "Dat is contra-intuïtief. Diffusie is juist het proces dat verschillen gladstrijkt: een druppel inkt in water verdwijnt, hij verschijnt niet. Turing liet zien dat diffusie in combinatie met de juiste reactie het omgekeerde doet, en dat een volmaakt egale vloeistof daardoor instabiel kan zijn. Elke minieme oneffenheid groeit uit tot structuur.",
      "Hierboven draait de variant van Gray en Scott, met twee draaiknoppen: hoeveel A erbij komt en hoeveel B verdwijnt. Twee getallen, en daarmee ligt de hele wereld vast. Een klein stukje van dat vlak geeft stippen, een stukje ernaast strepen, en op de grens tussen twee gebieden krijg je patronen die nooit tot rust komen: kronkels die blijven splitsen en oplossen.",
      "Turing schreef het artikel twee jaar voor zijn dood. Dat biologen zijn patronen daadwerkelijk in vissenhuid en vachten zouden terugvinden, heeft hij niet meegemaakt.",
    ],
    probeer: [
      {
        titel: "Mitose",
        tekst:
          "Blobs die groeien tot ze te groot worden en dan splitsen. Het lijkt op celdeling, maar er zit geen cel in — alleen twee getallen.",
      },
      {
        titel: "Schuif de afvoer k met 0,001 op",
        tekst:
          "Bij sommige waarden verandert er nauwelijks iets; op andere plekken kantelt het beeld van stippen naar strepen. Het vlak zit vol randen.",
      },
      {
        titel: "Teken met de muis",
        tekst:
          "Je voegt stof B toe. Wat er groeit hangt niet af van je streek maar van de instelling: het systeem trekt zich weinig aan van je bedoeling.",
      },
    ],
    aspect: 16 / 10,
    tint: ["#7fb0a2", "#1c2630"],
  },
  {
    slug: "regel",
    titel: "Regel",
    kicker: "Rekenen",
    herkomst: "Stephen Wolfram, 1983",
    samenvatting:
      "Een rij cellen, acht mogelijke buurstanden, één byte aan regels. Genoeg voor iets wat niet van willekeur te onderscheiden is.",
    regel: [
      "Elke cel kijkt naar zichzelf en haar linker- en rechterbuur.",
      "Die drie cellen geven acht mogelijke combinaties.",
      "Voor elke combinatie ligt vast of de cel aan of uit gaat.",
      "Die acht antwoorden vormen samen één getal: de regel.",
    ],
    alineas: [
      "Dit is zo ongeveer het eenvoudigste rekenapparaat dat je kunt bedenken. Een rij hokjes, elk aan of uit. Elke stap kijkt elk hokje naar zichzelf en zijn twee buren, zoekt die stand op in een tabel van acht regels, en neemt de uitkomst over. De tabel is acht bits groot, dus er bestaan precies 256 verschillende automaten. Ze zijn allemaal onderzocht.",
      "De meeste zijn saai. Ze sterven uit, ze vullen het scherm, of ze maken keurige driehoeken die zich eindeloos herhalen. Maar regel 30 begint met één zwarte cel en produceert daarna een beeld dat aan de linkerkant regelmatig blijft en aan de rechterkant chaotisch wordt — zo chaotisch dat de middelste kolom decennialang als toevalsgenerator is gebruikt, onder meer in Mathematica.",
      "Regel 110 doet iets vreemders. Tussen de strepen door schuiven kleine stabiele structuurtjes die elkaar inhalen, botsen en veranderen. In 2004 bewees Matthew Cook dat je met die botsingen kunt rekenen: regel 110 is universeel, net zo krachtig als welke computer dan ook. Eén rij hokjes, acht regels, en er past een volledige programmeertaal in.",
      "Dat is het ongemakkelijke aan deze bladzijde. Bij de zwerm en het patroon kun je nog uitleggen waaróm het eruitziet zoals het eruitziet. Hier is de kortste beschrijving van wat regel 30 doet: regel 30 uitvoeren. Er is geen formule die vooruitloopt op de uitkomst.",
    ],
    probeer: [
      {
        titel: "Regel 30",
        tekst:
          "Begint met één cel. Links ontstaat regelmaat, rechts niet. Dezelfde regel, hetzelfde begin — en toch twee werelden in één beeld.",
      },
      {
        titel: "Regel 110",
        tekst:
          "Zoek de schuine strepen die door het achtergrondpatroon lopen. Waar twee elkaar kruisen, wordt gerekend.",
      },
      {
        titel: "Regel 90",
        tekst:
          "De driehoek van Sierpiński, uit een rij hokjes. Dezelfde figuur als bij de L-systemen, langs een heel andere weg.",
      },
    ],
    aspect: 3 / 2,
    tint: ["#e9a23b", "#141821"],
  },
  {
    slug: "stroming",
    titel: "Stroming",
    kicker: "Tekening",
    herkomst: "Perlin, 1983 · gemeengoed in generatieve kunst",
    samenvatting:
      "Duizenden deeltjes volgen een onzichtbaar veld van hoeken. Niemand bepaalt de compositie.",
    regel: [
      "Over het vlak ligt een veld: elk punt heeft een hoek.",
      "Elk deeltje kijkt welke hoek hier geldt.",
      "Het zet een stap die kant op en tekent het spoor.",
      "Meer niet — herhaal een paar miljoen keer.",
    ],
    alineas: [
      "Een stromingsveld is de goedkoopste manier om een tekening te maken die eruitziet alsof iemand hem gemaakt heeft. Onder het beeld ligt een veld van hoeken, meestal afgeleid uit ruis: een functie die voor elk punt in het vlak een waarde teruggeeft die dicht bij die van de buurpunten ligt, maar niet voorspelbaar is. Ken Perlin bedacht die functie in 1983 voor de wolken en het marmer van *Tron*, en kreeg er later een Oscar voor.",
      "De deeltjes zijn dom. Ze weten niet waar ze vandaan komen, niet waar de andere deeltjes zijn, en al helemaal niet hoe de tekening ervoor staat. Ze lezen de hoek onder zich, zetten een stap, en laten een streepje achter. Dat de sporen samen bundels vormen — met wervels, kruisingen en gebieden waar niets gebeurt — komt niet doordat iemand die heeft ingetekend. Het komt doordat naburige deeltjes een bijna gelijke hoek lezen en dus een tijdlang naast elkaar blijven lopen.",
      "Dit is het stuk waar het minst valt uit te leggen en het meest valt te kijken. De aardigheid zit in de schaal van het veld: bij een grove schaal draaien duizenden deeltjes met dezelfde beweging mee en krijg je een enkel groot gebaar; bij een fijne schaal loopt iedereen langs elkaar heen en blijft er vilt over. Ertussen ligt het gebied waarin de tekening structuur heeft zonder herhaling.",
      "Elke tekening hier is eenmalig. Het toevalszaad bepaalt het veld, het veld bepaalt de rest; met dezelfde instellingen en een ander zaad krijg je een compositie die je nooit meer terugvindt. De knop *Bewaar PNG* legt vast wat er op dat moment staat.",
    ],
    probeer: [
      {
        titel: "Schaal op 0,0008",
        tekst:
          "Één groot gebaar over het hele vlak. Alle deeltjes lezen bijna dezelfde hoek en bewegen als een enkele stroom.",
      },
      {
        titel: "Levensduur kort, penseel dik",
        tekst:
          "Korte, dikke halen in plaats van lange lijnen. Hetzelfde veld, een heel ander handschrift.",
      },
      {
        titel: "Verloop in de tijd omhoog",
        tekst:
          "Nu draait het veld zelf ook. De tekening wordt een opname van een stroom die verandert terwijl hij getekend wordt.",
      },
    ],
    aspect: 3 / 2,
    tint: ["#c8cdd4", "#171a20"],
  },
  {
    slug: "groei",
    titel: "Groei",
    kicker: "Taal",
    herkomst: "Aristid Lindenmayer, 1968",
    samenvatting:
      "Vervang elk teken door een langere reeks, en lees het resultaat als een plant.",
    regel: [
      "Begin met een korte tekenreeks: het axioma.",
      "Vervang elk teken tegelijk volgens een vaste tabel.",
      "Herhaal dat een paar keer.",
      "Lees de uitkomst als instructies: vooruit, links, rechts, tak.",
    ],
    alineas: [
      "Aristid Lindenmayer was bioloog, geen informaticus. Hij bestudeerde draadalgen en zocht een notatie voor hoe zo'n draad zich vertakt. Wat hij in 1968 opschreef was een grammatica: een handjevol vervangingsregels die je op zichzelf blijft toepassen. Elk teken wordt in één klap vervangen — alle cellen delen tegelijk, precies zoals in weefsel.",
      "Het aardige zit in de omvang. De varen hierboven staat volledig vast in twee regels: X wordt `F+[[X]-X]-F[-FX]+X` en F wordt `FF`. Zes generaties later is dat een reeks van tienduizenden tekens, en getekend is het een blad met blaadjes met blaadjes. De beschrijving is korter dan de tekening met ruime marge, en dat is precies wat een zaadje ook doet.",
      "Vertakking is de hele truc, en die zit in de haakjes. Een `[` onthoudt waar de schildpad staat en welke kant zij op kijkt; een `]` zet haar daar terug. Zonder haakjes krijg je krommen — de sneeuwvlok, de drakenkromme — met haakjes krijg je planten. Dat is het verschil tussen een lijn en een organisme, uitgedrukt in twee leestekens.",
      "Zet de willekeur op nul en hetzelfde systeem geeft altijd exact dezelfde plant. Dat is het onbevredigende aan een wiskundige varen, en de reden dat de knop ernaast staat: een beetje ruis op elke hoek, en er komen twee varens uit die duidelijk familie zijn en toch niet hetzelfde.",
    ],
    probeer: [
      {
        titel: "Draaihoek langzaam verdraaien",
        tekst:
          "Dezelfde regels, alleen een andere hoek: van rechtopstaand naar hangend naar iets wat op zeewier lijkt.",
      },
      {
        titel: "Willekeur op ± 8°",
        tekst:
          "De regelmaat verdwijnt en de plant wordt aannemelijk. Precisie was blijkbaar het probleem.",
      },
      {
        titel: "Drakenkromme, twaalf generaties",
        tekst:
          "Twee regels van drie tekens. De kromme raakt zichzelf nergens, hoe vaak je ook doorgaat.",
      },
    ],
    aspect: 4 / 3,
    tint: ["#e9a23b", "#12161c"],
  },
  {
    slug: "zandhoop",
    titel: "Zandhoop",
    kicker: "Instorting",
    herkomst: "Bak, Tang en Wiesenfeld, 1987",
    samenvatting:
      "Korrel voor korrel, en af en toe stort het in. De hoop houdt zichzelf precies op de rand.",
    regel: [
      "Op elk vakje ligt een stapeltje korrels.",
      "Liggen er vier of meer, dan stort het vakje in.",
      "Bij instorting gaat er één korrel naar elk van de vier buren.",
      "Buren kunnen daardoor zelf instorten. Herhaal tot alles stil is.",
    ],
    alineas: [
      "Per Bak wilde weten waarom natuurverschijnselen zo vaak dezelfde statistiek volgen: veel kleine gebeurtenissen, af en toe een grote, en geen typische maat ertussen. Aardbevingen, bosbranden, uitstervingsgolven. Zijn antwoord uit 1987 heet zelfgeorganiseerde kritikaliteit, en het model erbij is een zandhoop.",
      "Laat korrels op één punt vallen. In het begin gebeurt er niets bijzonders. Zodra de hoop een zekere steilte bereikt, veroorzaakt de volgende korrel een lawine — meestal een van drie vakjes, soms een die over het hele veld loopt. Er is geen instelling die dat regelt. De hoop stelt zichzelf in op de toestand waarin lawines van alle formaten voorkomen, en blijft daar hangen.",
      "Dat 'abels' in de naam is een wiskundige belofte: het maakt niet uit in welke volgorde je de instortingen afhandelt. Begin linksboven of rechtsonder, handel ze om en om af — de eindstand is identiek. Dat is opmerkelijk, want de weg ernaartoe verschilt volledig.",
      "Wat er bij één bron ontstaat is bovendien geen hoop maar een figuur: een vierkant met driehoeken erin, zelfgelijkvormig, tot op vandaag niet volledig verklaard. Er bestaat een bewijs dat het patroon naar een vaste limietvorm toe groeit, maar de driehoekjes zelf ontsnappen nog altijd aan een gesloten beschrijving. Het is een fractaal die niemand heeft ontworpen en die uit vier woorden regelgeving volgt.",
    ],
    probeer: [
      {
        titel: "Laat lang doorlopen",
        tekst:
          "Het patroon groeit zelfgelijkvormig: elke verdubbeling van het aantal korrels geeft dezelfde figuur, groter.",
      },
      {
        titel: "Zet de bron op regen",
        tekst:
          "Geen figuur maar ruis — en toch precies dezelfde lawinestatistiek. Dit is de kritieke toestand waar Bak het over had.",
      },
      {
        titel: "Klik ergens in het patroon",
        tekst:
          "Een schep zand op de verkeerde plek. Kijk hoe ver de lawine loopt voordat alles weer stil ligt.",
      },
    ],
    aspect: 1,
    tint: ["#e9a23b", "#1a1c22"],
  },
];

export const STUK_MAP: Record<string, Stuk> = Object.fromEntries(
  STUKKEN.map((s) => [s.slug, s]),
);

export function getStuk(slug: string): Stuk | undefined {
  return STUK_MAP[slug];
}

export function buren(slug: string): { vorige: Stuk; volgende: Stuk } | null {
  const index = STUKKEN.findIndex((s) => s.slug === slug);
  if (index === -1) return null;
  return {
    vorige: STUKKEN[(index - 1 + STUKKEN.length) % STUKKEN.length],
    volgende: STUKKEN[(index + 1) % STUKKEN.length],
  };
}
