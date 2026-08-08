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
 * Elementaire cellulaire automaten (Wolfram). Een rij cellen, elk zwart of
 * wit. De volgende rij volgt uit een tabel: voor elk van de acht mogelijke
 * combinaties van een cel en haar twee buren staat vast wat eruit komt.
 *
 * Acht uitkomsten van elk één bit — dat zijn 256 mogelijke regels, en het
 * nummer van de regel ís die tabel, uitgeschreven als byte.
 */
class Regel implements Sim {
  private cells = new Uint8Array(0);
  private next = new Uint8Array(0);
  private width = 0;
  private cell = 4;
  private row = 0;
  private rows = 0;
  private accumulator = 0;

  init(stage: Stage, params: Params): void {
    const { ctx, random } = stage;

    this.cell = Math.round(num(params, "celgrootte", 4));
    this.width = Math.max(8, Math.floor(stage.width / this.cell));
    this.rows = Math.max(1, Math.floor(stage.height / this.cell));

    this.cells = new Uint8Array(this.width);
    this.next = new Uint8Array(this.width);
    this.row = 0;
    this.accumulator = 0;

    if (str(params, "start", "punt") === "willekeurig") {
      for (let i = 0; i < this.width; i++) this.cells[i] = random() < 0.5 ? 1 : 0;
    } else {
      // Eén levende cel in het midden. Alles wat volgt komt hieruit voort.
      this.cells[this.width >> 1] = 1;
    }

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, stage.width, stage.height);
  }

  step(stage: Stage, params: Params, dt: number, pointer: Pointer | null): void {
    const rule = Math.round(num(params, "regel", 30)) & 255;
    const rowsPerSecond = num(params, "tempo", 18);

    if (pointer && pointer.started) {
      // Aantikken zet een cel aan in de rij die nu getekend wordt.
      const i = Math.floor((pointer.x / stage.width) * this.width);
      if (i >= 0 && i < this.width) this.cells[i] ^= 1;
    }

    this.accumulator += dt * rowsPerSecond;
    const budget = Math.min(Math.floor(this.accumulator), this.rows);
    this.accumulator -= budget;
    if (budget === 0) return;

    // Als het beeld vol raakt schuift het omhoog. Dat gebeurt hooguit één keer
    // per frame: het canvas over zichzelf heen kopiëren is te duur om per rij
    // te doen bij een hoog tempo.
    const overflow = this.row + budget - this.rows;
    if (overflow > 0) {
      this.scroll(stage, overflow * this.cell);
      this.row -= overflow;
    }

    for (let i = 0; i < budget; i++) this.advance(stage, params, rule);
  }

  private advance(stage: Stage, params: Params, rule: number): void {
    this.drawRow(stage, params);

    const { cells, next, width } = this;
    for (let i = 0; i < width; i++) {
      // De rij is een ring: de buitenste cellen zijn elkaars buur.
      const left = cells[(i - 1 + width) % width];
      const self = cells[i];
      const right = cells[(i + 1) % width];
      const pattern = (left << 2) | (self << 1) | right;
      next[i] = (rule >> pattern) & 1;
    }
    this.cells.set(next);
    this.row++;
  }

  private scroll(stage: Stage, shift: number): void {
    const { ctx, width, height, dpr } = stage;
    if (shift <= 0 || shift >= height) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(
      ctx.canvas,
      0,
      shift * dpr,
      width * dpr,
      (height - shift) * dpr,
      0,
      0,
      width * dpr,
      (height - shift) * dpr,
    );
    ctx.restore();

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, height - shift, width, shift);
  }

  private drawRow(stage: Stage, params: Params): void {
    const { ctx } = stage;
    const y = this.row * this.cell;
    const size = this.cell;
    const gap = bool(params, "raster", false) && size >= 4 ? 1 : 0;

    ctx.fillStyle = str(params, "kleur", "warm") === "warm" ? "#e9a23b" : "#e9e4da";
    for (let i = 0; i < this.width; i++) {
      if (this.cells[i]) ctx.fillRect(i * size, y, size - gap, size - gap);
    }
  }
}

export const regelSpec: SimSpec = {
  create: () => new Regel(),
  background: "#0b0c0e",
  pointerHint: "Klik om een cel in de huidige rij om te zetten.",
  defaults: {
    regel: 30,
    celgrootte: 3,
    start: "punt",
    tempo: 18,
    kleur: "warm",
    raster: false,
  },
  controls: [
    {
      kind: "slider",
      key: "regel",
      label: "Regelnummer",
      min: 0,
      max: 255,
      step: 1,
      resets: true,
      format: (v) => `${v} · ${(v & 255).toString(2).padStart(8, "0")}`,
    },
    {
      kind: "select",
      key: "start",
      label: "Beginrij",
      options: [
        { value: "punt", label: "Eén cel" },
        { value: "willekeurig", label: "Willekeurig" },
      ],
      resets: true,
    },
    {
      kind: "slider",
      key: "celgrootte",
      label: "Celgrootte",
      min: 1,
      max: 10,
      step: 1,
      resets: true,
      format: (v) => `${v} px`,
    },
    {
      kind: "slider",
      key: "tempo",
      label: "Rijen per seconde",
      min: 4,
      max: 240,
      step: 4,
    },
    {
      kind: "select",
      key: "kleur",
      label: "Kleur",
      options: [
        { value: "warm", label: "Amber" },
        { value: "krijt", label: "Krijt" },
      ],
    },
    { kind: "toggle", key: "raster", label: "Rasterlijnen" },
  ],
};
