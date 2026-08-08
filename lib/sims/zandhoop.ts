import {
  num,
  str,
  type Params,
  type Pointer,
  type Sim,
  type SimSpec,
  type Stage,
} from "../sim";

/**
 * De abelse zandhoop (Bak, Tang en Wiesenfeld, 1987). Op elk vakje ligt een
 * stapeltje korrels. Ligt er vier of meer, dan stort het in en gaat er één
 * korrel naar elk van de vier buren. Die kunnen daardoor zelf instorten.
 *
 * "Abels" wil zeggen: de eindstand hangt niet af van de volgorde waarin je
 * de instortingen afhandelt. Waar je ook begint, je eindigt op hetzelfde
 * patroon.
 */

const PALETTES: Record<string, [number, number, number][]> = {
  archief: [
    [11, 12, 14],
    [46, 52, 64],
    [138, 122, 96],
    [233, 162, 59],
  ],
  krijt: [
    [11, 12, 14],
    [58, 62, 68],
    [140, 146, 150],
    [237, 234, 228],
  ],
  getij: [
    [8, 14, 20],
    [22, 68, 92],
    [72, 146, 152],
    [206, 232, 214],
  ],
  bloed: [
    [12, 8, 10],
    [72, 18, 32],
    [176, 52, 54],
    [242, 186, 128],
  ],
};

/** Bovengrens per beeld, zodat een grote lawine het tabblad niet blokkeert. */
const MAX_TOPPLES_PER_FRAME = 900_000;

class Zandhoop implements Sim {
  private size = 0;
  private pile = new Int32Array(0);
  private stack = new Int32Array(0);
  private stackTop = 0;
  private queued = new Uint8Array(0);
  private accumulator = 0;

  private buffer: HTMLCanvasElement | null = null;
  private bufferCtx: CanvasRenderingContext2D | null = null;
  private image: ImageData | null = null;

  init(stage: Stage, params: Params): void {
    const { ctx, width, height } = stage;

    // Een oneven maat geeft een echt middenvakje, wat het patroon symmetrisch
    // houdt bij een bron in het midden.
    const requested = Math.round(num(params, "rooster", 301));
    this.size = requested % 2 === 0 ? requested + 1 : requested;

    const n = this.size * this.size;
    this.pile = new Int32Array(n);
    this.queued = new Uint8Array(n);
    this.stack = new Int32Array(n);
    this.stackTop = 0;
    this.accumulator = 0;

    const buffer = document.createElement("canvas");
    buffer.width = this.size;
    buffer.height = this.size;
    this.buffer = buffer;
    this.bufferCtx = buffer.getContext("2d");
    this.image = this.bufferCtx?.createImageData(this.size, this.size) ?? null;

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, width, height);
  }

  private push(index: number): void {
    if (this.queued[index]) return;
    this.queued[index] = 1;
    this.stack[this.stackTop++] = index;
  }

  private drop(index: number, grains: number): void {
    this.pile[index] += grains;
    if (this.pile[index] >= 4) this.push(index);
  }

  step(stage: Stage, params: Params, dt: number, pointer: Pointer | null): void {
    const bron = str(params, "bron", "midden");
    const rate = num(params, "toevoer", 20000);
    const centre = ((this.size - 1) / 2) * this.size + (this.size - 1) / 2;

    if (pointer && pointer.down) {
      const gx = Math.floor((pointer.x / stage.width) * this.size);
      const gy = Math.floor((pointer.y / stage.height) * this.size);
      if (gx >= 0 && gx < this.size && gy >= 0 && gy < this.size) {
        this.drop(gy * this.size + gx, 400);
      }
    }

    this.accumulator += dt * rate;
    const grains = Math.floor(this.accumulator);
    this.accumulator -= grains;

    if (bron === "midden") {
      // Alles op één punt: het bekende vierkante fractaal.
      if (grains > 0) this.drop(centre, grains);
    } else {
      // Regen: overal een enkele korrel. Levert een egale kritieke toestand op.
      // Elke korrel apart plaatsen kost tijd, dus met een bovengrens.
      const drops = Math.min(grains, 4000);
      for (let i = 0; i < drops; i++) {
        const gx = Math.floor(stage.random() * this.size);
        const gy = Math.floor(stage.random() * this.size);
        this.drop(gy * this.size + gx, 1);
      }
    }

    this.stabilise();
    this.render(stage, params);
  }

  /** Handelt instortingen af tot alles stabiel is of het budget op is. */
  private stabilise(): void {
    const { pile, size } = this;
    let work = 0;

    while (this.stackTop > 0 && work < MAX_TOPPLES_PER_FRAME) {
      const i = this.stack[--this.stackTop];
      this.queued[i] = 0;

      const height = pile[i];
      if (height < 4) continue;

      // In één keer zoveel mogelijk instorten scheelt veel heen en weer.
      const times = height >> 2;
      pile[i] = height - times * 4;
      work += times;

      const x = i % size;
      const y = (i / size) | 0;

      // Korrels die over de rand vallen verdwijnen: dat is wat de hoop
      // uiteindelijk stabiel maakt.
      if (x > 0) {
        const j = i - 1;
        pile[j] += times;
        if (pile[j] >= 4) this.push(j);
      }
      if (x < size - 1) {
        const j = i + 1;
        pile[j] += times;
        if (pile[j] >= 4) this.push(j);
      }
      if (y > 0) {
        const j = i - size;
        pile[j] += times;
        if (pile[j] >= 4) this.push(j);
      }
      if (y < size - 1) {
        const j = i + size;
        pile[j] += times;
        if (pile[j] >= 4) this.push(j);
      }
    }
  }

  private render(stage: Stage, params: Params): void {
    const { bufferCtx, buffer, image } = this;
    if (!bufferCtx || !buffer || !image) return;

    const stops = PALETTES[str(params, "palet", "archief")] ?? PALETTES.archief;
    const data = image.data;
    const n = this.size * this.size;

    for (let i = 0; i < n; i++) {
      const h = this.pile[i];
      const [r, g, b] = stops[h > 3 ? 3 : h];
      const o = i * 4;
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
      data[o + 3] = 255;
    }

    bufferCtx.putImageData(image, 0, 0);

    // Vierkant rooster in een rechthoekig venster: gecentreerd inpassen.
    const { ctx, width, height } = stage;
    const side = Math.min(width, height);
    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = side < this.size;
    ctx.drawImage(buffer, (width - side) / 2, (height - side) / 2, side, side);
  }
}

export const zandhoopSpec: SimSpec = {
  create: () => new Zandhoop(),
  background: "#0b0c0e",
  pointerHint: "Klik om een schep zand te storten.",
  defaults: {
    rooster: 301,
    toevoer: 20000,
    bron: "midden",
    palet: "archief",
  },
  controls: [
    {
      kind: "slider",
      key: "rooster",
      label: "Roostermaat",
      min: 101,
      max: 701,
      step: 50,
      resets: true,
      format: (v) => `${v} × ${v}`,
    },
    {
      kind: "slider",
      key: "toevoer",
      label: "Korrels per seconde",
      min: 500,
      max: 400000,
      step: 500,
    },
    {
      kind: "select",
      key: "bron",
      label: "Bron",
      options: [
        { value: "midden", label: "Eén punt" },
        { value: "regen", label: "Regen" },
      ],
      resets: true,
    },
    {
      kind: "select",
      key: "palet",
      label: "Palet",
      options: [
        { value: "archief", label: "Archief" },
        { value: "krijt", label: "Krijt" },
        { value: "getij", label: "Getij" },
        { value: "bloed", label: "Bloed" },
      ],
    },
  ],
};
