import {
  bool,
  clamp,
  num,
  type Params,
  type Pointer,
  type Sim,
  type SimSpec,
  type Stage,
} from "../sim";

/**
 * Boids (Reynolds, 1986). Drie regels per vogel — scheiding, uitlijning,
 * cohesie — en verder niets. Geen leider, geen route, geen plan.
 *
 * De buren worden opgezocht via een rooster met celgrootte gelijk aan de
 * zichtstraal, zodat elke vogel maar negen cellen hoeft af te lopen in
 * plaats van de hele zwerm.
 */
class Zwerm implements Sim {
  private x = new Float32Array(0);
  private y = new Float32Array(0);
  private vx = new Float32Array(0);
  private vy = new Float32Array(0);
  private count = 0;

  // Rooster voor het opzoeken van buren.
  private cellSize = 1;
  private cols = 1;
  private rows = 1;
  private cellStart = new Int32Array(0);
  private cellItems = new Int32Array(0);
  private cellCount = new Int32Array(0);

  init(stage: Stage, params: Params): void {
    const { width, height, random } = stage;
    this.count = Math.round(num(params, "aantal", 520));

    this.x = new Float32Array(this.count);
    this.y = new Float32Array(this.count);
    this.vx = new Float32Array(this.count);
    this.vy = new Float32Array(this.count);

    const speed = num(params, "snelheid", 90);
    for (let i = 0; i < this.count; i++) {
      this.x[i] = random() * width;
      this.y[i] = random() * height;
      const angle = random() * Math.PI * 2;
      this.vx[i] = Math.cos(angle) * speed;
      this.vy[i] = Math.sin(angle) * speed;
    }

    stage.ctx.fillStyle = "#0b0c0e";
    stage.ctx.fillRect(0, 0, width, height);
  }

  /** Verdeelt alle vogels over het rooster (tellen, dan plaatsen). */
  private buildGrid(width: number, height: number, radius: number): void {
    this.cellSize = Math.max(radius, 8);
    this.cols = Math.max(1, Math.ceil(width / this.cellSize));
    this.rows = Math.max(1, Math.ceil(height / this.cellSize));
    const cells = this.cols * this.rows;

    if (this.cellCount.length !== cells + 1) {
      this.cellCount = new Int32Array(cells + 1);
      this.cellStart = new Int32Array(cells + 1);
    } else {
      this.cellCount.fill(0);
    }
    if (this.cellItems.length !== this.count) {
      this.cellItems = new Int32Array(this.count);
    }

    for (let i = 0; i < this.count; i++) {
      this.cellCount[this.cellIndex(this.x[i], this.y[i])]++;
    }
    let running = 0;
    for (let c = 0; c <= cells; c++) {
      this.cellStart[c] = running;
      running += this.cellCount[c];
      this.cellCount[c] = 0;
    }
    for (let i = 0; i < this.count; i++) {
      const c = this.cellIndex(this.x[i], this.y[i]);
      this.cellItems[this.cellStart[c] + this.cellCount[c]] = i;
      this.cellCount[c]++;
    }
  }

  private cellIndex(x: number, y: number): number {
    const cx = clamp(Math.floor(x / this.cellSize), 0, this.cols - 1);
    const cy = clamp(Math.floor(y / this.cellSize), 0, this.rows - 1);
    return cy * this.cols + cx;
  }

