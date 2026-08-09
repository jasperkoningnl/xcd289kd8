import { LOOKAHEAD, toonhoogte } from "../audio";
import {
  bool,
  clamp,
  decimal,
  num,
  type Params,
  type Pointer,
  type Sim,
  type SimSpec,
  type Stage,
} from "../sim";

/**
 * Het model van Kuramoto (1975). Een verzameling oscillatoren die elk hun
 * eigen tempo hebben en elkaar een klein duwtje geven:
 *
 *   θᵢ' = ωᵢ + (K/N) · Σⱼ sin(θⱼ − θᵢ)
 *
 * Nergens staat dat ze gelijk moeten gaan lopen. Toch gebeurt het, en niet
 * geleidelijk: onder een zekere koppeling blijft het rommelen, erboven klapt
 * de hele groep binnen enkele seconden in de pas.
 *
 * De som over alle paren hoeft niet echt te worden uitgerekend. Het gemiddelde
 * van alle fasen — de ordeparameter r·e^(iψ) — vat precies samen wat elke
 * oscillator van de rest merkt, en dat scheelt N² tegen N.
 */

type Oscillator = {
  /** Fase, in radialen. */
  phase: number;
  /** Eigen tempo, in radialen per seconde. */
  omega: number;
  /** Trede in de toonladder. */
  toon: number;
  /** Hoe fel de stip nu oplicht, 0–1. */
  flits: number;
};

class Synchronie implements Sim {
  private osc: Oscillator[] = [];
  private cols = 1;
  private rows = 1;
  /** Ordeparameter van het vorige frame, voor de meter. */
  private r = 0;
  private psi = 0;

  init(stage: Stage, params: Params): void {
    const { ctx, width, height, random } = stage;

    const count = Math.round(num(params, "aantal", 144));
    const tempo = num(params, "tempo", 1.6);
    const spread = num(params, "spreiding", 0.25);

    this.osc = new Array(count);
    for (let i = 0; i < count; i++) {
      // Box-Muller geeft een normale verdeling van eigen tempo's; een paar
      // uitschieters die niet meekomen maken het beeld eerlijker.
      const u = Math.max(random(), 1e-9);
      const v = random();
      const gauss = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);

      this.osc[i] = {
        phase: random() * Math.PI * 2,
        omega: (tempo + gauss * spread) * Math.PI * 2,
        toon: Math.floor(random() * 10),
        flits: 0,
      };
    }

    // Een zo vierkant mogelijk raster dat het vlak vult.
    this.cols = Math.max(1, Math.round(Math.sqrt((count * width) / height)));
    this.rows = Math.ceil(count / this.cols);

