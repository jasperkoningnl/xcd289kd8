# Emergentie

Zes klassieke modellen uit de complexiteitswetenschap, elk met de volledige
regel ernaast en genoeg knoppen om het gedrag te laten kantelen. Nederlandstalig,
donker, en volledig client-side: er is geen server, geen database en geen
externe dienst bij betrokken.

| Stuk | Model | Herkomst |
| --- | --- | --- |
| Zwerm | Boids | Reynolds, 1986 |
| Patroon | Gray-Scott reactie-diffusie | Turing 1952 · Gray en Scott 1984 |
| Regel | Elementaire cellulaire automaten | Wolfram, 1983 |
| Stroming | Stromingsveld op ruis | Perlin, 1983 |
| Groei | L-systemen | Lindenmayer, 1968 |
| Zandhoop | Abelse zandhoop | Bak, Tang en Wiesenfeld, 1987 |

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
app/                 pagina's (App Router), globale stijl
components/
  SimStage.tsx       canvas, animatielus, knoppen — kent geen enkele simulatie
  Controls.tsx       bediening, opgebouwd uit de schema's van elk stuk
  StukView.tsx       koppelt een slug aan zijn simulatie (client)
lib/
  sim.ts             het raamwerk: Sim, SimSpec, Control, ruis, toeval
  sims/*.ts          de zes simulaties, los van React
  stukken.ts         de teksten en volgorde van de stukken
```

Een simulatie implementeert `init` en `step` en levert daarnaast een `SimSpec`
met standaardwaarden en een lijstje bedieningselementen. De `SimStage` regelt de
rest: resolutie en device pixel ratio, pauzeren buiten beeld, stilstaan bij
`prefers-reduced-motion`, opnieuw zaaien en het bewaren van een PNG.

Een stuk toevoegen is dus: een bestand in `lib/sims/`, een regel in het register
in `components/StukView.tsx`, en een item in `lib/stukken.ts`.

## Instellingen

`NEXT_PUBLIC_SITE_URL` overschrijft het domein in de metadata. Zonder die
variabele wordt op Vercel het productiedomein gebruikt en lokaal
`http://localhost:3000`.