  step(stage: Stage, params: Params, dt: number, pointer: Pointer | null): void {
    const { ctx, width, height } = stage;

    const radius = num(params, "zicht", 52);
    const separation = num(params, "scheiding", 1.4);
    const alignment = num(params, "uitlijning", 3.2);
    const cohesion = num(params, "cohesie", 1.8);
    const speed = num(params, "snelheid", 90);
    const trail = num(params, "sporen", 0.14);
    const showLinks = bool(params, "verbindingen", false);

    this.buildGrid(width, height, radius);

    const r2 = radius * radius;
    const sepRadius = radius * 0.42;
    const sep2 = sepRadius * sepRadius;

    // Sporen: het canvas wordt niet gewist maar met een vleugje zwart
    // overgoten, zodat elke vogel een vervagende staart achterlaat.
    ctx.fillStyle = `rgba(11, 12, 14, ${clamp(trail, 0.02, 1)})`;
    ctx.fillRect(0, 0, width, height);

    if (showLinks) {
      ctx.strokeStyle = "rgba(233, 162, 59, 0.055)";
      ctx.lineWidth = 1;
      ctx.beginPath();
    }

    for (let i = 0; i < this.count; i++) {
      const px = this.x[i];
      const py = this.y[i];

      let sepX = 0;
      let sepY = 0;
      let aliX = 0;
      let aliY = 0;
      let cohX = 0;
      let cohY = 0;
      let neighbours = 0;

      const cx = clamp(Math.floor(px / this.cellSize), 0, this.cols - 1);
      const cy = clamp(Math.floor(py / this.cellSize), 0, this.rows - 1);

      for (let oy = -1; oy <= 1; oy++) {
        const gy = cy + oy;
        if (gy < 0 || gy >= this.rows) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const gx = cx + ox;
          if (gx < 0 || gx >= this.cols) continue;

          const cell = gy * this.cols + gx;
          const start = this.cellStart[cell];
          const end = start + this.cellCount[cell];

          for (let k = start; k < end; k++) {
            const j = this.cellItems[k];
            if (j === i) continue;

            const dx = this.x[j] - px;
            const dy = this.y[j] - py;
            const d2 = dx * dx + dy * dy;
            if (d2 > r2 || d2 === 0) continue;

            neighbours++;
            aliX += this.vx[j];
            aliY += this.vy[j];
            cohX += this.x[j];
            cohY += this.y[j];

            if (d2 < sep2) {
              // Wegduwen, sterker naarmate de buur dichterbij zit.
              const d = Math.sqrt(d2);
              sepX -= (dx / d) * (1 - d / sepRadius);
              sepY -= (dy / d) * (1 - d / sepRadius);
            }

            if (showLinks && j > i && d2 < sep2 * 2.2) {
              ctx.moveTo(px, py);
              ctx.lineTo(this.x[j], this.y[j]);
            }
          }
        }
      }

      let ax = 0;
      let ay = 0;

      if (neighbours > 0) {
        aliX = aliX / neighbours - this.vx[i];
        aliY = aliY / neighbours - this.vy[i];
        cohX = cohX / neighbours - px;
        cohY = cohY / neighbours - py;

        ax += aliX * alignment;
        ay += aliY * alignment;
        ax += cohX * cohesion;
        ay += cohY * cohesion;
      }

      ax += sepX * separation * speed * 1.6;
      ay += sepY * separation * speed * 1.6;

      // De aanwijzer werkt als roofvogel: iedereen eromheen.
      if (pointer && pointer.down) {
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const d2 = dx * dx + dy * dy;
        const range = 160;
        if (d2 < range * range && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const force = (1 - d / range) * speed * 9;
          ax += (dx / d) * force;
          ay += (dy / d) * force;
        }
      }

      let nvx = this.vx[i] + ax * dt;
      let nvy = this.vy[i] + ay * dt;

      // Constante kruissnelheid: alleen de richting mag veranderen.
      const mag = Math.hypot(nvx, nvy) || 1;
      nvx = (nvx / mag) * speed;
      nvy = (nvy / mag) * speed;

      this.vx[i] = nvx;
      this.vy[i] = nvy;

      let nx = px + nvx * dt;
      let ny = py + nvy * dt;

      // De rand bestaat niet: wie eruit vliegt komt er aan de andere kant in.
      if (nx < 0) nx += width;
      else if (nx >= width) nx -= width;
      if (ny < 0) ny += height;
      else if (ny >= height) ny -= height;

      this.x[i] = nx;
      this.y[i] = ny;
    }

    if (showLinks) ctx.stroke();

    // Tekenen gebeurt in één pad per kleurgroep; per vogel een pad opzetten
    // is bij duizend stuks merkbaar trager.
    this.draw(ctx);
  }

  private draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#e9e4da";
    ctx.beginPath();
    for (let i = 0; i < this.count; i++) {
      const vx = this.vx[i];
      const vy = this.vy[i];
      const mag = Math.hypot(vx, vy) || 1;
      const ux = vx / mag;
      const uy = vy / mag;

      const x = this.x[i];
      const y = this.y[i];
      const len = 5.2;
      const wing = 2.0;

      // Een pijlpunt in de vliegrichting.
      ctx.moveTo(x + ux * len, y + uy * len);
      ctx.lineTo(x - ux * len * 0.6 - uy * wing, y - uy * len * 0.6 + ux * wing);
      ctx.lineTo(x - ux * len * 0.6 + uy * wing, y - uy * len * 0.6 - ux * wing);
      ctx.closePath();
    }
    ctx.fill();
  }
}

export const zwermSpec: SimSpec = {
  create: () => new Zwerm(),
  background: "#0b0c0e",
  pointerHint: "Klik en sleep om de zwerm op te schrikken.",
  defaults: {
    aantal: 520,
    zicht: 52,
    scheiding: 1.4,
    uitlijning: 3.2,
    cohesie: 1.8,
    snelheid: 90,
    sporen: 0.14,
    verbindingen: false,
  },
  controls: [
    {
      kind: "slider",
      key: "aantal",
      label: "Aantal vogels",
      min: 60,
      max: 1400,
      step: 20,
      resets: true,
    },
    { kind: "slider", key: "zicht", label: "Zichtstraal", min: 14, max: 120, step: 1 },
    { kind: "slider", key: "scheiding", label: "Scheiding", min: 0, max: 4, step: 0.05 },
    { kind: "slider", key: "uitlijning", label: "Uitlijning", min: 0, max: 8, step: 0.1 },
    { kind: "slider", key: "cohesie", label: "Cohesie", min: 0, max: 6, step: 0.05 },
    { kind: "slider", key: "snelheid", label: "Snelheid", min: 20, max: 220, step: 5 },
    {
      kind: "slider",
      key: "sporen",
      label: "Sporen",
      min: 0.02,
      max: 1,
      step: 0.02,
      format: (v) => (v >= 0.99 ? "geen" : v.toFixed(2)),
    },
    { kind: "toggle", key: "verbindingen", label: "Toon buren" },
  ],
};
