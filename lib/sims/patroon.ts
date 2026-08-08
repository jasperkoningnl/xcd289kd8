import {
  clamp,
  decimal,
  num,
  ramp,
  str,
  type Params,
  type Pointer,
  type Sim,
  type SimSpec,
  type Stage,
} from "../sim";

/**
 * Het Gray-Scott-model: twee stoffen, A en B. B eet A op en vermenigvuldigt
 * zich daarbij, A wordt aangevuld, B wordt afgevoerd. Beide diffunderen.
 *
 *   A' = A + (dA·∇²A − A·B² + f·(1 − A))·dt
 *   B' = B + (dB·∇²B + A·B² − (k + f)·B)·dt
 *
 * Twee getallen — de aanvoer f en de afvoer k — bepalen of je stippen,
 * strepen, kronkels of niets krijgt.
 */

const PALETTES: Record<string, [number, number, number][]> = {
  inkt: [
    [10, 11, 13],
    [26, 32, 42],
    [92, 116, 132],
    [214, 219, 214],
    [255, 255, 255],
  ],
  koper: [
    [12, 10, 9],
    [58, 30, 16],
    [166, 84, 30],
    [233, 162, 59],
    [253, 233, 196],
  ],
  mos: [
    [8, 12, 10],
    [16, 46, 38],
    [42, 108, 84],
    [148, 196, 130],
    [238, 245, 220],
  ],
  koraal: [
    [14, 8, 16],
    [58, 18, 60],
    [156, 40, 84],
    [232, 108, 92],
    [252, 224, 186],
  ],
};

/** Voorinstellingen die in het Gray-Scott-vlak elk hun eigen wereld zijn. */
const PRESETS: Record<string, { aanvoer: number; afvoer: number }> = {
  stippen: { aanvoer: 0.035, afvoer: 0.065 },
  strepen: { aanvoer: 0.026, afvoer: 0.051 },
  kronkels: { aanvoer: 0.03, afvoer: 0.056 },
  koraal: { aanvoer: 0.0545, afvoer: 0.062 },
  mitose: { aanvoer: 0.0367, afvoer: 0.0649 },
  chaos: { aanvoer: 0.026, afvoer: 0.055 },
};

class Patroon implements Sim {
  private cols = 0;
  private rows = 0;
  private a = new Float32Array(0);
  private b = new Float32Array(0);
  private a2 = new Float32Array(0);
  private b2 = new Float32Array(0);

  private buffer: HTMLCanvasElement | null = null;
  private bufferCtx: CanvasRenderingContext2D | null = null;
  private image: ImageData | null = null;

  init(stage: Stage, params: Params): void {
    const { width, height, random } = stage;

    // Het rooster staat los van de schermresolutie: een grover rooster is
    // sneller en geeft grotere, rustiger patronen.
    const scale = num(params, "grofheid", 3);
    this.cols = Math.max(32, Math.round(width / scale));
    this.rows = Math.max(32, Math.round(height / scale));

    const n = this.cols * this.rows;
    this.a = new Float32Array(n).fill(1);
    this.b = new Float32Array(n);
    this.a2 = new Float32Array(n);
    this.b2 = new Float32Array(n);

    // Een handvol druppels B is genoeg om alles op gang te brengen.
    const seeds = 14;
    for (let s = 0; s < seeds; s++) {
      const cx = Math.floor(random() * this.cols);
      const cy = Math.floor(random() * this.rows);
      const r = 3 + Math.floor(random() * 5);
      this.blob(cx, cy, r);
    }

    const buffer = document.createElement("canvas");
    buffer.width = this.cols;
    buffer.height = this.rows;
    this.buffer = buffer;
    this.bufferCtx = buffer.getContext("2d");
    this.image = this.bufferCtx?.createImageData(this.cols, this.rows) ?? null;

    stage.ctx.fillStyle = "#0b0c0e";
    stage.ctx.fillRect(0, 0, width, height);
  }

