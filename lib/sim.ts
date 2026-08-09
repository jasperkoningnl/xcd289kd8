import type { AudioBus } from "./audio";
import type { Locale, Text } from "./i18n";

/**
 * Een piepklein raamwerk voor de simulaties op deze site.
 *
 * Elk stuk levert een `SimSpec`: een set parameters met bijbehorende
 * bedieningselementen, plus een fabriek die een `Sim` maakt. De `SimStage`
 * regelt canvas, resolutie, de animatielus en de knoppen — een simulatie
 * hoeft alleen te weten hoe ze zichzelf tekent.
 */

export type Params = Record<string, number | string | boolean>;

export type Stage = {
  /** 2D-context, al geschaald naar CSS-pixels. */
  ctx: CanvasRenderingContext2D;
  /** Breedte in CSS-pixels. */
  width: number;
  /** Hoogte in CSS-pixels. */
  height: number;
  /** Device pixel ratio waarmee het canvas is opgezet. */
  dpr: number;
  /** Deterministische toevalsgenerator, opnieuw te zaaien bij reset. */
  random: () => number;
  /**
   * De geluidsbus, of `null` als de bezoeker geluid uit heeft staan. Een
   * simulatie moet altijd zonder kunnen: het beeld is nooit afhankelijk van
   * het geluid.
   */
  audio: AudioBus | null;
};

export type Pointer = {
  x: number;
  y: number;
  /** Wordt ingedrukt gehouden. */
  down: boolean;
  /** Eerste frame van een aanraking. */
  started: boolean;
};

export interface Sim {
  /** Eenmalig bij start en na elke reset of formaatwijziging. */
  init(stage: Stage, params: Params): void;
  /** Eén frame. `dt` is in seconden, begrensd om sprongen te dempen. */
  step(stage: Stage, params: Params, dt: number, pointer: Pointer | null): void;
}

export type Control =
  | {
      kind: "slider";
      key: string;
      label: Text;
      min: number;
      max: number;
      step: number;
      /** Herstart de simulatie bij wijziging (voor structurele parameters). */
      resets?: boolean;
      /** Toon de waarde leesbaar, bv. als percentage of met eenheid. */
      format?: (value: number, locale: Locale) => string;
    }
  | {
      kind: "select";
      key: string;
      label: Text;
      options: { value: string; label: Text }[];
      resets?: boolean;
      /** Zet meteen andere parameters, voor voorinstellingen. */
      apply?: (value: string) => Params;
    }
  | {
      kind: "toggle";
      key: string;
      label: Text;
      resets?: boolean;
    };

export type SimSpec = {
  create: () => Sim;
  defaults: Params;
  controls: Control[];
  /** Achtergrond waarop het canvas wordt gewist. */
  background?: string;
  /** Aanwijzing bij simulaties die op muis of vinger reageren. */
  pointerHint?: Text;
  /** Dit stuk maakt geluid; de bediening krijgt dan een geluidsknop. */
  audio?: boolean;
};

/* ------------------------------------------------------------------ *
 * Toeval en ruis
 * ------------------------------------------------------------------ */

/** Kleine, snelle, herhaalbare generator (mulberry32). */
export function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Waardenruis met kubieke interpolatie over een 256×256-rooster.
 * Genoeg voor stromingsvelden en veel goedkoper dan echte simplexruis.
 */
export class Noise {
  private readonly table: Float32Array;
  private static readonly SIZE = 256;
  private static readonly MASK = 255;

  constructor(random: () => number) {
    const n = Noise.SIZE * Noise.SIZE;
    this.table = new Float32Array(n);
    for (let i = 0; i < n; i++) this.table[i] = random();
  }

  private at(x: number, y: number): number {
    const ix = x & Noise.MASK;
    const iy = y & Noise.MASK;
    return this.table[iy * Noise.SIZE + ix];
  }

  /** Ruis in [0, 1). */
  value(x: number, y: number): number {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    // Smoothstep dempt de rasterranden.
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const a = this.at(x0, y0);
    const b = this.at(x0 + 1, y0);
    const c = this.at(x0, y0 + 1);
    const d = this.at(x0 + 1, y0 + 1);

    const top = a + (b - a) * sx;
    const bottom = c + (d - c) * sx;
    return top + (bottom - top) * sy;
  }

  /** Gestapelde ruis: meer octaven, meer detail. */
  fractal(x: number, y: number, octaves = 3): number {
    let sum = 0;
    let amplitude = 1;
    let total = 0;
    let fx = x;
    let fy = y;
    for (let i = 0; i < octaves; i++) {
      sum += this.value(fx, fy) * amplitude;
      total += amplitude;
      amplitude *= 0.5;
      fx *= 2;
      fy *= 2;
    }
    return sum / total;
  }
}

/* ------------------------------------------------------------------ *
 * Kleine hulpjes
 * ------------------------------------------------------------------ */

export const num = (params: Params, key: string, fallback = 0): number => {
  const v = params[key];
  return typeof v === "number" ? v : fallback;
};

export const str = (params: Params, key: string, fallback = ""): string => {
  const v = params[key];
  return typeof v === "string" ? v : fallback;
};

export const bool = (params: Params, key: string, fallback = false): boolean => {
  const v = params[key];
  return typeof v === "boolean" ? v : fallback;
};

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

/**
 * Een getal zoals de taal het schrijft: 0,0035 in het Nederlands,
 * 0.0035 in het Engels.
 */
export function decimal(value: number, locale: Locale, digits: number): string {
  const text = value.toFixed(digits);
  return locale === "nl" ? text.replace(".", ",") : text;
}

/** Lineaire interpolatie tussen twee kleuren in RGB. */
export function mixRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/**
 * Zoekt een kleur op in een verloop met gelijk verdeelde stops.
 * `t` buiten [0,1] wordt afgekapt.
 */
export function ramp(
  stops: [number, number, number][],
  t: number,
): [number, number, number] {
  const x = clamp(t, 0, 1) * (stops.length - 1);
  const i = Math.min(Math.floor(x), stops.length - 2);
  return mixRgb(stops[i], stops[i + 1], x - i);
}
