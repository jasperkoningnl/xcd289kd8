# Emergentie / Emergence

Acht klassieke modellen uit de complexiteitswetenschap — zes om naar te
kijken, twee om naar te luisteren — elk met de volledige regel ernaast en
genoeg knoppen om het gedrag te laten kantelen. Tweetalig (Nederlands en
Engels), donker, en volledig client-side: er is geen server, geen database en
geen externe dienst bij betrokken.

| id | /nl/stuk/… | /en/piece/… | Model | Herkomst |
| --- | --- | --- | --- | --- |
| `zwerm` | zwerm | flock | Boids | Reynolds, 1986 |
| `patroon` | patroon | pattern | Gray-Scott reactie-diffusie | Turing 1952 · Gray en Scott 1984 |
| `regel` | regel | rule | Elementaire cellulaire automaten | Wolfram, 1983 |
| `stroming` | stroming | flow | Stromingsveld op ruis | Perlin, 1983 |
| `groei` | groei | growth | L-systemen | Lindenmayer, 1968 |
| `zandhoop` | zandhoop | sandpile | Abelse zandhoop | Bak, Tang en Wiesenfeld, 1987 |
| `synchronie` | synchronie | synchrony | Kuramoto-oscillatoren | Kuramoto, 1975 |
| `ritme` | ritme | rhythm | Euclidische ritmes | Bjorklund 1999 · Toussaint 2005 |

De laatste twee maken geluid. Dat begint nooit vanzelf — de bezoeker zet het
zelf aan — en het beeld werkt ook zonder.

## Draaien

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # productiebuild
npm run typecheck
```

Node 20 of nieuwer. Verder zijn er geen afhankelijkheden buiten Next, React en
TypeScript — het tekenwerk is met de hand geschreven Canvas 2D.

## Opzet

```
app/
  [lang]/                    hoofdopmaak met <html lang>, voorpagina, 404
    [section]/               /nl/colofon en /en/colophon
      [slug]/                /nl/stuk/zwerm en /en/piece/flock
  sitemap.ts                 beide talen, met onderlinge hreflang
proxy.ts                     stuurt / door naar de taal van de browser
components/
  SimStage.tsx               canvas, animatielus, knoppen — kent geen simulatie
  Controls.tsx               bediening, opgebouwd uit de schema's van elk stuk
  StukView.tsx               koppelt een id aan zijn simulatie (client)
  LanguageSwitch.tsx         springt naar dezelfde pagina in de andere taal
lib/
  sim.ts                     het raamwerk: Sim, SimSpec, Control, ruis, toeval
  audio.ts                   de geluidsbus: synthese, nagalm, toonladder
  deelbaar.ts                knopstanden lezen uit en schrijven naar de URL
  sims/*.ts                  de acht simulaties, los van React
  i18n.ts                    talen, padsegmenten, alle vaste teksten
  paths.ts                   pad omrekenen naar een andere taal
  stukken.ts                 de teksten van de stukken, per taal
  colofon.ts                 de colofontekst, per taal
```

Een simulatie implementeert `init` en `step` en levert daarnaast een `SimSpec`
met standaardwaarden en een lijstje bedieningselementen. De `SimStage` regelt de
rest: resolutie en device pixel ratio, pauzeren buiten beeld, stilstaan bij
`prefers-reduced-motion`, opnieuw zaaien, het bewaren van een PNG, de deelbare
adresbalk en — voor stukken met `audio: true` — de levensloop van de
`AudioContext`.

## Geluid

Twee klokken, en dat is het hele punt. Het tekenwerk loopt op
`requestAnimationFrame`, dat een paar milliseconden mag schommelen; voor het
oog onzichtbaar, voor het oor niet. Muzikale gebeurtenissen worden daarom niet
gespeeld op het moment dat het frame draait, maar met `LOOKAHEAD` vooruit
ingepland op `AudioContext.currentTime`. De framelus bepaalt alleen hoe ver we
vooruitkijken, niet wanneer een tik werkelijk klinkt.

Een `AudioContext` mag pas na een klik ontstaan, dus `stage.audio` is `null`
tot de bezoeker het geluid aanzet. Elke simulatie moet daarop voorbereid zijn:
het beeld is nooit afhankelijk van het geluid.

Een stuk toevoegen is dus: een bestand in `lib/sims/`, een regel in het register
in `components/StukView.tsx`, en een item in `lib/stukken.ts` met beide talen.

## Talen

Elk stuk heeft een vaste `id` die nooit verandert, en per taal een eigen slug.
De simulaties staan op `id` in het register; de URL's gebruiken de slug. Een
taal toevoegen is: `LOCALES` uitbreiden in `lib/i18n.ts`, en dan volgt de
compiler de rest — `Text` en `Record<Locale, …>` maken elke ontbrekende
vertaling een typefout.

De taalkeuze op `/` gaat via `Accept-Language`, met Nederlands als terugval.
Wie rechtstreeks op `/en/...` binnenkomt krijgt gewoon Engels; er is geen
cookie en niets wordt onthouden.

## Instellingen

`NEXT_PUBLIC_SITE_URL` overschrijft het domein in de metadata, de `hreflang`-
verwijzingen en de sitemap. Zonder die variabele wordt op Vercel het
productiedomein gebruikt en lokaal `http://localhost:3000`.

De adressen zonder taalprefix (`/stuk/…`, `/colofon`) blijven bestaan als
permanente verwijzing naar de Nederlandse versie; dat staat in
`next.config.ts`.

## Delen

Elke knopstand die van de standaard afwijkt komt in de querystring te staan
(`?koppeling=1.2&spreiding=0.6`). Wat binnenkomt wordt gecontroleerd tegen de
bediening zelf: een onbekende parameter of een waarde buiten het bereik wordt
genegeerd in plaats van doorgegeven. Een onaangeroerd stuk houdt een schoon
adres.