    this.r = 0;
    this.psi = 0;

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, width, height);
  }

  step(stage: Stage, params: Params, dt: number, pointer: Pointer | null): void {
    const coupling = num(params, "koppeling", 4);
    const geluid = bool(params, "geluid", true);
    const grondtoon = num(params, "grondtoon", 220);

    const n = this.osc.length;
    if (n === 0) return;

    // De ordeparameter: het gemiddelde van alle fasen op de eenheidscirkel.
    // r loopt van 0 (volstrekt verspreid) tot 1 (volmaakt gelijk).
    let sumCos = 0;
    let sumSin = 0;
    for (const o of this.osc) {
      sumCos += Math.cos(o.phase);
      sumSin += Math.sin(o.phase);
    }
    this.r = Math.hypot(sumCos, sumSin) / n;
    this.psi = Math.atan2(sumSin, sumCos);

    const pull = coupling * this.r;
    const audio = geluid ? stage.audio : null;
    const when = audio ? audio.now + LOOKAHEAD : 0;

    // Bij honderden gelijktijdige tikken wordt het een klap in plaats van een
    // akkoord; daarom een plafond per frame.
    let voices = 0;
    const maxVoices = 20;
    const gain = 0.34 / Math.sqrt(n);

    for (let i = 0; i < n; i++) {
      const o = this.osc[i];
      const before = o.phase;
      o.phase += (o.omega + pull * Math.sin(this.psi - o.phase)) * dt;

      // Een aanraking geeft een zet: alles onder de vinger schiet naar de
      // fase van de groep. Zichtbaar herstel daarna.
      if (pointer && pointer.down) {
        const at = this.positie(stage, i);
        if (Math.hypot(at.x - pointer.x, at.y - pointer.y) < 90) {
          o.phase = this.psi;
        }
      }

      // De fase is net over 2π gegaan: dit is het moment van oplichten.
      if (Math.floor(o.phase / (Math.PI * 2)) > Math.floor(before / (Math.PI * 2))) {
        o.flits = 1;
        if (audio && voices < maxVoices) {
          voices++;
          audio.note(when, toonhoogte(o.toon, grondtoon), {
            decay: 0.9,
            gain,
            type: "sine",
            partial: 0.12,
            send: 0.4,
          });
        }
      }

      o.flits *= Math.pow(0.02, dt);
    }

    this.teken(stage, params);
  }

  /** Waar stip `i` staat in het raster. */
  private positie(stage: Stage, i: number): { x: number; y: number } {
    const cellW = stage.width / this.cols;
    const cellH = (stage.height * 0.82) / this.rows;
    const col = i % this.cols;
    const row = Math.floor(i / this.cols);
    return { x: (col + 0.5) * cellW, y: (row + 0.5) * cellH };
  }

  private teken(stage: Stage, params: Params): void {
    const { ctx, width, height } = stage;

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, width, height);

    const straal = Math.max(
      2,
      Math.min(width / this.cols, (height * 0.82) / this.rows) * 0.3,
    );

    for (let i = 0; i < this.osc.length; i++) {
      const o = this.osc[i];
      const { x, y } = this.positie(stage, i);

      // Doffe grondstip, zodat het raster ook tussen twee flitsen zichtbaar is.
      ctx.beginPath();
      ctx.arc(x, y, straal * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(236, 231, 221, 0.09)";
      ctx.fill();

      if (o.flits > 0.01) {
        ctx.beginPath();
        ctx.arc(x, y, straal * (0.55 + o.flits * 0.75), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233, 162, 59, ${(o.flits * 0.95).toFixed(3)})`;
        ctx.fill();
      }
    }

    if (bool(params, "meter", true)) this.tekenMeter(stage);
  }

  /**
   * De fasecirkel onderaan: elke oscillator als punt op de eenheidscirkel,
   * plus de pijl van de ordeparameter. Hier is de omslag het duidelijkst —
   * de wolk gaat van gelijkmatig verdeeld naar één klont.
   */
  private tekenMeter(stage: Stage): void {
    const { ctx, width, height } = stage;

    const cx = width / 2;
    const band = height * 0.18;
    const cy = height - band / 2;
    const straal = Math.min(band * 0.38, width * 0.08);

    ctx.strokeStyle = "rgba(236, 231, 221, 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, straal, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(236, 231, 221, 0.5)";
    for (const o of this.osc) {
      const x = cx + Math.cos(o.phase) * straal;
      const y = cy + Math.sin(o.phase) * straal;
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "#e9a23b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(this.psi) * straal * this.r, cy + Math.sin(this.psi) * straal * this.r);
    ctx.stroke();

    ctx.fillStyle = "#e9a23b";
    ctx.font = "11px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `r = ${clamp(this.r, 0, 1).toFixed(2)}`,
      cx + straal + 12,
      cy + 4,
    );
  }
}

export const synchronieSpec: SimSpec = {
  create: () => new Synchronie(),
  background: "#0b0c0e",
  audio: true,
  pointerHint: {
    nl: "Klik en sleep om een groepje in de pas te duwen.",
    en: "Click and drag to shove a cluster into step.",
  },
  defaults: {
    aantal: 144,
    koppeling: 4,
    spreiding: 0.25,
    tempo: 1.6,
    grondtoon: 220,
    geluid: true,
    meter: true,
  },
  controls: [
    {
      kind: "slider",
      key: "koppeling",
      label: { nl: "Koppeling K", en: "Coupling K" },
      min: 0,
      max: 8,
      step: 0.05,
      format: (v, locale) => decimal(v, locale, 2),
    },
    {
      kind: "slider",
      key: "spreiding",
      label: { nl: "Spreiding in tempo", en: "Spread in tempo" },
      min: 0,
      max: 1.5,
      step: 0.01,
      resets: true,
      format: (v, locale) => decimal(v, locale, 2),
    },
    {
      kind: "slider",
      key: "aantal",
      label: { nl: "Aantal oscillatoren", en: "Number of oscillators" },
      min: 16,
      max: 900,
      step: 4,
      resets: true,
    },
    {
      kind: "slider",
      key: "tempo",
      label: { nl: "Gemiddeld tempo", en: "Average tempo" },
      min: 0.4,
      max: 4,
      step: 0.1,
      resets: true,
      format: (v, locale) => `${decimal(v, locale, 1)} Hz`,
    },
    {
      kind: "slider",
      key: "grondtoon",
      label: { nl: "Grondtoon", en: "Root note" },
      min: 110,
      max: 440,
      step: 10,
      format: (v) => `${v} Hz`,
    },
    { kind: "toggle", key: "geluid", label: { nl: "Klank", en: "Sound" } },
    { kind: "toggle", key: "meter", label: { nl: "Fasecirkel", en: "Phase circle" } },
  ],
};
