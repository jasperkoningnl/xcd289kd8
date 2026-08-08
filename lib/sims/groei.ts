import {
  decimal,
  num,
  str,
  type Params,
  type Pointer,
  type Sim,
  type SimSpec,
  type Stage,
} from "../sim";

/**
 * L-systemen (Lindenmayer, 1968). Begin met een korte tekenreeks en vervang
 * herhaaldelijk elk teken door een langere reeks. Lees de uitkomst daarna als
 * instructies voor een schildpad: vooruit, links, rechts, tak beginnen,
 * tak sluiten.
 *
 * Niemand tekent de plant. De plant is wat overblijft als je de vervangings-
 * regel een paar keer op zichzelf toepast.
 */

type Preset = {
  axiom: string;
  rules: Record<string, string>;
  angle: number;
  /** Hoeveel korter elke volgende generatie tekent. */
  shrink: number;
  /** Starthoek in graden, gemeten vanaf rechts. */
  heading: number;
  iterations: number;
};

export const PRESETS: Record<string, Preset> = {
  varen: {
    axiom: "X",
    rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" },
    angle: 25,
    shrink: 0.5,
    heading: -65,
    iterations: 6,
  },
  boom: {
    axiom: "F",
    rules: { F: "FF+[+F-F-F]-[-F+F+F]" },
    angle: 22.5,
    shrink: 0.42,
    heading: -90,
    iterations: 4,
  },
  kruid: {
    axiom: "X",
    rules: { X: "F[+X]F[-X]+X", F: "FF" },
    angle: 20,
    shrink: 0.5,
    heading: -90,
    iterations: 7,
  },
  sneeuw: {
    axiom: "F--F--F",
    rules: { F: "F+F--F+F" },
    angle: 60,
    shrink: 0.34,
    heading: 0,
    iterations: 4,
  },
  sierpinski: {
    axiom: "F-G-G",
    rules: { F: "F-G+F+G-F", G: "GG" },
    angle: 120,
    shrink: 0.5,
    heading: 0,
    iterations: 6,
  },
  draak: {
    axiom: "F",
    rules: { F: "F+G", G: "F-G" },
    angle: 90,
    shrink: 0.71,
    heading: 0,
    iterations: 12,
  },
};

/** Bovengrenzen; zonder deze loopt een L-systeem het geheugen uit. */
const MAX_STRING = 900_000;
const MAX_SEGMENTS = 160_000;

type Segment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Aantal open takken op dit punt: dieper = dunner en donkerder. */
  depth: number;
};

class Groei implements Sim {
  private segments: Segment[] = [];
  private drawn = 0;
  private accumulator = 0;
  private maxDepth = 1;
  private transform = { scale: 1, dx: 0, dy: 0 };

  init(stage: Stage, params: Params): void {
    const { ctx, width, height, random } = stage;

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, width, height);

    const preset = PRESETS[str(params, "vorm", "varen")] ?? PRESETS.varen;
    const iterations = Math.round(num(params, "iteraties", preset.iterations));
    const angle = num(params, "hoek", preset.angle);
    const jitter = num(params, "willekeur", 0);
    const shrink = num(params, "korting", preset.shrink);

    const sentence = expand(preset.axiom, preset.rules, iterations);
    this.segments = trace(sentence, {
      angle,
      jitter,
      shrink,
      heading: preset.heading,
      iterations,
      random,
    });

