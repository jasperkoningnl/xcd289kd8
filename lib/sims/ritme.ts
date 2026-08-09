import { LOOKAHEAD } from "../audio";
import {
  bool,
  num,
  str,
  type Params,
  type Pointer,
  type Sim,
  type SimSpec,
  type Stage,
} from "../sim";

/**
 * Euclidische ritmes. De opgave: verdeel k tikken zo gelijkmatig mogelijk
 * over n stappen. Dat is hetzelfde probleem als de grootste gemene deler
 * zoeken, en het algoritme ervoor komt uit een heel andere hoek — Bjorklund
 * schreef het voor de timing van pulsen in een deeltjesversneller.
 *
 * Godfried Toussaint merkte in 2005 op dat de uitkomsten samenvallen met
 * ritmes die al eeuwen bestaan. E(3,8) is de Cubaanse tresillo, E(5,8) de
 * cinquillo. Niemand heeft die ontworpen als "de gelijkmatigste verdeling";
 * ze zijn zo gegroeid, en de wiskunde vindt ze terug.
 */

/**
 * Bjorklunds algoritme. Begin met k groepjes [1] en n−k groepjes [0], en vouw
 * ze herhaaldelijk in elkaar tot er hooguit één rest overblijft.
 */
export function bjorklund(pulsen: number, stappen: number): number[] {
  const n = Math.max(1, Math.round(stappen));
  const k = Math.max(0, Math.min(Math.round(pulsen), n));

  if (k === 0) return new Array(n).fill(0);
  if (k === n) return new Array(n).fill(1);

  let a: number[][] = Array.from({ length: k }, () => [1]);
  let b: number[][] = Array.from({ length: n - k }, () => [0]);

  while (b.length > 1 && a.length > 1) {
    const paren = Math.min(a.length, b.length);
    const samen: number[][] = [];
    for (let i = 0; i < paren; i++) samen.push([...a[i], ...b[i]]);

    const restA = a.slice(paren);
    const restB = b.slice(paren);

    a = samen;
    b = restA.length > 0 ? restA : restB;
  }

  return [...a.flat(), ...b.flat()];
}

type Spoor = {
  pulsen: number;
  stappen: number;
  draai: number;
  patroon: number[];
  /** Grondtoon van de stem, in hertz. */
  freq: number;
  /** Kleur van de ring. */
  tint: string;
  stem: "bel" | "hout" | "tik";
  /** Hoe fel de laatste tik nog nagloeit. */
  flits: number;
};

/** Voorinstellingen die elk een bestaand ritme opleveren. */
const PRESETS: Record<string, [number, number][]> = {
  tresillo: [
    [3, 8],
    [2, 8],
    [4, 16],
  ],
  cinquillo: [
    [5, 8],
    [3, 8],
    [4, 16],
  ],
  gahu: [
    [7, 16],
    [5, 16],
    [4, 16],
  ],
  balkan: [
    [4, 7],
    [3, 7],
    [7, 14],
  ],
  losjes: [
    [5, 12],
    [7, 12],
    [3, 12],
  ],
};

class Ritme implements Sim {
  private sporen: Spoor[] = [];
  /** Positie in de maat, in stappen — mag gebroken zijn, voor de wijzer. */
  private klok = 0;
  /** De eerstvolgende stap die nog ingepland moet worden. */
  private stapTeller = 0;
  /** Het tijdstip op de audioklok waarop die stap valt. */
  private volgendeTijd = 0;
  private gestart = false;

  init(stage: Stage, params: Params): void {
    const stemmen: Spoor["stem"][] = ["bel", "hout", "tik"];
    const frequenties = [523.25, 349.23, 0];
    const tinten = ["233, 162, 59", "148, 196, 160", "150, 160, 180"];

    this.sporen = [0, 1, 2].map((i) => {
      const pulsen = Math.round(num(params, `pulsen${i + 1}`, 3));
      const stappen = Math.round(num(params, `stappen${i + 1}`, 8));
      const draai = Math.round(num(params, `draai${i + 1}`, 0));
      return {
        pulsen,
        stappen,
        draai,
        patroon: bjorklund(pulsen, stappen),
        freq: frequenties[i],
        tint: tinten[i],
        stem: stemmen[i],
        flits: 0,
      };
    });

    this.klok = 0;
    this.stapTeller = 0;
    this.gestart = false;

    stage.ctx.fillStyle = "#0b0c0e";
    stage.ctx.fillRect(0, 0, stage.width, stage.height);
  }

