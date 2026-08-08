# Emergentie / Emergence

Zes klassieke modellen uit de complexiteitswetenschap, elk met de volledige
regel ernaast en genoeg knoppen om het gedrag te laten kantelen. Tweetalig
(Nederlands en Engels), donker, en volledig client-side: er is geen server,
geen database en geen externe dienst bij betrokken.

| id | /nl/stuk/… | /en/piece/… | Model | Herkomst |
| --- | --- | --- | --- | --- |
| `zwerm` | zwerm | flock | Boids | Reynolds, 1986 |
| `patroon` | patroon | pattern | Gray-Scott reactie-diffusie | Turing 1952 · Gray en Scott 1984 |
| `regel` | regel | rule | Elementaire cellulaire automaten | Wolfram, 1983 |
| `stroming` | stroming | flow | Stromingsveld op ruis | Perlin, 1983 |
| `groei` | groei | growth | L-systemen | Lindenmayer, 1968 |
| `zandhoop` | zandhoop | sandpile | Abelse zandhoop | Bak, Tang en Wiesenfeld, 1987 |

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
  sims/*.ts                  de zes simulaties, los van React
  i18n.ts                    talen, padsegmenten, alle vaste teksten
  paths.ts                   pad omrekenen naar een andere taal
  stukken.ts                 de teksten van de stukken, per taal
  colofon.ts                 de colofontekst, per taal
```

Een simulatie implementeert `init` en `step` en levert daarnaast een `SimSpec`
met standaardwaarden en een lijstje bedieningselementen. De `SimStage` regelt de
rest: resolutie en device pixel ratio, pauzeren buiten beeld, stilstaan bij
`prefers-reduced-motion`, opnieuw zaaien en het bewaren van een PNG.

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
