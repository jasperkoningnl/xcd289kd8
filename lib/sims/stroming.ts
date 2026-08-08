import {
  Noise,
  bool,
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
 * Een stromingsveld. Achter het beeld ligt een onzichtbaar veld van hoeken,
 * afgeleid uit ruis. Duizenden deeltjes doen niets anders dan: kijk welke
 * hoek hier geldt, zet een stap die kant op, teken het lijnstuk.
 *
 * Er staat nergens hoe de tekening eruit moet zien.
 */

const PALETTES: Record<string, [number, number, number][]> = {
  as: [
    [70, 74, 82],
    [140, 146, 154],
    [206, 208, 204],
    [246, 244, 238],
  ],
  amber: [
    [92, 40, 12],
    [176, 88, 26],
    [233, 162, 59],
    [252, 226, 176],
  ],
  getij: [
    [16, 52, 74],
    [32, 116, 140],
    [110, 178, 176],
    [214, 236, 226],
  ],
  vuur: [
    [66, 14, 30],
    [162, 36, 46],
    [232, 118, 52],
    [250, 214, 150],
  ],
};

type Deeltje = { x: number; y: number; life: number; tint: number };

class Stroming implements Sim {
  private noise: Noise | null = null;
  private particles: Deeltje[] = [];
  private stops: [number, number, number][] = PALETTES.as;
  private time = 0;

  init(stage: Stage, params: Params): void {
    const { ctx, width, height, random } = stage;

    this.noise = new Noise(random);
    this.time = 0;

    const count = Math.round(num(params, "aantal", 900));
    this.particles = new Array(count);
    for (let i = 0; i < count; i++) {
      this.particles[i] = {
        x: random() * width,
        y: random() * height,
        life: random() * 260,
        tint: random(),
      };
    }

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, width, height);
  }

  /** De hoek die op deze plek geldt. */
  private angle(x: number, y: number, scale: number, drift: number): number {
    const n = this.noise;
    if (!n) return 0;
    const v = n.fractal(x * scale + this.time * drift, y * scale, 3);
    // Ruim twee omwentelingen, zodat het veld ook echt draait.
    return v * Math.PI * 4;
  }

  step(stage: Stage, params: Params, dt: number, pointer: Pointer | null): void {
    const { ctx, width, height, random } = stage;

    const scale = num(params, "schaal", 0.0032);
    const speed = num(params, "snelheid", 46);
    const lineWidth = num(params, "penseel", 1);
    const fade = num(params, "vervaging", 0);
    const drift = num(params, "verloop", 0);
    const lifespan = num(params, "levensduur", 260);
    const wrap = bool(params, "randloos", true);

    this.stops = PALETTES[str(params, "palet", "as")] ?? PALETTES.as;
    this.time += dt;

    if (fade > 0) {
      ctx.fillStyle = `rgba(11, 12, 14, ${fade})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    const stepLength = speed * Math.min(dt, 1 / 30);

    for (const p of this.particles) {
      const a = this.angle(p.x, p.y, scale, drift);
      let dx = Math.cos(a);
      let dy = Math.sin(a);

      // De aanwijzer duwt het veld opzij binnen een straal.
      if (pointer && pointer.down) {
        const ox = p.x - pointer.x;
        const oy = p.y - pointer.y;
        const d = Math.hypot(ox, oy);
        if (d < 180 && d > 0.001) {
          const push = (1 - d / 180) * 2.2;
          dx += (ox / d) * push;
          dy += (oy / d) * push;
        }
      }

      const nx = p.x + dx * stepLength;
      const ny = p.y + dy * stepLength;

      const [r, g, b] = ramp(this.stops, p.tint);
      const alpha = 0.055 + 0.1 * (1 - p.life / lifespan);
      ctx.strokeStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha.toFixed(3)})`;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      p.x = nx;
      p.y = ny;
      p.life += 1;

      const outside = p.x < 0 || p.x >= width || p.y < 0 || p.y >= height;

      if (outside && wrap) {
        // Aan de andere kant weer naar binnen; het spoor blijft staan.
        if (p.x < 0) p.x += width;
        else if (p.x >= width) p.x -= width;
        if (p.y < 0) p.y += height;
        else if (p.y >= height) p.y -= height;
      } else if (outside || p.life > lifespan) {
        p.x = random() * width;
        p.y = random() * height;
        p.life = 0;
        p.tint = random();
      }
    }
  }
}

export const stromingSpec: SimSpec = {
  create: () => new Stroming(),
  background: "#0b0c0e",
  pointerHint: {
    nl: "Klik en sleep om de stroom te verstoren.",
    en: "Click and drag to disturb the current.",
  },
  defaults: {
    aantal: 900,
    schaal: 0.0032,
    snelheid: 46,
    penseel: 1,
    vervaging: 0,
    verloop: 0,
    levensduur: 260,
    palet: "as",
    randloos: true,
  },
  controls: [
    {
      kind: "slider",
      key: "aantal",
      label: { nl: "Aantal deeltjes", en: "Number of particles" },
      min: 100,
      max: 4000,
      step: 50,
      resets: true,
    },
    {
      kind: "slider",
      key: "schaal",
      label: { nl: "Schaal van het veld", en: "Scale of the field" },
      min: 0.0006,
      max: 0.012,
      step: 0.0002,
      format: (v, locale) => decimal(v, locale, 4),
    },
    {
      kind: "slider",
      key: "snelheid",
      label: { nl: "Snelheid", en: "Speed" },
      min: 8,
      max: 160,
      step: 2,
    },
    {
      kind: "slider",
      key: "penseel",
      label: { nl: "Penseelbreedte", en: "Brush width" },
      min: 0.3,
      max: 4,
      step: 0.1,
      format: (v, locale) => `${decimal(v, locale, 1)} px`,
    },
    {
      kind: "slider",
      key: "levensduur",
      label: { nl: "Levensduur", en: "Lifespan" },
      min: 30,
      max: 900,
      step: 10,
      format: (v, locale) => (locale === "nl" ? `${v} stappen` : `${v} steps`),
    },
    {
      kind: "slider",
      key: "verloop",
      label: { nl: "Verloop in de tijd", en: "Drift over time" },
      min: 0,
      max: 0.35,
      step: 0.01,
      format: (v, locale) =>
        v === 0
          ? locale === "nl"
            ? "stilstaand"
            : "static"
          : decimal(v, locale, 2),
    },
    {
      kind: "slider",
      key: "vervaging",
      label: { nl: "Vervaging", en: "Fade" },
      min: 0,
      max: 0.12,
      step: 0.005,
      format: (v, locale) =>
        v === 0 ? (locale === "nl" ? "geen" : "none") : decimal(v, locale, 3),
    },
    {
      kind: "select",
      key: "palet",
      label: { nl: "Palet", en: "Palette" },
      options: [
        { value: "as", label: { nl: "As", en: "Ash" } },
        { value: "amber", label: { nl: "Amber", en: "Amber" } },
        { value: "getij", label: { nl: "Getij", en: "Tide" } },
        { value: "vuur", label: { nl: "Vuur", en: "Fire" } },
      ],
    },
    {
      kind: "toggle",
      key: "randloos",
      label: { nl: "Randloos vlak", en: "Wrap at the edges" },
    },
  ],
};