    this.fit(width, height);
    this.drawn = 0;
    this.accumulator = 0;
  }

  /** Schaalt en centreert de tekening zodat ze net binnen het beeld valt. */
  private fit(width: number, height: number): void {
    if (this.segments.length === 0) {
      this.transform = { scale: 1, dx: width / 2, dy: height / 2 };
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    this.maxDepth = 1;

    for (const s of this.segments) {
      if (s.x1 < minX) minX = s.x1;
      if (s.x2 < minX) minX = s.x2;
      if (s.y1 < minY) minY = s.y1;
      if (s.y2 < minY) minY = s.y2;
      if (s.x1 > maxX) maxX = s.x1;
      if (s.x2 > maxX) maxX = s.x2;
      if (s.y1 > maxY) maxY = s.y1;
      if (s.y2 > maxY) maxY = s.y2;
      if (s.depth > this.maxDepth) this.maxDepth = s.depth;
    }

    const padding = 0.9;
    const spanX = Math.max(maxX - minX, 1e-6);
    const spanY = Math.max(maxY - minY, 1e-6);
    const scale = Math.min((width * padding) / spanX, (height * padding) / spanY);

    this.transform = {
      scale,
      dx: width / 2 - ((minX + maxX) / 2) * scale,
      dy: height / 2 - ((minY + maxY) / 2) * scale,
    };
  }

  step(stage: Stage, params: Params, dt: number, _pointer: Pointer | null): void {
    if (this.drawn >= this.segments.length) return;

    const perSecond = num(params, "tempo", 2600);
    this.accumulator += dt * perSecond;
    const budget = Math.floor(this.accumulator);
    if (budget <= 0) return;
    this.accumulator -= budget;

    const end = Math.min(this.drawn + budget, this.segments.length);
    this.drawSegments(stage, params, this.drawn, end);
    this.drawn = end;
  }

  private drawSegments(
    stage: Stage,
    params: Params,
    from: number,
    to: number,
  ): void {
    const { ctx } = stage;
    const { scale, dx, dy } = this.transform;
    const dikte = num(params, "dikte", 1.6);
    const warm = str(params, "kleur", "amber") === "amber";

    ctx.lineCap = "round";

    for (let i = from; i < to; i++) {
      const s = this.segments[i];
      // Dieper in de boom: dunner, doffer. Dat leest als perspectief.
      const t = 1 - (s.depth - 1) / this.maxDepth;
      ctx.lineWidth = Math.max(0.35, dikte * (0.25 + t * 0.75));
      ctx.strokeStyle = warm
        ? `rgba(233, 162, 59, ${(0.35 + t * 0.55).toFixed(3)})`
        : `rgba(226, 232, 224, ${(0.3 + t * 0.55).toFixed(3)})`;

      ctx.beginPath();
      ctx.moveTo(s.x1 * scale + dx, s.y1 * scale + dy);
      ctx.lineTo(s.x2 * scale + dx, s.y2 * scale + dy);
      ctx.stroke();
    }
  }
}

/** Past de vervangingsregels `iterations` keer toe op het axioma. */
function expand(
  axiom: string,
  rules: Record<string, string>,
  iterations: number,
): string {
  let sentence = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = "";
    for (const char of sentence) {
      next += rules[char] ?? char;
      if (next.length > MAX_STRING) return next;
    }
    sentence = next;
  }
  return sentence;
}

/** Leest de reeks als schildpadinstructies en levert de lijnstukken op. */
function trace(
  sentence: string,
  opts: {
    angle: number;
    jitter: number;
    shrink: number;
    heading: number;
    iterations: number;
    random: () => number;
  },
): Segment[] {
  const segments: Segment[] = [];
  const turn = (opts.angle * Math.PI) / 180;
  const jitter = (opts.jitter * Math.PI) / 180;

  // Hoe meer generaties, hoe korter de stap — anders groeit de plant
  // buiten elk beeld.
  const length = 100 * Math.pow(opts.shrink, opts.iterations);

  let x = 0;
  let y = 0;
  let heading = (opts.heading * Math.PI) / 180;
  let depth = 1;

  const stack: { x: number; y: number; heading: number; depth: number }[] = [];

  for (const char of sentence) {
    switch (char) {
      case "F":
      case "G": {
        const nx = x + Math.cos(heading) * length;
        const ny = y + Math.sin(heading) * length;
        segments.push({ x1: x, y1: y, x2: nx, y2: ny, depth });
        x = nx;
        y = ny;
        break;
      }
      case "+":
        heading -= turn + (jitter > 0 ? (opts.random() - 0.5) * 2 * jitter : 0);
        break;
      case "-":
        heading += turn + (jitter > 0 ? (opts.random() - 0.5) * 2 * jitter : 0);
        break;
      case "[":
        stack.push({ x, y, heading, depth });
        depth++;
        break;
      case "]": {
        const saved = stack.pop();
        if (saved) {
          x = saved.x;
          y = saved.y;
          heading = saved.heading;
          depth = saved.depth;
        }
        break;
      }
      default:
        // X en andere tekens sturen alleen de vervanging, ze tekenen niet.
        break;
    }
    if (segments.length >= MAX_SEGMENTS) break;
  }

  return segments;
}