  step(stage: Stage, params: Params, dt: number, pointer: Pointer | null): void {
    const bpm = num(params, "tempo", 104);

    // Eén stap is een zestiende; vier stappen is een tel.
    const stapDuur = 60 / bpm / 4;
    const audio = stage.audio;

    if (audio) {
      if (!this.gestart) {
        this.volgendeTijd = audio.now + 0.1;
        this.gestart = true;
      }

      // Vooruit inplannen op de audioklok. De teller loopt altijd vooruit en
      // de stapduur wordt elke ronde opnieuw gelezen, zodat een tempowijziging
      // gewoon vanaf de volgende stap ingaat in plaats van de planner
      // achterstallig te maken.
      let veiligheid = 0;
      while (this.volgendeTijd < audio.now + LOOKAHEAD && veiligheid++ < 256) {
        for (const spoor of this.sporen) {
          const index =
            (((this.stapTeller - spoor.draai) % spoor.stappen) + spoor.stappen) %
            spoor.stappen;
          if (spoor.patroon[index] === 1) this.speel(stage, spoor, this.volgendeTijd);
        }
        this.stapTeller++;
        this.volgendeTijd += stapDuur;
      }

      // De wijzer volgt de audioklok, zodat beeld en klank samenvallen.
      this.klok = this.stapTeller - (this.volgendeTijd - audio.now) / stapDuur;
    } else {
      // Zonder geluid loopt de klok gewoon op de framelus door, zodat het
      // beeld blijft draaien.
      this.gestart = false;
      this.klok += dt / stapDuur;
    }

    if (pointer && pointer.started) this.tikAan(stage, pointer);

    for (const spoor of this.sporen) spoor.flits *= Math.pow(0.015, dt);
    this.markeer();
    this.teken(stage, params);
  }

  private speel(stage: Stage, spoor: Spoor, tijd: number): void {
    const audio = stage.audio;
    if (!audio) return;

    if (spoor.stem === "bel") {
      audio.note(tijd, spoor.freq, {
        decay: 1.1,
        gain: 0.3,
        type: "sine",
        partial: 0.18,
        send: 0.45,
      });
    } else if (spoor.stem === "hout") {
      audio.note(tijd, spoor.freq, {
        decay: 0.22,
        gain: 0.34,
        type: "triangle",
        partial: 0.3,
        send: 0.2,
      });
    } else {
      audio.hit(tijd, { decay: 0.05, gain: 0.2, highpass: 4200, send: 0.12 });
    }
  }

  /** Zet de gloed aan van elk spoor dat nu net een tik heeft. */
  private markeer(): void {
    for (const spoor of this.sporen) {
      const stap = Math.floor(this.klok);
      const index =
        (((stap - spoor.draai) % spoor.stappen) + spoor.stappen) % spoor.stappen;
      if (spoor.patroon[index] === 1 && this.klok - stap < 0.25) {
        spoor.flits = Math.max(spoor.flits, 1);
      }
    }
  }