  private blob(cx: number, cy: number, r: number): void {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y > r * r) continue;
        const gx = cx + x;
        const gy = cy + y;
        if (gx < 0 || gx >= this.cols || gy < 0 || gy >= this.rows) continue;
        this.b[gy * this.cols + gx] = 1;
      }
    }
  }

  step(stage: Stage, params: Params, _dt: number, pointer: Pointer | null): void {
    const feed = num(params, "aanvoer", 0.035);
    const kill = num(params, "afvoer", 0.065);
    const dA = num(params, "diffusieA", 1.0);
    const dB = num(params, "diffusieB", 0.5);
    const iterations = Math.round(num(params, "tempo", 10));

    if (pointer && pointer.down) {
      const gx = Math.floor((pointer.x / stage.width) * this.cols);
      const gy = Math.floor((pointer.y / stage.height) * this.rows);
      this.blob(gx, gy, Math.max(3, Math.round(this.cols / 60)));
    }

    for (let i = 0; i < iterations; i++) this.react(feed, kill, dA, dB);
    this.render(stage, params);
  }

  /** Eén tijdstap van de reactie-diffusievergelijking over het hele rooster. */
  private react(feed: number, kill: number, dA: number, dB: number): void {
    const { cols, rows, a, b, a2, b2 } = this;

    for (let y = 0; y < rows; y++) {
      // Randen lopen rond, zodat het patroon geen zichtbare rand krijgt.
      const yUp = ((y - 1 + rows) % rows) * cols;
      const yDown = ((y + 1) % rows) * cols;
      const yMid = y * cols;

      for (let x = 0; x < cols; x++) {
        const xLeft = (x - 1 + cols) % cols;
        const xRight = (x + 1) % cols;
        const i = yMid + x;

        // Laplaciaan met de gebruikelijke 3×3-kern (0.2 recht, 0.05 schuin).
        const lapA =
          a[yUp + x] * 0.2 +
          a[yDown + x] * 0.2 +
          a[yMid + xLeft] * 0.2 +
          a[yMid + xRight] * 0.2 +
          a[yUp + xLeft] * 0.05 +
          a[yUp + xRight] * 0.05 +
          a[yDown + xLeft] * 0.05 +
          a[yDown + xRight] * 0.05 -
          a[i];

        const lapB =
          b[yUp + x] * 0.2 +
          b[yDown + x] * 0.2 +
          b[yMid + xLeft] * 0.2 +
          b[yMid + xRight] * 0.2 +
          b[yUp + xLeft] * 0.05 +
          b[yUp + xRight] * 0.05 +
          b[yDown + xLeft] * 0.05 +
          b[yDown + xRight] * 0.05 -
          b[i];

        const av = a[i];
        const bv = b[i];
        const reaction = av * bv * bv;

        a2[i] = clamp(av + (dA * lapA - reaction + feed * (1 - av)), 0, 1);
        b2[i] = clamp(bv + (dB * lapB + reaction - (kill + feed) * bv), 0, 1);
      }
    }

    this.a = a2;
    this.b = b2;
    this.a2 = a;
    this.b2 = b;
  }

  private render(stage: Stage, params: Params): void {
    const { bufferCtx, buffer, image } = this;
    if (!bufferCtx || !buffer || !image) return;

    const stops = PALETTES[str(params, "palet", "inkt")] ?? PALETTES.inkt;
    const data = image.data;
    const n = this.cols * this.rows;

    for (let i = 0; i < n; i++) {
      // Het verschil tussen de twee stoffen leest prettiger dan B alleen.
      const t = clamp(this.a[i] - this.b[i], 0, 1);
      const [r, g, bl] = ramp(stops, t);
      const o = i * 4;
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = bl;
      data[o + 3] = 255;
    }

    bufferCtx.putImageData(image, 0, 0);

    const { ctx, width, height } = stage;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buffer, 0, 0, width, height);
  }
}

export const patroonSpec: SimSpec = {
  create: () => new Patroon(),
  background: "#0b0c0e",
  pointerHint: {
    nl: "Klik en sleep om stof B toe te voegen.",
    en: "Click and drag to add substance B.",
  },
  defaults: {
    voorinstelling: "kronkels",
    aanvoer: 0.03,
    afvoer: 0.056,
    diffusieA: 1.0,
    diffusieB: 0.5,
    tempo: 10,
    grofheid: 3,
    palet: "inkt",
  },
  controls: [
    {
      kind: "select",
      key: "voorinstelling",
      label: { nl: "Voorinstelling", en: "Preset" },
      options: [
        { value: "kronkels", label: { nl: "Kronkels", en: "Worms" } },
        { value: "stippen", label: { nl: "Stippen", en: "Spots" } },
        { value: "strepen", label: { nl: "Strepen", en: "Stripes" } },
        { value: "koraal", label: { nl: "Koraal", en: "Coral" } },
        { value: "mitose", label: { nl: "Mitose", en: "Mitosis" } },
        { value: "chaos", label: { nl: "Chaos", en: "Chaos" } },
      ],
      apply: (value) => {
        const preset = PRESETS[value] ?? PRESETS.kronkels;
        return { aanvoer: preset.aanvoer, afvoer: preset.afvoer };
      },
    },
    {
      kind: "slider",
      key: "aanvoer",
      label: { nl: "Aanvoer f", en: "Feed rate f" },
      min: 0.01,
      max: 0.09,
      step: 0.0005,
      format: (v, locale) => decimal(v, locale, 4),
    },
    {
      kind: "slider",
      key: "afvoer",
      label: { nl: "Afvoer k", en: "Kill rate k" },
      min: 0.04,
      max: 0.075,
      step: 0.0005,
      format: (v, locale) => decimal(v, locale, 4),
    },
    {
      kind: "slider",
      key: "diffusieB",
      label: { nl: "Diffusie B", en: "Diffusion of B" },
      min: 0.2,
      max: 0.8,
      step: 0.01,
      format: (v, locale) => decimal(v, locale, 2),
    },
    {
      kind: "slider",
      key: "tempo",
      label: { nl: "Stappen per beeld", en: "Steps per frame" },
      min: 1,
      max: 24,
      step: 1,
    },
    {
      kind: "slider",
      key: "grofheid",
      label: { nl: "Grofheid rooster", en: "Grid coarseness" },
      min: 2,
      max: 8,
      step: 1,
      resets: true,
    },
    {
      kind: "select",
      key: "palet",
      label: { nl: "Palet", en: "Palette" },
      options: [
        { value: "inkt", label: { nl: "Inkt", en: "Ink" } },
        { value: "koper", label: { nl: "Koper", en: "Copper" } },
        { value: "mos", label: { nl: "Mos", en: "Moss" } },
        { value: "koraal", label: { nl: "Koraal", en: "Coral" } },
      ],
    },
  ],
};