export const groeiSpec: SimSpec = {
  create: () => new Groei(),
  background: "#0b0c0e",
  defaults: {
    vorm: "varen",
    iteraties: 6,
    hoek: 25,
    korting: 0.5,
    willekeur: 0,
    dikte: 1.6,
    tempo: 2600,
    kleur: "amber",
  },
  controls: [
    {
      kind: "select",
      key: "vorm",
      label: { nl: "Vorm", en: "Shape" },
      resets: true,
      options: [
        { value: "varen", label: { nl: "Varen", en: "Fern" } },
        { value: "boom", label: { nl: "Boom", en: "Tree" } },
        { value: "kruid", label: { nl: "Kruid", en: "Weed" } },
        { value: "sneeuw", label: { nl: "Sneeuwvlok", en: "Snowflake" } },
        { value: "sierpinski", label: { nl: "Sierpinski", en: "Sierpinski" } },
        { value: "draak", label: { nl: "Drakenkromme", en: "Dragon curve" } },
      ],
      apply: (value) => {
        const preset = PRESETS[value] ?? PRESETS.varen;
        return {
          iteraties: preset.iterations,
          hoek: preset.angle,
          korting: preset.shrink,
        };
      },
    },
    {
      kind: "slider",
      key: "iteraties",
      label: { nl: "Generaties", en: "Generations" },
      min: 1,
      max: 14,
      step: 1,
      resets: true,
    },
    {
      kind: "slider",
      key: "hoek",
      label: { nl: "Draaihoek", en: "Turn angle" },
      min: 1,
      max: 150,
      step: 0.5,
      resets: true,
      format: (v, locale) => `${decimal(v, locale, v % 1 === 0 ? 0 : 1)}°`,
    },
    {
      kind: "slider",
      key: "korting",
      label: { nl: "Verkorting per generatie", en: "Shrink per generation" },
      min: 0.3,
      max: 0.8,
      step: 0.01,
      resets: true,
      format: (v, locale) => decimal(v, locale, 2),
    },
    {
      kind: "slider",
      key: "willekeur",
      label: { nl: "Willekeur in de hoek", en: "Jitter on the angle" },
      min: 0,
      max: 30,
      step: 0.5,
      resets: true,
      format: (v, locale) =>
        v === 0
          ? locale === "nl"
            ? "geen"
            : "none"
          : `± ${decimal(v, locale, v % 1 === 0 ? 0 : 1)}°`,
    },
    {
      kind: "slider",
      key: "dikte",
      label: { nl: "Lijndikte", en: "Line weight" },
      min: 0.4,
      max: 4,
      step: 0.1,
      format: (v, locale) => decimal(v, locale, 1),
    },
    {
      kind: "slider",
      key: "tempo",
      label: { nl: "Lijnen per seconde", en: "Lines per second" },
      min: 200,
      max: 30000,
      step: 200,
    },
    {
      kind: "select",
      key: "kleur",
      label: { nl: "Kleur", en: "Colour" },
      options: [
        { value: "amber", label: { nl: "Amber", en: "Amber" } },
        { value: "krijt", label: { nl: "Krijt", en: "Chalk" } },
      ],
    },
  ],
};