  /** Aantikken zet een stap in het buitenste spoor aan of uit. */
  private tikAan(stage: Stage, pointer: Pointer): void {
    const spoor = this.sporen[0];
    const cx = stage.width / 2;
    const cy = stage.height / 2;
    const hoek = Math.atan2(pointer.y - cy, pointer.x - cx) + Math.PI / 2;
    const genormaliseerd = ((hoek % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const index = Math.floor((genormaliseerd / (Math.PI * 2)) * spoor.stappen);
    spoor.patroon[index] = spoor.patroon[index] === 1 ? 0 : 1;
  }

  private teken(stage: Stage, params: Params): void {
    const { ctx, width, height } = stage;

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const buiten = Math.min(width, height) * 0.42;
    const ring = buiten / (this.sporen.length + 0.6);
    const toonPatroon = bool(params, "patroon", true);

    this.sporen.forEach((spoor, i) => {
      const straal = buiten - i * ring;
      const stapHoek = (Math.PI * 2) / spoor.stappen;

      ctx.strokeStyle = "rgba(236, 231, 221, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, straal, 0, Math.PI * 2);
      ctx.stroke();

      for (let s = 0; s < spoor.stappen; s++) {
        // Boven beginnen en met de klok mee, zoals een wijzerplaat.
        const hoek = s * stapHoek - Math.PI / 2;
        const x = cx + Math.cos(hoek) * straal;
        const y = cy + Math.sin(hoek) * straal;

        const index = (((s - spoor.draai) % spoor.stappen) + spoor.stappen) % spoor.stappen;
        const aan = spoor.patroon[index] === 1;

        const huidige = Math.floor(this.klok) % spoor.stappen === s % spoor.stappen;
        const straalPunt = aan ? ring * 0.19 : ring * 0.07;

        ctx.beginPath();
        ctx.arc(x, y, straalPunt, 0, Math.PI * 2);
        if (aan) {
          const gloed = huidige ? Math.max(spoor.flits, 0.35) : 0.35;
          ctx.fillStyle = `rgba(${spoor.tint}, ${(0.3 + gloed * 0.7).toFixed(3)})`;
        } else {
          ctx.fillStyle = "rgba(236, 231, 221, 0.18)";
        }
        ctx.fill();
      }
    });

    // De wijzer die rondgaat, op het traagste spoor.
    const maat = this.sporen[0].stappen;
    const wijzer = ((this.klok % maat) / maat) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = "rgba(236, 231, 221, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(wijzer) * buiten, cy + Math.sin(wijzer) * buiten);
    ctx.stroke();

    if (toonPatroon) this.tekenPatroon(stage);
  }

  /** De patronen als tekst onderaan: x voor een tik, punt voor stilte. */
  private tekenPatroon(stage: Stage): void {
    const { ctx, width, height } = stage;
    ctx.font = "12px ui-monospace, monospace";
    ctx.textAlign = "center";

    this.sporen.forEach((spoor, i) => {
      // Dezelfde afbeelding als bij het inplannen: stap s leest patroonplek
      // s − draai, zodat tekst, ring en klank altijd hetzelfde zeggen.
      const regel = spoor.patroon
        .map((_, s) => {
          const index =
            (((s - spoor.draai) % spoor.stappen) + spoor.stappen) % spoor.stappen;
          return spoor.patroon[index] === 1 ? "x" : "·";
        })
        .join(" ");
      ctx.fillStyle = `rgba(${spoor.tint}, 0.8)`;
      ctx.fillText(
        `E(${spoor.pulsen},${spoor.stappen})  ${regel}`,
        width / 2,
        height - 18 - (this.sporen.length - 1 - i) * 17,
      );
    });
  }
}

/** Bouwt de bediening voor één spoor op. */
function spoorControls(i: number): SimSpec["controls"] {
  const nr = i + 1;
  return [
    {
      kind: "slider",
      key: `pulsen${nr}`,
      label: { nl: `Spoor ${nr} · tikken k`, en: `Track ${nr} · onsets k` },
      min: 0,
      max: 16,
      step: 1,
      resets: true,
    },
    {
      kind: "slider",
      key: `stappen${nr}`,
      label: { nl: `Spoor ${nr} · stappen n`, en: `Track ${nr} · steps n` },
      min: 1,
      max: 16,
      step: 1,
      resets: true,
    },
    {
      kind: "slider",
      key: `draai${nr}`,
      label: { nl: `Spoor ${nr} · draai`, en: `Track ${nr} · rotation` },
      min: 0,
      max: 15,
      step: 1,
      resets: true,
    },
  ];
}

export const ritmeSpec: SimSpec = {
  create: () => new Ritme(),
  background: "#0b0c0e",
  audio: true,
  pointerHint: {
    nl: "Klik op de buitenste ring om een stap om te zetten.",
    en: "Click the outer ring to flip a step.",
  },
  defaults: {
    voorinstelling: "tresillo",
    tempo: 104,
    pulsen1: 3,
    stappen1: 8,
    draai1: 0,
    pulsen2: 2,
    stappen2: 8,
    draai2: 0,
    pulsen3: 4,
    stappen3: 16,
    draai3: 0,
    patroon: true,
  },
  controls: [
    {
      kind: "select",
      key: "voorinstelling",
      label: { nl: "Voorinstelling", en: "Preset" },
      options: [
        { value: "tresillo", label: { nl: "Tresillo", en: "Tresillo" } },
        { value: "cinquillo", label: { nl: "Cinquillo", en: "Cinquillo" } },
        { value: "gahu", label: { nl: "Gahu", en: "Gahu" } },
        { value: "balkan", label: { nl: "Zevendelig", en: "Sevenfold" } },
        { value: "losjes", label: { nl: "Twaalfdelig", en: "Twelvefold" } },
      ],
      apply: (value) => {
        const preset = PRESETS[value] ?? PRESETS.tresillo;
        const patch: Params = {};
        preset.forEach(([k, n], i) => {
          patch[`pulsen${i + 1}`] = k;
          patch[`stappen${i + 1}`] = n;
          patch[`draai${i + 1}`] = 0;
        });
        return patch;
      },
    },
    {
      kind: "slider",
      key: "tempo",
      label: { nl: "Tempo", en: "Tempo" },
      min: 50,
      max: 190,
      step: 1,
      format: (v) => `${v} bpm`,
    },
    ...spoorControls(0),
    ...spoorControls(1),
    ...spoorControls(2),
    {
      kind: "toggle",
      key: "patroon",
      label: { nl: "Toon patroon", en: "Show pattern" },
    },
  ],
};
